import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup, Scenes, deunionize } from 'telegraf';
import { UsersService } from '../services/user.service';
import { WorkShiftService } from '../services/work-shift.service';

@Wizard('SetRate')
export class SetRateWizard {
  constructor(
    private readonly usersService: UsersService,
    private readonly workShiftService: WorkShiftService,
  ) {}

  @WizardStep(1)
  step1(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Введите ставку', Markup.keyboard(['Отменить']).resize());
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const isEndWorkTime = await this.workShiftService.isEndWorkShift(
      ctx.message.chat.id,
    );

    if (deunionize(ctx.message).text === 'Отменить') {
      await ctx.reply(
        'Добро пожаловать в FinanceBot',
        Markup.keyboard([
          [isEndWorkTime ? 'Начать работу' : 'Закончить работу'],
          ['Аналитика'],
          ['Сменить ФИО', 'Сменить ставку'],
        ]).resize(),
      );
      ctx.scene.leave();
      return;
    }

    const rate = Number(deunionize(ctx.message).text);

    if (isNaN(rate)) {
      ctx.reply('Некорректно введена Ставка');
      ctx.wizard.selectStep(2);
    } else {
      await this.usersService.setRate(ctx.message.chat.id, rate);

      await ctx.reply(
        'Ставка успешно изменена',
        Markup.keyboard([
          [isEndWorkTime ? 'Начать работу' : 'Закончить работу'],
          ['Аналитика'],
          ['Сменить ФИО', 'Сменить ставку'],
        ]).resize(),
      );

      ctx.scene.leave();
    }
  }
}
