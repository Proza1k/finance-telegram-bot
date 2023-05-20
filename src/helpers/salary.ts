import { WorkShift } from '../entities/WorkShift.entity';
import { Google } from '../services/google.service';
import { SalaryCalculatePayload, SalaryHelperTypes } from '../types/salary';

const calculate = async (
  records: Array<WorkShift>,
): Promise<SalaryCalculatePayload> => {
  const counter = {
    totalHours: 0,
    highTotalHours: 0,
    weekHours: 0,
    totalSalary: 0,
    middleRate: 0,
  };

  for (const record of records) {
    const rate = record.rate;
    const startTime = new Date(record.start_time);
    const endTime = new Date(record.end_time);

    const hoursWorked =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Разница в часах

    counter.totalHours += hoursWorked;
    counter.middleRate += record.rate;

    let rateMultiplier = 1; // Коэффициент для переработки или работы в выходные/праздничные дни

    const isHolidayResult = await Google.Calendar.isHoliday(startTime);

    if (
      isHolidayResult ||
      startTime.getDay() === 0 ||
      startTime.getDay() === 6
    ) {
      rateMultiplier = 1.95;
      counter.weekHours += hoursWorked;
    } else if (counter.totalHours <= 168) {
      // Норма не превышена
      rateMultiplier = 1;
    } else if (
      counter.totalHours > 168 &&
      startTime.getDay() >= 1 &&
      startTime.getDay() <= 5
    ) {
      // Норма превышена, работа в будний день
      rateMultiplier = 1.2;
      counter.highTotalHours = counter.totalHours - 168;
    }

    counter.totalSalary += rate * rateMultiplier * hoursWorked;
  }

  counter.middleRate = counter.middleRate / records.length;

  return counter;
};

export const SalaryHelper: SalaryHelperTypes = {
  calculate,
};
