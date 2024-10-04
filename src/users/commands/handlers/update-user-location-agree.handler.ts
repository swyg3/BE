import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateUserLocationCommand} from "../commands/update-user-location-agree.command";
import {EventBusService} from "../../../shared/infrastructure/event-sourcing";
import {UserRepository} from "../../repositories/user.repository";
import {UserLocationUpdatedEvent} from "../../events/events/user-location-agree-updated.event";


@CommandHandler(UpdateUserLocationCommand)
export class UpdateUserLocationCommandHandler implements ICommandHandler<UpdateUserLocationCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly eventBusService: EventBusService
    ) {}

    async execute(command: UpdateUserLocationCommand): Promise<void> {
        const { userId, agree } = command;

        await this.userRepository.updateUserLocation(userId, agree);

        const userLocationUpdatedEvent = new UserLocationUpdatedEvent(
            userId,
                {
                    agree: agree
                },
                1,
        );
        await this.eventBusService.publishAndSave(userLocationUpdatedEvent);
    }
}