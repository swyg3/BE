export interface ISeller {
    id: string;
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    storeName: string;
    storeAddress: string;
    storePhoneNumber: string;
    isBusinessNumberVerified: boolean;
    accessToken?: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }