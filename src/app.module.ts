import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotUser } from './entities/User.entity';
import { UsersService } from './services/user.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppService } from './services/app.service';
import { CreateUserWizard } from './wizards/create-user';
import { session } from 'telegraf';
import { WorkShift } from './entities/WorkShift.entity';
import { WorkShiftService } from './services/work-shift.service';
import { SetRateWizard } from './wizards/set-rate';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
      middlewares: [session()],
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [BotUser, WorkShift],
      synchronize: true,
      logging: true,
      ssl: true,
    }),
  ],
  controllers: [],
  providers: [
    UsersService,
    WorkShiftService,
    CreateUserWizard,
    SetRateWizard,
    AppService,
  ],
})
export class AppModule {}
