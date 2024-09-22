import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { DyGetProductByIdQuery } from "../impl/dy-get-prouct-by-id.query";
import { DyProductViewRepository } from "../../repositories/dy-product-view.repository";
import { PRODUCTS_PUBLIC_IMAGE_PATH } from "../../const/path.const";

@QueryHandler(DyGetProductByIdQuery)
export class DyGetProductByIdHandler
  implements IQueryHandler<DyGetProductByIdQuery>
{
  constructor(
    private readonly dyProductViewRepository: DyProductViewRepository,
  ) {}

  async execute(query: DyGetProductByIdQuery): Promise<any> {
    const product = await this.dyProductViewRepository.findByProductId(
      query.productId,
    );

    if (!product) {
      throw new NotFoundException(
        `상품 ID ${query.productId}를 찾을 수 없습니다.`,
      );
    }

    const transformedProduct = {
      ...product,
      productImageUrl: product.productImageUrl
        ? `/${PRODUCTS_PUBLIC_IMAGE_PATH}/${product.productImageUrl}`
        : null,
    };

    return {
      success: true,
      message: "해당 상품 상세 조회를 성공했습니다.",
      data: transformedProduct,
    };
  }
}
