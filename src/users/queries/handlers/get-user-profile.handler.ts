import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserProfileQuery } from "../queries/get-user-profile.query";
import { NotFoundException } from "@nestjs/common";
import { DyUserViewRepository } from "src/users/repositories/dy-user-view.repository";

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(private readonly dyUserViewRepository: DyUserViewRepository) {}

  async execute(query: GetUserProfileQuery) {
    const user = await this.dyUserViewRepository.findByUserId(query.userId);
    if (!user) {
      throw new NotFoundException(`${query.userId} 존재하지 않는 회원입니다.`);
    }
    return user;
  }
}
