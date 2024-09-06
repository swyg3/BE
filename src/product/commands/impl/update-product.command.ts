export class UpdateProductCommand {
    constructor(
      public readonly productId: number,
      public readonly name: string,
      public readonly price: number,
      public readonly category: string
    ) {}
  }
  