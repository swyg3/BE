export class VerifyBusinessNumberCommand {
  constructor(
    public readonly email: string,
    public readonly businessNumber: string
  ) {}
}
