export class FirstAddressInsertCommand {
    constructor(
      public readonly userId: string,
      public readonly longitude: string,
      public readonly latitude: string,
      public readonly agree: boolean
    ) {}
  }