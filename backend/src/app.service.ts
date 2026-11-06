import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getInfo() {
    return {
      name: 'AK KAGAZ API',
      version: '1.0.0',
      description: 'Backend API for AK KAGAZ e-commerce platform',
      documentation: '/api/docs',
    };
  }
}
