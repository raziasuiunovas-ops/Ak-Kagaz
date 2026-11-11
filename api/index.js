/**
 * Vercel Serverless Function Entry Point for NestJS Backend
 * 
 * This file acts as the adapter between Vercel Functions and the NestJS application.
 * It imports the compiled NestJS app module and bootstraps it for serverless execution.
 */

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../backend/dist/app.module');

let cachedApp = null;

/**
 * Bootstrap NestJS application with serverless-compatible configuration
 */
async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // CORS configuration - same domain but needs credentials
  const frontendUrl = process.env.FRONTEND_URL || 'https://ak-kagaz.vercel.app';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.init();
  
  cachedApp = app;
  return app;
}

/**
 * Vercel serverless function handler
 * Receives requests from Vercel's routing layer and forwards to NestJS
 */
module.exports = async (req, res) => {
  const app = await bootstrap();
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  // Forward the request to NestJS Express instance
  // Vercel rewrites preserve the original URL (e.g., /api/products)
  // NestJS will match it against the global prefix and controllers
  return instance(req, res);
};
