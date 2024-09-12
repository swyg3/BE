import { ICommand } from '@nestjs/cqrs';

export class UpdateInventoryCommand implements ICommand {
  constructor(
    public readonly productId: number, 
    public readonly quantity?: number, 
    public readonly expirationDate?: Date 
  ) {}
}
