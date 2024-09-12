export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly accessToken: string,
    public readonly userType: string,
  ) {}
}
