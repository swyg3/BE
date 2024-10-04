export class GetAddressQuery {
    constructor(
      public readonly userId: string,
      public readonly addressId: string
    ) {}
  }