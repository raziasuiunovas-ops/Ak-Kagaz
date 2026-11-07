import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status with all required fields', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('getInfo', () => {
    it('should return API information', () => {
      const result = service.getInfo();
      expect(result).toHaveProperty('name', 'AK KAGAZ API');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('documentation');
    });
  });
});
