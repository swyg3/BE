export class RegisterSellerCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly pwConfirm: string,
    public readonly name: string,
    public readonly phoneNumber: string,
  ) {}
}
