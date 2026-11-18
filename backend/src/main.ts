import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Trust proxy for correct IP detection on Vercel/AWS/GCP
  // Required for rate limiting to work per-user instead of per-edge-server
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // Global prefix
  app.setGlobalPrefix('api');

  // Security: Helmet middleware for HTTP security headers
  // Configure to work with CORS and OAuth redirects
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP to avoid blocking OAuth and external resources
      crossOriginEmbedderPolicy: false, // Allow embedding for OAuth flows
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
    })
  );

  // CORS configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const adminUrls = configService.get<string>('ADMIN_URLS', '').split(',').filter(Boolean);
  const allowedOrigins = [frontendUrl, ...adminUrls].filter(
    (url, index, self) => url && self.indexOf(url) === index
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger documentation
  // Temporarily disabled due to type inference issues
  // const config = new DocumentBuilder()
  //   .setTitle('AK KAGAZ API')
  //   .setDescription('API documentation for AK KAGAZ e-commerce platform')
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 API documentation: http://localhost:${port}/api/docs`);
  console.log(`🔒 Security: Helmet headers enabled`);
  console.log(`🛡️  Rate limiting: Active (100 req/min default, 10 req/min for auth)`);
}

bootstrap();
