import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async upsert(
    email: string,
    userData: Partial<User>,
  ): Promise<{ user: User; isNewUser: boolean }> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      await this.userRepository.update({ email }, userData);
      const updatedUser = await this.findByEmail(email);
      return { user: updatedUser, isNewUser: false };
    } else {
      const newUser = this.userRepository.create({ email, ...userData });
      const savedUser = await this.userRepository.save(newUser);
      return { user: savedUser, isNewUser: true };
    }
  }

}
