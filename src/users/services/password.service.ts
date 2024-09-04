import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly SALT_LENGTH = 16;

  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
      salt,
    });
    return `${salt.toString('hex')}:${hash}`;
  }

  async verifyPassword(storedPassword: string, plainPassword: string): Promise<boolean> {
    const [salt, hash] = storedPassword.split(':');
    const verifyHash = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
      salt: Buffer.from(salt, 'hex'),
    });
    return verifyHash === hash;
  }
}