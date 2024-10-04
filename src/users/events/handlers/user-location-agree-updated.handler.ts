import {EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {UserLocationUpdatedEvent} from "../events/user-location-agree-updated.event";
import {UserViewRepository} from "../../repositories/user-view.repository";

@EventsHandler(UserLocationUpdatedEvent)
export class UserLocationConsentUpdatedEventHandler implements IEventHandler<UserLocationUpdatedEvent> {
    constructor(private readonly userViewRepository: UserViewRepository) {}

    async handle(event: UserLocationUpdatedEvent) {
        await this.userViewRepository.update(event.aggregateId, { agreeReceiveLocation: event.data.agree });
    }
}