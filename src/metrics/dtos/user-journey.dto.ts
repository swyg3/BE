export class UserJourneyStepDto {
  step: string;
  count: number;
}

export class UserJourneyDto {
  startDate: Date;
  endDate: Date;
  steps: UserJourneyStepDto[];
}