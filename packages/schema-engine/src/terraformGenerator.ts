/**
 * Automated Infrastructure-as-Code (Terraform & Docker Compose) Generator
 */

export interface IaCManifests {
  terraform: string;
  dockerCompose: string;
  componentCount: number;
}

export function generateIaCFromMermaid(mermaidCode: string): IaCManifests {
  // Extract node IDs and labels across brackets [], cylinders [()], rounded (), and stadiums ([])
  const nodeRegex = /([a-zA-Z0-9_-]+)(?:\[\(?|\[|\()(?:"|')?([^"'\]\)\n]+)(?:"|')?(?:\]\)?|\]|\))/g;
  const nodes: { id: string; label: string }[] = [];
  let match;

  while ((match = nodeRegex.exec(mermaidCode)) !== null) {
    const rawId = match[1];
    let label = match[2].trim().replace(/^[\(\["']+|[\)\]"']+$/g, '');
    if (rawId.toLowerCase() !== 'subgraph' && rawId.toLowerCase() !== 'style') {
      nodes.push({ id: rawId, label });
    }
  }

  // Deduplicate
  const uniqueNodes = Array.from(new Map(nodes.map((n) => [n.id, n])).values());

  // Generate Terraform HCL
  const tfResources = uniqueNodes.map((n) => {
    const safeName = n.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const labelLower = n.label.toLowerCase();

    if (labelLower.includes('database') || labelLower.includes('postgres') || labelLower.includes('db') || safeName.includes('db')) {
      return `resource "aws_db_instance" "${safeName}" {
  identifier           = "${safeName}-production"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t4g.medium"
  allocated_storage    = 50
  publicly_accessible  = false
  skip_final_snapshot  = true
  tags = {
    Component = "${n.label}"
    ManagedBy = "Cadence-Architect"
  }
}`;
    } else if (labelLower.includes('redis') || labelLower.includes('cache') || safeName.includes('cache')) {
      return `resource "aws_elasticache_cluster" "${safeName}" {
  cluster_id           = "${safeName}-cache"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  tags = {
    Component = "${n.label}"
    ManagedBy = "Cadence-Architect"
  }
}`;
    } else if (labelLower.includes('kafka') || safeName.includes('kafka') || safeName.includes('topic')) {
      return `resource "aws_msk_cluster" "${safeName}" {
  cluster_name           = "${safeName}-stream"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3
  broker_node_group_info {
    instance_type = "kafka.m5.large"
    client_subnets = ["subnet-0123456789abcdef0"]
  }
}`;
    } else {
      return `resource "aws_ecs_service" "${safeName}" {
  name            = "${safeName}-service"
  cluster         = "cadence-cluster"
  task_definition = "arn:aws:ecs:us-east-1:123456789012:task-definition/${safeName}"
  desired_count   = 2
  launch_type     = "FARGATE"
  tags = {
    Component = "${n.label}"
    ManagedBy = "Cadence-Architect"
  }
}`;
    }
  });

  const terraformHcl = `# Generated autonomously by Cadence Architecture Engine
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# --- Infrastructure Topologies ---
${tfResources.join('\n\n')}
`;

  // Generate Docker Compose YAML
  const composeServices = uniqueNodes.map((n) => {
    const safeName = n.id.toLowerCase().replace(/[^a-z0-9_]/g, '-');
    const labelLower = n.label.toLowerCase();
    let image = 'alpine:latest';
    let ports = '["8080:8080"]';

    if (labelLower.includes('postgres') || labelLower.includes('db')) {
      image = 'postgres:16-alpine';
      ports = '["5432:5432"]';
    } else if (labelLower.includes('redis') || labelLower.includes('cache')) {
      image = 'redis:7-alpine';
      ports = '["6379:6379"]';
    } else if (labelLower.includes('kafka')) {
      image = 'confluentinc/cp-kafka:7.5.0';
      ports = '["9092:9092"]';
    }

    return `  ${safeName}:
    image: ${image}
    container_name: cadence-${safeName}
    ports:
      - ${ports}
    environment:
      - CADENCE_COMPONENT=${n.label}
    restart: unless-stopped`;
  });

  const dockerComposeYaml = `# Generated autonomously by Cadence Architecture Engine
version: '3.8'

services:
${composeServices.join('\n')}
`;

  return {
    terraform: terraformHcl,
    dockerCompose: dockerComposeYaml,
    componentCount: uniqueNodes.length
  };
}
