import { WorkShift } from '../entities/WorkShift.entity';

export type SalaryCalculatePayload = {
  totalHours: number;
  highTotalHours: number;
  weekHours: number;
  totalSalary: number;
  middleRate: number;
};

export type SalaryHelperTypes = {
  calculate: (records: Array<WorkShift>) => Promise<SalaryCalculatePayload>;
};
