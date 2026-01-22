import { IUserProfile, IAppConfig, IDemoConfig, ITestingConfig } from '../types/index.js';

export class ConfigService {
  private userProfile: IUserProfile = {
    name: 'Your Name',
    title: 'Full Stack Developer',
    email: 'your.email@example.com',
    location: 'Your Location',
    summary: 'Experienced developer specializing in modern web technologies and data processing solutions.',
    skills: [
      { name: 'TypeScript', level: 90, category: 'Programming Languages' },
      { name: 'Vue.js', level: 85, category: 'Frontend Frameworks' },
      { name: 'Node.js', level: 80, category: 'Backend Technologies' },
      { name: 'Data Processing', level: 75, category: 'Specializations' },
      { name: 'Testing', level: 85, category: 'Quality Assurance' },
    ],
    achievements: [
      {
        title: 'Full Stack Web Applications',
        description: 'Built and deployed multiple production web applications',
        date: new Date('2023-01-01'),
      },
      {
        title: 'Data Pipeline Architecture',
        description: 'Designed and implemented scalable data processing pipelines',
        date: new Date('2023-06-01'),
      },
    ],
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/your-username', icon: 'github' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/your-profile', icon: 'linkedin' },
    ],
  };

  private appConfig: IAppConfig = {
    siteName: 'Personal Portfolio & Demo Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      eltPipeline: true,
      testingDashboard: true,
      realTimeUpdates: true,
      publicTesting: true,
    },
    performance: {
      targetLCP: 2.5,
      targetFID: 100,
      targetCLS: 0.1,
    },
    contact: {
      email: 'your.email@example.com',
      github: 'https://github.com/your-username',
      linkedin: 'https://linkedin.com/in/your-profile',
    },
  };

  private demosConfig: IDemoConfig = {
    featured: 'elt-pipeline',
    categories: ['Data Engineering', 'Testing & Quality', 'Frontend Development'],
    defaultSettings: {
      showSourceCode: true,
      enableRealTime: true,
      publicAccess: true,
    },
  };

  private testingConfig: ITestingConfig = {
    frameworks: ['Vitest', 'Vue Test Utils', 'fast-check'],
    coverageThreshold: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
    testTypes: ['unit', 'integration', 'property-based', 'e2e'],
    publicDashboard: true,
    realTimeUpdates: true,
  };

  async getAppConfig(): Promise<IAppConfig> {
    return this.appConfig;
  }

  async getUserProfile(): Promise<IUserProfile> {
    return this.userProfile;
  }

  async getDemosConfig(): Promise<IDemoConfig> {
    return this.demosConfig;
  }

  async getTestingConfig(): Promise<ITestingConfig> {
    return this.testingConfig;
  }
}