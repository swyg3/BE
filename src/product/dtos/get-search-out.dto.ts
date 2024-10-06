import { ProductView } from "../repositories/product-view.repository";

export class SearchProductsOutputDto {
    items: ProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    prevPageUrl: string | null;
    count: number;
  }