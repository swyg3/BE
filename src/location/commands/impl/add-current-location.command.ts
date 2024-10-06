
export class AddCurrentLocationCommand {
  constructor(
    public readonly userId: string,
    public readonly latitude: string,
    public readonly longitude: string,
    public readonly isCurrent: boolean = true,
    public readonly isAgreed: boolean = true,
  ) {}
}
