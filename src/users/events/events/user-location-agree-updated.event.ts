
import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class UserLocationUpdatedEvent implements BaseEvent {
    eventType = "UserLocationUpdated";
    aggregateType = "User";

    constructor(
        public readonly aggregateId: string,
        public readonly data: {
            agree: boolean,
        },
        public readonly version: number,
    ) {}
}
