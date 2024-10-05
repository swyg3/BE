import { AddressDto } from "src/location/dto/address.dto";

export class SaveAddressCommand {
    constructor(
      public readonly userId: string,
      public readonly addressDto: AddressDto,

    ) {}
  }