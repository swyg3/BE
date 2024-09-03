import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../queries/get-user.query';
import { UserViewRepository } from 'src/users/repositories/user-view.repository';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userViewRepository: UserViewRepository) {}

  async execute(query: GetUserQuery) {
    return this.userViewRepository.findById(query.userId);
  }
}