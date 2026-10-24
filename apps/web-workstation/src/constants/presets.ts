import { ArchitecturePreset } from '../types/cadence';

export const ARCHITECTURE_PRESETS: ArchitecturePreset[] = [
  {
    id: 'kafka',
    title: 'Kafka Streaming',
    badge: 'Event-Driven',
    color: '#06b6d4',
    description: 'High-throughput event streaming with Kafka cluster, Schema Registry, Flink stream processing, and ClickHouse.',
    mermaid: `graph TD
  subgraph Ingestion ["Ingestion & Edge Tier"]
    ClientApp["Mobile / Web Clients"] --> APIGateway["Envoy API Gateway"]
    APIGateway --> ProducerSvc["Ingestion Producer Service"]
  end

  subgraph Messaging ["Apache Kafka Event Backbone"]
    ProducerSvc --> TopicOrders["Topic: orders.v1"]
    ProducerSvc --> TopicUsers["Topic: users.v1"]
    SchemaRegistry["Confluent Schema Registry"] -.-> ProducerSvc
    SchemaRegistry -.-> ConsumerSvc["Order Fulfillment Worker"]
  end

  subgraph Processing ["Stream & Persistence Tier"]
    TopicOrders --> ConsumerSvc
    TopicOrders --> FlinkJob["Apache Flink Real-time Analytics"]
    ConsumerSvc --> PostgresDB[("PostgreSQL Transactional DB")]
    FlinkJob --> ClickHouseDB[("ClickHouse OLAP Storage")]
    ClickHouseDB --> Grafana["Grafana Real-time Dashboard"]
  end

  style TopicOrders fill:#0e7490,stroke:#06b6d4,stroke-width:2px,color:#fff
  style FlinkJob fill:#7c3aed,stroke:#a78bfa,stroke-width:2px,color:#fff
  style PostgresDB fill:#15803d,stroke:#4ade80,stroke-width:2px,color:#fff
  style ClickHouseDB fill:#b45309,stroke:#fbbf24,stroke-width:2px,color:#fff`
  },
  {
    id: 'serverless',
    title: 'Edge Serverless',
    badge: 'Multi-Region',
    color: '#10b981',
    description: 'Zero-cold-start edge microservices topology on Cloudflare Workers, Upstash Redis, and Supabase PostgreSQL.',
    mermaid: `graph TD
  subgraph Edge ["Global Edge Tier"]
    GlobalUsers["Global End Users"] --> CloudflareDNS["Cloudflare Anycast DNS"]
    CloudflareDNS --> EdgeWorkers["Cloudflare Workers (Edge SSR)"]
    EdgeWorkers --> Auth0["Auth0 Identity Provider"]
  end

  subgraph Compute ["Serverless Compute & Middleware"]
    EdgeWorkers --> NextEdge["Next.js App Router (Vercel Edge)"]
    NextEdge --> StripeWebhook["Stripe Billing & Webhooks"]
    NextEdge --> RedisRateLimit[("Upstash Redis Cache & Rate Limiting")]
  end

  subgraph Data ["Resilient Storage Tier"]
    NextEdge --> SupabasePool["Supabase Connection Pool"]
    SupabasePool --> PostgresPrimary[("PostgreSQL Primary (Multi-AZ)")]
    PostgresPrimary -.-> PostgresReplica[("Read Replica")]
    NextEdge --> S3Storage[("Cloudflare R2 Object Storage")]
  end

  style EdgeWorkers fill:#047857,stroke:#34d399,stroke-width:2px,color:#fff
  style RedisRateLimit fill:#be123c,stroke:#fb7185,stroke-width:2px,color:#fff
  style PostgresPrimary fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#fff`
  },
  {
    id: 'rag-pipeline',
    title: 'RAG Pipeline',
    badge: 'Real-Time Voice',
    color: '#8b5cf6',
    description: 'Sub-second conversational RAG voice agent pipeline with Boson AI, Vector Database, and WebSocket canvas sync.',
    mermaid: `graph TD
  subgraph AudioClient ["Browser Client (Cadence)"]
    MicInput["User Microphone (24kHz Mono PCM)"] --> AudioRecorder["AudioRecorder Pipeline"]
    AudioRecorder --> BrowserWS["Browser WebSocket Client"]
    AudioPlayer["Web Audio Gapless Player"] --> Speaker["Audio Output"]
  end

  subgraph EdgeProxy ["Application Gateway"]
    BrowserWS <--> ProxyTokenServer["Cadence Express Proxy (Port 3001)"]
    ProxyTokenServer -. Ephemeral Secret .-> BrowserWS
  end

  subgraph BosonCloud ["Boson AI Real-Time Cloud Engine"]
    BrowserWS <== Duplex WebSocket ==> BosonWS["wss://api.boson.ai/v1/realtime"]
    BosonWS --> HiggsSTT["higgs-stt-3.1 Speech-to-Text"]
    HiggsSTT --> HiggsCore["higgs-realtime Conversational Model"]
    HiggsCore --> ToolExecutor["Tool Dispatcher: render_architecture"]
    HiggsCore --> HiggsTTS["higgs-tts Audio Synthesizer"]
    HiggsTTS ==> AudioPlayer
  end

  subgraph Knowledge ["Context & Topology Tier"]
    ToolExecutor --> CanvasState["Mermaid Reactive SVG Canvas"]
    ToolExecutor -. Vector Query .-> PineconeIndex[("Pinecone Architecture Embeddings")]
  end

  style BosonWS fill:#4c1d95,stroke:#8b5cf6,stroke-width:3px,color:#fff
  style ToolExecutor fill:#be185d,stroke:#f472b6,stroke-width:2px,color:#fff
  style CanvasState fill:#0e7490,stroke:#22d3ee,stroke-width:2px,color:#fff`
  },
  {
    id: 'auth-resilience',
    title: 'Auth Resilience',
    badge: 'Circuit Breaker',
    color: '#ef4444',
    description: 'Autonomous resolution of partitioned Auth service: Envoy circuit breaker trip, fallback JWKS validation, Transit Gateway route healing, and gradual half-open recovery.',
    mermaid: `graph TD
  subgraph Clients ["Client Traffic Tier"]
    ClientApps["Web & Mobile Apps"] --> CloudflareWAF["Cloudflare WAF / Edge Anycast"]
  end

  subgraph GatewayMesh ["Envoy Ingress & Circuit Breaker Tier"]
    CloudflareWAF --> EnvoyGateway["Envoy Gateway (Ingress)"]
    EnvoyGateway -. "CB_AUTH [HALF-OPEN // 10% Canary]" .-> AuthService["Auth Microservice (us-east-1b)"]
    EnvoyGateway --> FallbackAuth["Stateless JWKS JWT Fallback Engine"]
  end

  subgraph PartitionZone ["VPC Partition Zone (us-east-1b)"]
    AuthService -. "503 Network Timeout" .- OIDCProvider["External OIDC / IdP"]
    AuthService <--> RedisTokens[("Redis Token & Session Cache")]
    TransitGateway["AWS Transit Gateway (Route Tables Reconciled)"] === AuthService
  end

  subgraph CoreServices ["Protected Upstream Workloads"]
    EnvoyGateway --> OrderService["Order Fulfillment Service"]
    EnvoyGateway --> PaymentService["Payment Processing Engine"]
    OrderService --> PostgresPrimary[("PostgreSQL Multi-AZ Primary")]
  end

  style AuthService fill:#dc2626,stroke:#991b1b,stroke-width:2.5px,color:#fff
  style FallbackAuth fill:#008A4B,stroke:#15803d,stroke-width:2.5px,color:#fff
  style EnvoyGateway fill:#FF4F00,stroke:#c2410c,stroke-width:2.5px,color:#fff
  style TransitGateway fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff`
  }
];
