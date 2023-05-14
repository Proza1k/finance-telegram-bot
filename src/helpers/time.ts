/**
 * Telegraf возвращает UNIX подобную дату 1970 года
 * Чтобы это исправить - нужно умножать на 1000
 * @param time message.date
 * @returns Date
 */

export const getDateMessage = (time: number) => new Date(time * 1000);
