import { Injectable } from '@nestjs/common';
import { Command, Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { UsersService } from './user.service';
import { SceneContext } from 'telegraf/typings/scenes';
import { WorkShiftService } from './work-shift.service';
import { getDateMessage } from 'src/helpers/time';
import { WorkShift } from 'src/entities/WorkShift.entity';

@Update()
@Injectable()
export class AppService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workShiftService: WorkShiftService,
  ) {}

  getData(): { message: string } {
    return { message: 'Welcome to server!' };
  }

  @Start()
  async startCommand(ctx: SceneContext) {
    const telegramUserId = ctx.message.chat.id;
    const isExistsUsers = await this.usersService.isExistsUser(telegramUserId);

    if (!isExistsUsers) {
      await ctx.reply('Пользователя нет в списке, давайте его добавим');
      await ctx.scene.enter('CreateUser');
    } else {
      const isEndWorkTime = await this.workShiftService.isEndWorkShift(
        ctx.message.chat.id,
      );

      await ctx.reply(
        'Добро пожаловать в FinanceBot',
        Markup.keyboard([
          [isEndWorkTime ? 'Начать работу' : 'Закончить работу'],
          ['Аналитика'],
          ['Сменить ФИО', 'Сменить ставку'],
        ]).resize(),
      );
    }
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async onSticker(ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hearsHi(ctx: Context) {
    await ctx.reply('Hey there');
  }

  @Hears('Начать работу')
  @Command('work_start')
  async startWork(ctx: Context) {
    const userId = ctx.message.chat.id;
    const start_time = getDateMessage(ctx.message.date);

    const user = await this.usersService.findByTelegramId(userId);

    if (user) {
      const isEndWorkShift = await this.workShiftService.isEndWorkShift(userId);

      if (!isEndWorkShift) {
        ctx.reply(
          'Запись смены уже существует. Если вы хотите закончить рабочую смену, нажмите на кнопку "Закончить работу"',
          Markup.keyboard([
            ['Закончить работу'],
            ['Аналитика'],
            ['Сменить ФИО', 'Сменить ставку'],
          ]).resize(),
        );
      } else {
        const work = await WorkShift.create({
          telegram_user_id: user.telegram_user_id,
          rate: user.rate,
          start_time: start_time,
        });

        await work.save();

        ctx.reply(
          'Запись смены началась',
          Markup.keyboard([
            ['Закончить работу'],
            ['Аналитика'],
            ['Сменить ФИО', 'Сменить ставку'],
          ]).resize(),
        );
      }
    }
  }

  @Hears('Закончить работу')
  @Command('work_end')
  async endWork(ctx: Context) {
    const userId = ctx.message.chat.id;
    const end_time = getDateMessage(ctx.message.date);

    const user = await this.usersService.findByTelegramId(userId);

    if (user) {
      const isEndWorkShift = await this.workShiftService.isEndWorkShift(userId);

      if (!isEndWorkShift) {
        await this.workShiftService.setEndWorkTime(
          user.telegram_user_id,
          end_time,
        );

        ctx.reply(
          'Запись окончания смены внесена',
          Markup.keyboard([
            ['Начать работу'],
            ['Аналитика'],
            ['Сменить ФИО', 'Сменить ставку'],
          ]).resize(),
        );
      } else {
        ctx.reply(
          'Запись смены уже внесена. Если вы хотите закончить рабочую смену, нажмите на кнопку "Начать работу"',
          Markup.keyboard([
            ['Закончить работу'],
            ['Аналитика'],
            ['Сменить ФИО', 'Сменить ставку'],
          ]).resize(),
        );
      }
    }
  }

  @Hears('Сменить ставку')
  @Command('set_rate')
  async setRate(ctx: SceneContext) {
    await ctx.scene.enter('SetRate');
  }
}
