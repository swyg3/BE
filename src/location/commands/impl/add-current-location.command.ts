import { LocationType } from "src/location/location.type";

export class AddCurrentLocationCommand {
  constructor(
    public readonly userId: string,
    public readonly latitude: string,
    public readonly longitude: string,
    public readonly isCurrent: boolean = true,
    public readonly locationType: LocationType, 
    public readonly isAgreed: boolean = true,
  ) {}
}
