import { Injectable } from '@nestjs/common';
import { UsersService } from './user.service';
import { WorkShift } from '../entities/WorkShift.entity';
import { BotUser } from '../entities/User.entity';

@Injectable()
export class WorkShiftService {
  constructor(private readonly usersService: UsersService) {}

  async isEndWorkShift(userId: number): Promise<boolean> {
    const user = await this.usersService.findByTelegramId(userId);

    if (user) {
      const lastWork = await WorkShift.findOne({
        where: {
          telegram_user_id: user.telegram_user_id,
        },
        order: { id: 'DESC' },
      });

      if (lastWork && lastWork.start_time && !lastWork.end_time) {
        return false;
      }
    }

    return true;
  }

  async setEndWorkTime(userId: number, end_time: Date): Promise<void> {
    const user = await this.usersService.findByTelegramId(userId);

    if (user) {
      const latestWorkShift = await WorkShift.findOne({
        where: {
          telegram_user_id: user.telegram_user_id,
        },
        order: { id: 'DESC' },
      });

      if (latestWorkShift && !latestWorkShift.end_time) {
        await WorkShift.update(latestWorkShift.id, {
          end_time,
        });
      }
    }
  }

  async createWorkShift({ telegram_user_id, rate }: BotUser, start_time: Date) {
    const workShift = await WorkShift.create({
      telegram_user_id,
      rate,
      start_time,
    });

    await workShift.save();
  }
}
