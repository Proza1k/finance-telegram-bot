import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/services/user.service';
import { WorkShiftService } from 'src/services/work-shift.service';
import { Markup, Scenes, deunionize } from 'telegraf';

@Wizard('CreateUser')
export class CreateUserWizard {
  constructor(
    private readonly usersService: UsersService,
    private readonly workShiftService: WorkShiftService,
  ) {}

  @WizardStep(1)
  step1(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Введите ФИО');
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    await this.usersService.create({
      telegram_user_id: ctx.message.chat.id,
      name: deunionize(ctx.message).text,
    });

    ctx.reply('Введите ставку');
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const rate = Number(deunionize(ctx.message).text);

    if (isNaN(rate)) {
      ctx.reply('Некорректно введена Ставка');
      ctx.wizard.selectStep(3);
    } else {
      const isEndWorkTime = await this.workShiftService.isEndWorkShift(
        ctx.message.chat.id,
      );
      await this.usersService.setRate(ctx.message.chat.id, rate);
      await ctx.reply(
        'Добро пожаловать в FinanceBot',
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
