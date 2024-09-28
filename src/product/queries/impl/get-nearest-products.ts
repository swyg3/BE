export class GetNearestProductsQuery {
    constructor(
      public readonly lat: number,
      public readonly lon: number,
      public readonly limit: number = 7
    ) {}
  }