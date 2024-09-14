export interface BaseEvent {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  data: any;
  version: number;
}
