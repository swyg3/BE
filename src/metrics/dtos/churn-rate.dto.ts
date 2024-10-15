export class ChurnRateDto {
  period: 'daily' | 'weekly' | 'monthly';
  rate: number;
  startDate: Date;
  endDate: Date;
}