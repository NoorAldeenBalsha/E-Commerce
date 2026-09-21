import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail', // يضبط المنافذ و TLS تلقائياً وبشكل مضمون مع Google
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"SkyAir No Reply" <${configService.get('MAIL_USER')}>`,
        },
        template: {
          dir: join(process.cwd(), 'src/mail/templates'),
          // إذا كنت لا تزال تواجه مشكلة مع EjsAdapter اتركه كـ undefined إن لم تكن بحاجته
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}