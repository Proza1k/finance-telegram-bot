import { Injectable } from '@nestjs/common';
import { BotUser } from 'src/entities/User.entity';

@Injectable()
export class UsersService {
  async create({ telegram_user_id, name = '', rate = 0 }): Promise<void> {
    const user = await BotUser.create({
      telegram_user_id,
      name,
      rate,
    });
    await user.save();
  }

  async findByTelegramId(userId: number) {
    return await BotUser.findOne({
      where: {
        telegram_user_id: userId,
      },
    });
  }

  async setRate(userId: number, rate: number): Promise<void> {
    const user = await this.findByTelegramId(userId);
    if (user) {
      await BotUser.update(user.id, {
        rate,
      });
    }
  }

  async isExistsUser(userId: number): Promise<boolean> {
    const isExists = await this.findByTelegramId(userId);

    return Boolean(isExists);
  }
}
