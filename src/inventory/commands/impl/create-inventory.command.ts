import { ICommand } from "@nestjs/cqrs";

export class CreateInventoryCommand implements ICommand {
  constructor(
    public readonly id: number, // productId가 될예정
    public readonly quantity: number,
    public readonly expirationDate: Date,
  ) {}
}
