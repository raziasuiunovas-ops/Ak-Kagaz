export interface MergeCategoryDto {
  targetCategoryId: string;
  imageUrl: string;
  expectedSourceProductCount: number;
  expectedTargetProductCount: number;
  translations: Array<{
    locale: 'ru' | 'ky';
    name: string;
    description?: string;
  }>;
}
