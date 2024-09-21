import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserProfileQuery } from "../queries/get-user-profile.query";
import { NotFoundException } from "@nestjs/common";
import { UserViewRepository } from "src/users/repositories/user-view.repository";

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(private readonly userViewRepository: UserViewRepository) {}

  async execute(query: GetUserProfileQuery) {
    const user = await this.userViewRepository.findByUserId(query.userId);
    if (!user) {
      throw new NotFoundException(`${query.userId} 존재하지 않는 회원입니다.`);
    }
    return user;
  }
}
