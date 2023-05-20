import { google } from 'googleapis';

export class GoogleService {
  Calendar: {
    isHoliday: (date: Date) => Promise<boolean>;
  };

  clientId = process.env.GOOGLE_CLIENT_ID;
  clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  constructor() {
    this.Calendar = {
      isHoliday: this.isHoliday,
    };
  }

  private async isHoliday(date: Date) {
    const auth = new google.auth.OAuth2(this.clientId, this.clientSecret);

    try {
      await auth.getAccessToken(); // Получаем токен доступа

      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.list({
        calendarId: 'holidays@calendar.google.com', // Идентификатор календаря праздников Google
        timeMin: date.toISOString(),
        timeMax: date.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items;

      return events.length > 0; // Возвращает true, если есть праздничное событие на указанную дату
    } catch (error) {
      console.error('Ошибка при проверке праздничного дня:', error);
      return false;
    }
  }
}

export const Google = new GoogleService();
