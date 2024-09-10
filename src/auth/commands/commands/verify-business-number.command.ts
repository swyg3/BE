export class VerifyBusinessNumberCommand {
  constructor(
    public readonly sellerId: string,
    public readonly businessNumber: string
  ) {}
}
