export class InventoryCreatedEvent {
    constructor(
      public readonly inventoryId: number,
      public readonly productId: number,
      public readonly quantity: number,
      public readonly expirationDate: Date,
      public readonly createdAt: Date,
      public readonly updatedAt: Date,
    ) {}
  }
  