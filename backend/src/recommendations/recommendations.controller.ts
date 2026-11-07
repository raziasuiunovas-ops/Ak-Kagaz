import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { TrackViewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Track product view
   * Public endpoint (can be called by guests with sessionId)
   */
  @Post('track-view')
  @HttpCode(HttpStatus.OK)
  async trackView(@Body() dto: TrackViewDto) {
    return this.recommendationsService.trackView(dto);
  }

  /**
   * Get personalized recommendations for authenticated user
   * Requires authentication
   */
  @Get('for-you')
  @UseGuards(JwtAuthGuard)
  async getPersonalRecommendations(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.recommendationsService.getPersonalRecommendations(
      req.user.userId,
      limitNum,
    );
  }

  /**
   * Get recommendations for guest users
   * Public endpoint
   */
  @Get('for-guest')
  async getGuestRecommendations(
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.recommendationsService.getGuestRecommendations(
      sessionId,
      limitNum,
    );
  }

  /**
   * Get frequently bought together products
   * Public endpoint
   */
  @Get('frequently-bought/:productId')
  async getFrequentlyBought(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.recommendationsService.getFrequentlyBought(productId, limitNum);
  }

  /**
   * Get similar products
   * Public endpoint
   */
  @Get('similar/:productId')
  async getSimilarProducts(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 8;
    return this.recommendationsService.getSimilarProducts(productId, limitNum);
  }

  /**
   * Get recently viewed products
   * Requires authentication
   */
  @Get('recently-viewed')
  @UseGuards(JwtAuthGuard)
  async getRecentlyViewed(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.recommendationsService.getRecentlyViewed(
      req.user.userId,
      limitNum,
    );
  }

  /**
   * Get products for repeat purchase
   * Requires authentication
   */
  @Get('repeat-purchases')
  @UseGuards(JwtAuthGuard)
  async getRepeatPurchases(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.recommendationsService.getRepeatPurchases(
      req.user.userId,
      limitNum,
    );
  }

  /**
   * Get popular products
   * Public endpoint
   */
  @Get('popular')
  async getPopularProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.recommendationsService.getPopularProducts(limitNum);
  }

  /**
   * Get trending products
   * Public endpoint
   */
  @Get('trending')
  async getTrendingProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.recommendationsService.getTrendingProducts(limitNum);
  }

  /**
   * Analyze and update frequently bought together
   * Only SUPER_ADMIN can trigger this
   */
  @Post('analyze-fbt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async analyzeFrequentlyBoughtTogether() {
    return this.recommendationsService.analyzeFrequentlyBoughtTogether();
  }
}
