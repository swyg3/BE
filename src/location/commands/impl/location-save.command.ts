export class SaveUserLocationCommand {
    constructor(
      public readonly userId: string,
      public readonly latitude: string,
      public readonly longitude: string,
      public readonly isCurrent: boolean

    ) {}
  }