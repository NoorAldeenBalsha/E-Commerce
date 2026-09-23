import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as ejs from 'ejs';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const appName = configService.get('APP_NAME') || 'Store';
        const mailUser = configService.get('MAIL_USER');
        const mailPass = configService.get('MAIL_PASS');
        const mailHost = configService.get('MAIL_HOST');
        const mailPort = configService.get('MAIL_PORT');

        return {
          transport: {
            auth: {
              user: mailUser,
              pass: mailPass,
            },
            host: mailHost,
            port: mailPort,
          },
          defaults: {
            from: `"${appName}" <${mailUser}>`,
          },
          template: {
            dir: join(process.cwd(), 'src/mail/templates'),
            adapter: {
              compile: (mail: any, callback: any, mailerOptions: any) => {
                const templateName = mail.data.template.endsWith('.ejs')
                  ? mail.data.template
                  : `${mail.data.template}.ejs`;

                const templatePath = join(mailerOptions.template.dir, templateName);

                ejs.renderFile(templatePath, mail.data.context, {}, (err, html) => {
                  if (err) {
                    return callback(err);
                  }
                  mail.data.html = html;
                  return callback();
                });
              },
            },
            options: {
              strict: false,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}