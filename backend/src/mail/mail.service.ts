import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  // إرسال بريد التحقق من البريد الإلكتروني
  public async sendVerifyEmailTemplate( toEmail: string, verificationLink: string, lang: 'ar' | 'en' = 'en', ): Promise<void> { const subject = lang === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Email Verification';
const text = lang === 'ar' ?` مرحباً، لتأكيد حسابك اضغط على الرابط التالي:\n${verificationLink}` 
: `Hello, please verify your email by clicking the link:\n${verificationLink}`;
const html = lang === 'ar' ?  `<div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
 <div style="max-width: 550px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px;
  border: 1px solid #e1e4e8;"> <h2 style="color: #2c3e50; text-align: center;">مرحباً بك في SkyAir!</h2> <p style="font-size: 15px;
   color: #555; line-height: 1.6;"> شكراً لتسجيلك معنا. لتفعيل حسابك، يرجى الضغط على الزر أدناه: </p>
    <div style="text-align: center; margin: 30px 0;"> <a href="${verificationLink}" 
    style="background-color: #0066cc; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; 
    font-weight: bold; display: inline-block;"> تأكيد البريد الإلكتروني </a> </div> <p style="font-size: 13px; color: #777;">
    إذا لم يعمل الزر، يمكنك نسخ ولصق الرابط التالي مباشرة في المتصفح`
    :`</p> <p style="font-size: 12px; color: #0066cc;
     word-break: break-all;">${verificationLink}</p> <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">إذا لم تقم بالتسجيل، يرجى تجاهل هذه الرسالة.</p> </div>
       </div> :  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;"> <div style="max-width: 550px;
        margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #e1e4e8;">
         <h2 style="color: #2c3e50; text-align: center;">Welcome to SkyAir!</h2> <p style="font-size: 15px; color: #555;
          line-height: 1.6;"> Thank you for signing up. Please click the button below to verify your email address: </p>
           <div style="text-align: center; margin: 30px 0;"> <a href="${verificationLink}" style="background-color: #0066cc;
            color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; display: inline-block;">
             Verify Email </a> </div> <p style="font-size: 13px; color: #777;">If the button does not work, copy and paste this
              link into your browser:</p> <p style="font-size: 12px; color: #0066cc; word-break: break-all;">${verificationLink}</p>
               <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" /> <p style="font-size: 12px; color: #999;
                text-align: center;">If you did not create this account, please ignore this email.</p> </div> </div>`;
await this.sendEmail(toEmail, subject, text, html, lang); }

  // إرسال بريد إعادة تعيين كلمة المرور
  async sendResetPasswordTemplate(toEmail: string, resetLink: string, lang: 'ar' | 'en' = 'en') {
    const subject = lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset';
    const text = lang === 'ar'
      ?` مرحباً، يمكنك إعادة تعيين كلمة المرور الخاصة بك عبر الرابط التالي: ${resetLink}`
      : `Hello, you can reset your password using the following link: ${resetLink}`;

    const html = lang === 'ar'
      ? `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; background-color: #f0f4f8; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">إعادة تعيين كلمة المرور</h2>
          <p style="font-size: 16px; color: #555;">إذا طلبت إعادة تعيين كلمة المرور، اضغط على الرابط أدناه:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ff6347; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="font-size: 14px; color: #999;">
            إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد.
          </p>
        </div>
      </div>
      `
      : `
      <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="font-size: 16px; color: #555;">
            If you requested a password reset, click the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ff6347; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #999;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
      `;

    await this.sendEmail(toEmail, subject, text, html, lang);
  }

  public async sendResetCodeEmail(email: string, code: string, lang: 'en' | 'ar' = 'en'): Promise<void> {
    try {
      const today = new Date().toLocaleDateString('ar-en');
      await this.mailerService.sendMail({
    to: email,
    from: `No Reply <${this.configService.get('MAIL_USER')}>`,
    subject: lang === 'ar'
      ? 'رمز إعادة تعيين كلمة المرور'
      : 'Password Reset Code',
    template: 'reset-code',
    context: {
      email,
      code,
      today,
      lang,
      message:
        lang === 'ar'
          ?` رمز إعادة تعيين كلمة المرور الخاص بك هو: ${code}.\nهذا الرمز صالح لمدة دقيقة واحدة فقط.`
          : `Your password reset code is: ${code}.\nThis code is valid for only one minute.,`
    },
  });
    } catch (err) {
      console.error(' Failed to send reset code email:', err);
      throw new RequestTimeoutException(
        lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى لاحقًا' : 'Something went wrong, please try again later'
      );
    }
  }
  // دالة عامة لإرسال أي بريد
  private async sendEmail(
  toEmail: string,
  subject: string,
  text: string,
  html: string,
  lang: 'ar' | 'en',
) {
  try {
    const fromEmail = this.configService.get('MAIL_USER');

    const result = await this.mailerService.sendMail({
      from: `"SkyAir Support" <${fromEmail}>`,
      to: toEmail,
      replyTo: fromEmail,
      subject,
      text,
      html,
    });

    console.log('✅ Email Delivered Successfully!');
    console.log('Target Email:', toEmail);
    console.log('Message ID:', result?.messageId);
    console.log('Accepted Recipients:', result?.accepted);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new InternalServerErrorException(
      lang === 'ar'
        ? 'فشل في إرسال البريد الإلكتروني'
        : 'Failed to send email',
    );
  }
}
}

