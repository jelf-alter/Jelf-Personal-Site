import { IDemoApplication, IPipelineExecution, IDataset } from '../types/index.js';
import { webSocketService } from './WebSocketService.js';

export class DemoService {
  private demos: IDemoApplication[] = [
    {
      id: 'elt-pipeline',
      name: 'ELT Data Pipeline',
      description: 'Interactive demonstration of Extract, Load, Transform data processing with real-time visualization',
      category: 'Data Engineering',
      technologies: ['TypeScript', 'Node.js', 'Vue.js', 'WebSocket'],
      status: 'active',
      launchUrl: '/demos/elt-pipeline',
      sourceUrl: 'https://github.com/your-username/personal-website',
      testSuiteId: 'elt-pipeline-tests',
    },
    {
      id: 'testing-dashboard',
      name: 'Testing Dashboard',
      description: 'Real-time testing dashboard showing test progress, coverage metrics, and results',
      category: 'Testing & Quality',
      technologies: ['TypeScript', 'Vue.js', 'Vitest', 'WebSocket'],
      status: 'active',
      launchUrl: '/testing',
      testSuiteId: 'testing-dashboard-tests',
    },
  ];

  private sampleDatasets: IDataset[] = [
    {
      id: 'sales-data',
      name: 'Sales Data Sample',
      description: 'Sample e-commerce sales data for transformation demonstration',
      size: 1024,
      format: 'JSON',
      schema: {
        fields: ['id', 'product', 'quantity', 'price', 'date', 'customer'],
        types: ['string', 'string', 'number', 'number', 'date', 'string'],
      },
    },
    {
      id: 'user-analytics',
      name: 'User Analytics Data',
      description: 'Sample user behavior analytics data',
      size: 2048,
      format: 'JSON',
      schema: {
        fields: ['userId', 'sessionId', 'action', 'timestamp', 'metadata'],
        types: ['string', 'string', 'string', 'date', 'object'],
      },
    },
  ];

  private pipelineExecutions: Map<string, IPipelineExecution> = new Map();

  async getAllDemos(): Promise<IDemoApplication[]> {
    return this.demos;
  }

  async getDemoById(id: string): Promise<IDemoApplication | null> {
    return this.demos.find(demo => demo.id === id) || null;
  }

  async getSampleDatasets(): Promise<IDataset[]> {
    return this.sampleDatasets;
  }

  async executeELTPipeline(datasetId: string, config?: any): Promise<IPipelineExecution> {
    const dataset = this.sampleDatasets.find(d => d.id === datasetId);
    if (!dataset) {
      throw new Error('Dataset not found');
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: IPipelineExecution = {
      id: executionId,
      datasetId,
      status: 'running',
      startTime: new Date(),
      steps: [
        {
          id: 'extract',
          name: 'Extract Data',
          status: 'running',
          progress: 0,
          startTime: new Date(),
        },
        {
          id: 'load',
          name: 'Load Data',
          status: 'pending',
          progress: 0,
        },
        {
          id: 'transform',
          name: 'Transform Data',
          status: 'pending',
          progress: 0,
        },
      ],
      config: config || {},
    };

    this.pipelineExecutions.set(executionId, execution);

    // Simulate pipeline execution
    this.simulatePipelineExecution(executionId);

    return execution;
  }

  async getPipelineStatus(executionId: string): Promise<IPipelineExecution | null> {
    return this.pipelineExecutions.get(executionId) || null;
  }

  private async simulatePipelineExecution(executionId: string): Promise<void> {
    const execution = this.pipelineExecutions.get(executionId);
    if (!execution) return;

    // Broadcast pipeline started
    webSocketService.broadcastPipelineUpdate(executionId, {
      type: 'pipeline_started',
      execution: { ...execution }
    });

    // Simulate Extract step
    await this.simulateStep(executionId, 'extract', 2000);
    
    // Simulate Load step
    await this.simulateStep(executionId, 'load', 1500);
    
    // Simulate Transform step
    await this.simulateStep(executionId, 'transform', 2500);

    // Mark execution as completed
    execution.status = 'completed';
    execution.endTime = new Date();
    execution.outputData = {
      recordsProcessed: 1000,
      transformationsApplied: 5,
      outputFormat: 'JSON',
      summary: 'Pipeline executed successfully',
    };

    // Broadcast pipeline completed
    webSocketService.broadcastPipelineUpdate(executionId, {
      type: 'pipeline_completed',
      execution: { ...execution }
    });
  }

  private async simulateStep(executionId: string, stepId: string, duration: number): Promise<void> {
    const execution = this.pipelineExecutions.get(executionId);
    if (!execution) return;

    const step = execution.steps.find(s => s.id === stepId);
    if (!step) return;

    step.status = 'running';
    step.startTime = new Date();

    // Broadcast step started
    webSocketService.broadcastPipelineUpdate(executionId, {
      type: 'step_started',
      step: { ...step },
      execution: { ...execution }
    });

    // Simulate progress updates
    const progressInterval = duration / 10;
    for (let i = 0; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, progressInterval));
      step.progress = i * 10;
      
      // Broadcast progress update
      webSocketService.broadcastPipelineUpdate(executionId, {
        type: 'progress_update',
        step: { ...step },
        execution: { ...execution }
      });
    }

    step.status = 'completed';
    step.endTime = new Date();
    step.progress = 100;

    // Generate sample output data based on step
    switch (stepId) {
      case 'extract':
        step.outputData = { recordsExtracted: 1000, source: 'sample-database' };
        break;
      case 'load':
        step.outputData = { recordsLoaded: 1000, destination: 'staging-area' };
        break;
      case 'transform':
        step.outputData = { recordsTransformed: 1000, transformations: ['normalize', 'validate', 'enrich'] };
        break;
    }

    // Broadcast step completed
    webSocketService.broadcastPipelineUpdate(executionId, {
      type: 'step_completed',
      step: { ...step },
      execution: { ...execution }
    });

    // Start next step
    const currentIndex = execution.steps.findIndex(s => s.id === stepId);
    if (currentIndex < execution.steps.length - 1) {
      const nextStep = execution.steps[currentIndex + 1];
      if (nextStep) {
        nextStep.status = 'running';
      }
    }
  }
}