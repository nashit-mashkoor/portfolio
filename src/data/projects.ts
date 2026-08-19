export interface ProjectNode {
  id: string;
  label: string;
  category: string;
  description: string;
  links?: { github?: string; demo?: string };
  tags: string[];
}

export interface Connection {
  from: string;
  to: string;
}

export const projects: ProjectNode[] = [
  {
    id: 'cv-yolo',
    label: 'Real-Time Object Detection',
    category: 'computer-vision',
    description: 'YOLOv8-based pipeline for real-time inference on video streams with custom trained models.',
    tags: ['Python', 'YOLOv8', 'OpenCV', 'ONNX'],
    links: { github: '#' },
  },
  {
    id: 'cv-segmentation',
    label: 'Medical Image Segmentation',
    category: 'computer-vision',
    description: 'U-Net architecture for semantic segmentation of MRI scans achieving state-of-the-art Dice scores.',
    tags: ['PyTorch', 'U-Net', 'DICOM', 'MONAI'],
    links: { github: '#' },
  },
  {
    id: 'edge-tpu',
    label: 'Edge TPU Deployment',
    category: 'edge-ai',
    description: 'Optimized INT8 models for Coral Edge TPU — 10x speedup on classification tasks.',
    tags: ['TensorFlow Lite', 'Edge TPU', 'Python', 'Docker'],
    links: { github: '#' },
  },
  {
    id: 'edge-federated',
    label: 'Federated Learning Framework',
    category: 'edge-ai',
    description: 'Privacy-preserving ML across distributed edge devices with differential privacy guarantees.',
    tags: ['PySyft', 'Flower', 'Federated', 'Privacy'],
  },
  {
    id: 'mlops-pipeline',
    label: 'MLOps Pipeline',
    category: 'mlops',
    description: 'End-to-end ML pipeline with automated training, evaluation, and deployment via CI/CD.',
    tags: ['MLflow', 'Airflow', 'Docker', 'GitHub Actions'],
    links: { github: '#' },
  },
  {
    id: 'mlops-monitoring',
    label: 'Model Monitoring',
    category: 'mlops',
    description: 'Real-time model performance monitoring with drift detection and automated retraining triggers.',
    tags: ['Prometheus', 'Grafana', 'Evidently', 'Python'],
  },
  {
    id: 'cloud-inference',
    label: 'Scalable Inference API',
    category: 'cloud',
    description: 'Auto-scaling model serving on AWS Lambda with CloudFront — handles 10k+ requests/sec.',
    tags: ['AWS', 'Lambda', 'API Gateway', 'Terraform'],
    links: { github: '#' },
  },
  {
    id: 'cloud-training',
    label: 'Distributed Training Cluster',
    category: 'cloud',
    description: 'Spot instance cluster for distributed training — reduced costs by 70% vs on-demand.',
    tags: ['AWS', 'EC2', 'SageMaker', 'Spot'],
  },
  {
    id: 'genai-rag',
    label: 'RAG Pipeline',
    category: 'genai',
    description: 'Retrieval-augmented generation system with vector DB, semantic search, and streaming responses.',
    tags: ['LangChain', 'OpenAI', 'Pinecone', 'FastAPI'],
    links: { github: '#', demo: '#' },
  },
  {
    id: 'genai-agent',
    label: 'Autonomous Agent',
    category: 'genai',
    description: 'Multi-tool agent with planning, memory, and tool use — built from scratch with function calling.',
    tags: ['OpenAI', 'Tools', 'Memory', 'Python'],
    links: { github: '#' },
  },
];

export const categories = [
  { id: 'computer-vision', label: 'Computer Vision' },
  { id: 'edge-ai', label: 'Edge AI' },
  { id: 'mlops', label: 'MLOps' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'genai', label: 'GenAI' },
];

export function getConnections(): Connection[] {
  const connections: Connection[] = [];
  for (const cat of categories) {
    connections.push({ from: 'root', to: cat.id });
    for (const proj of projects) {
      if (proj.category === cat.id) {
        connections.push({ from: cat.id, to: proj.id });
      }
    }
  }
  return connections;
}
