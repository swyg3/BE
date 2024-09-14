// import { AggregateRoot } from "@nestjs/cqrs";
// import { ProductCreatedEvent } from "../events/impl/product-created.event";
// import { ProductDeletedEvent } from "../events/impl/product-deleted.event";
// import { ProductUpdatedEvent } from "../events/impl/product-updated.event";
// import { Category } from "../product.category";

// export class ProductAggregate extends AggregateRoot {
//   private name?: string;
//   private productImageUrl?: string;
//   private description?: string;
//   private originalPrice?: number;
//   private discountedPrice?: number;

//   constructor(private readonly id: number) {
//     super();
//   }

//   // 제품 생성
//   createProduct(
//     sellerId: number,
//     category: Category,
//     name: string,
//     productImageUrl: string,
//     description: string,
//     originalPrice: number,
//     discountedPrice: number,
//   ) {
//     const expirationDate = new Date();

//     // 이벤트 생성
//     const event = new ProductCreatedEvent(
//       this.id,
//       sellerId,
//       category,
//       name,
//       productImageUrl,
//       description,
//       originalPrice,
//       discountedPrice,
//       0, // discountRate, 기본값으로 설정
//       0, // availableStock, 기본값으로 설정
//       expirationDate, // 만기일을 설정한 날짜로 지정
//       new Date(), // createdAt, 현재 날짜
//       new Date(), // updatedAt, 현재 날짜
//     );

//     // 상태를 변경하고 이벤트를 적용
//     this.apply(event);
//     return [event];
//   }

//   // 제품 삭제
//   deleteProduct(id: number) {
//     const event = new ProductDeletedEvent(this.id);

//     this.apply(event);
//     return [event];
//   }

//   // 제품 업데이트
//   updateProduct(
//     name?: string,
//     productImageUrl?: string,
//     description?: string,
//     originalPrice?: number,
//     discountedPrice?: number,
//   ) {
//     // 상태를 업데이트하는 로직
//     if (name) this.name = name;
//     if (productImageUrl) this.productImageUrl = productImageUrl;
//     if (description) this.description = description;
//     if (originalPrice) this.originalPrice = originalPrice;
//     if (discountedPrice) this.discountedPrice = discountedPrice;

//     // 변경된 상태를 기반으로 이벤트를 생성
//     const event = new ProductUpdatedEvent(
//       this.id,
//       this.name,
//       this.productImageUrl,
//       this.description,
//       this.originalPrice,
//       this.discountedPrice,
//     );

//     this.apply(event);
//     return [event];
//   }
// }
