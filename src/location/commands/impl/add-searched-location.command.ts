export class AddSearchedLocationCommand {
    constructor(
      public readonly userId: string,
      public readonly latitude: string,
      public readonly longitude: string,
      public readonly isCurrent: boolean = true
    ) {}
  }