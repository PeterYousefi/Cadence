/**
 * Architecture Preset Catalog for Instant Seeding
 */

export const ARCHITECTURE_PRESETS = [
  {
    id: 'kafka',
    title: 'Event-Driven Kafka',
    badge: 'Streaming & CQRS',
    color: '#06b6d4',
    description: 'High-throughput microservices architecture with Kafka cluster, Schema Registry, and Flink analytics.',
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
    title: 'Serverless Edge SaaS',
    badge: 'Multi-Region Edge',
    color: '#10b981',
    description: 'Ultra-low latency serverless SaaS topology on Cloudflare Workers, Supabase PostgreSQL, and Upstash Redis.',
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
    NextEdge --> SupabasePool["Supabase PgBouncer Connection Pool"]
    SupabasePool --> PostgresPrimary[("PostgreSQL Primary (Multi-AZ)")]
    PostgresPrimary -.-> PostgresReplica[("Read Replica")]
    NextEdge --> S3Storage[("Cloudflare R2 Object Storage")]
  end

  style EdgeWorkers fill:#047857,stroke:#34d399,stroke-width:2px,color:#fff
  style RedisRateLimit fill:#be123c,stroke:#fb7185,stroke-width:2px,color:#fff
  style PostgresPrimary fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#fff`
  },
  {
    id: 'ai-pipeline',
    title: 'Real-Time AI Pipeline',
    badge: 'Voice & Multimodal',
    color: '#8b5cf6',
    description: 'Sub-second speech-to-speech voice agent pipeline powered by Boson AI, Vector RAG, and WebSockets.',
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
  }
];
