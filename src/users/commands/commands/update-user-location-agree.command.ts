export class UpdateUserLocationCommand {
    constructor(
        public readonly userId: string,
        public readonly agree: boolean
    ) {}
}