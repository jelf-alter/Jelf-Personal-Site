// Demo Application Types
export interface IDemoApplication {
  id: string;
  name: string;
  description: string;
  category: string;
  technologies: string[];
  status: 'active' | 'maintenance' | 'archived';
  launchUrl: string;
  sourceUrl?: string;
  testSuiteId: string;
}

// Pipeline Types
export interface IPipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
}

export interface IPipelineExecution {
  id: string;
  datasetId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  steps: IPipelineStep[];
  config: any;
  outputData?: any;
  errorMessage?: string;
}

// Dataset Types
export interface IDataset {
  id: string;
  name: string;
  description: string;
  size: number;
  format: string;
  schema: {
    fields: string[];
    types: string[];
  };
}

// User Profile Types
export interface ISkill {
  name: string;
  level: number;
  category: string;
}

export interface IAchievement {
  title: string;
  description: string;
  date: Date;
}

export interface ISocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface IUserProfile {
  name: string;
  title: string;
  email: string;
  location: string;
  summary: string;
  skills: ISkill[];
  achievements: IAchievement[];
  socialLinks: ISocialLink[];
}

// Configuration Types
export interface IAppConfig {
  siteName: string;
  version: string;
  environment: string;
  features: {
    eltPipeline: boolean;
    testingDashboard: boolean;
    realTimeUpdates: boolean;
    publicTesting: boolean;
  };
  performance: {
    targetLCP: number;
    targetFID: number;
    targetCLS: number;
  };
  contact: {
    email: string;
    github: string;
    linkedin: string;
  };
}

export interface IDemoConfig {
  featured: string;
  categories: string[];
  defaultSettings: {
    showSourceCode: boolean;
    enableRealTime: boolean;
    publicAccess: boolean;
  };
}

export interface ITestingConfig {
  frameworks: string[];
  coverageThreshold: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  testTypes: string[];
  publicDashboard: boolean;
  realTimeUpdates: boolean;
}

// Test Result Types
export interface ICoverageMetrics {
  lines: { covered: number; total: number; percentage: number };
  branches: { covered: number; total: number; percentage: number };
  functions: { covered: number; total: number; percentage: number };
  statements: { covered: number; total: number; percentage: number };
}

export interface ITestResult {
  id: string;
  testName: string;
  suite: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  coverage: ICoverageMetrics;
  timestamp: Date;
  errorDetails?: string;
}

export interface ITestSuite {
  id: string;
  applicationId: string;
  name: string;
  testFiles: string[];
  coverage: ICoverageMetrics;
  lastRun: Date;
  status: 'passing' | 'failing' | 'unknown';
  results: ITestResult[];
}