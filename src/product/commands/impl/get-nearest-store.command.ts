import { ICommand } from "@nestjs/cqrs";

export class GetNearestStoreProducts implements ICommand {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}
}
