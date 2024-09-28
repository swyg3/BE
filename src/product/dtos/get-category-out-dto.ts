import { DyProductView } from "../repositories/dy-product-view.repository";

export class GetCategoryQueryOutputDto {
    items: DyProductView[];
    lastEvaluatedUrl: string | undefined;
    firstEvaluatedUrl: string | undefined;
    prevPageUrl:string | undefined;
    count: number;
  }
  