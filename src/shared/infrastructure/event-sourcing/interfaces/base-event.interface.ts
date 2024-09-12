export interface BaseEvent<T = string> {
  eventType: string;
  aggregateId: T;
  aggregateType: string;
  data: any;
  version: number;
}
