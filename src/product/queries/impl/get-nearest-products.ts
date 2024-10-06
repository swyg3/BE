export class GetNearestProductsQuery {
    constructor(
      public readonly lat: string,
      public readonly lon: string,
      public readonly limit: number = 7
    ) {}
  }