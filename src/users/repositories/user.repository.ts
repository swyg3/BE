import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isDeleted: false }
    });
  }

  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  create(userData: Partial<User>): User {
    return this.userRepository.create(userData);
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async upsert(
    email: string,
    userData: Partial<User>,
  ): Promise<{ user: User; isNewUser: boolean }> {
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      // 사용자가 존재하면 (삭제된 사용자 포함) 정보를 업데이트합니다.
      const { agreeReceiveLocation, ...updateData } = userData;
      await this.userRepository.update(
        { email },
        {
          ...updateData,
          isDeleted: false,
          deletedAt: null,
        }
      );
      const updatedUser = await this.userRepository.findOne({ where: { email } });
      return { user: updatedUser, isNewUser: false };
    } else {
      // 새 사용자 생성
      const newUser = this.userRepository.create({
        email,
        ...userData,
        agreeReceiveLocation: false
      });
      const savedUser = await this.userRepository.save(newUser);
      return { user: savedUser, isNewUser: true };
    }
  }

  async updateUserLocation(userId: string, agree: boolean): Promise<void> {
    await this.userRepository.update(userId, { agreeReceiveLocation: agree });
  }
  

  async softDelete(userId: string): Promise<void> {
    const result = await this.userRepository.update(
      { id: userId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );
    if (result.affected === 0) {
      throw new NotFoundException('유저를 찾을 수 없거나 이미 탈퇴한 회원입니다.');
    }
  }
}