import { ICommand } from '@nestjs/cqrs';

export class CreateInventoryCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly quantity: number,
    public readonly expirationDate: Date,
  ) {}
}
