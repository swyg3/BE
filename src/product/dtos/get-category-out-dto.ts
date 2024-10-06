import { ProductView } from "../repositories/product-view.repository";

export class GetCategoryQueryOutputDto {
    items: ProductView[];
    lastEvaluatedUrl: string | undefined;
    firstEvaluatedUrl: string | undefined;
    prevPageUrl:string | undefined;
    count: number;
  }
  