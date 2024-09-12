export class ProductViewFromInventoryEvent {
  constructor(
    public readonly Id: number,
    public readonly productId: number,
  ) {}
}
