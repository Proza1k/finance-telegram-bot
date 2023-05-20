import { SalaryCalculatePayload } from '../types/salary';

export const getAnalyticsMessage = (
  payload: SalaryCalculatePayload,
): string => {
  const { totalHours, highTotalHours, weekHours, totalSalary, middleRate } =
    payload;

  const message = `
        **Средняя ставка**: ${middleRate}₽/час
        **Отработано**: ${totalHours} часов
        **На буднях переработал**: ${highTotalHours} часов
        **Отработано в выходные дни**: ${weekHours} часов

        **Получаемая заработная плата**: ${totalSalary} ₽
    `;

  return message;
};
