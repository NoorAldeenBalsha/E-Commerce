import { MailerService } from '@nestjs-modules/mailer';
import {Injectable,InternalServerErrorException,RequestTimeoutException,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly appName: string;
  private readonly mailUser: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appName = this.configService.get('APP_NAME') || 'Store';
    this.mailUser = this.configService.get('MAIL_USER') || '';
    const storeName = this.appName || 'Store';
    this.frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
  }

  // ============================================================================
  // 1. بريد التحقق من الحساب (Email Verification)
  // ============================================================================
  public async sendVerifyEmailTemplate(toEmail: string,verificationLink: string, lang: 'ar' | 'en' = 'en',): Promise<void>  {
    const currentLang = ['ar', 'en'].includes(lang) ? lang : 'en';
    const subject =
      currentLang === 'ar'
        ? `تأكيد البريد الإلكتروني - ${this.appName}`
        : `Email Verification - ${this.appName}`;

    const text =
      currentLang === 'ar'
        ? `مرحباً، لتأكيد حسابك يرجى فتح الرابط التالي:\n${verificationLink}`
        : `Hello, please verify your account by visiting:\n${verificationLink}`;

    const html =
      currentLang === 'ar'
        ? `مرحباً بك في ${this.appName}!
        شكراً لتسجيلك معنا. لإكمال إنشاء حسابك وتفعيله، يرجى الضغط على الزر أدناه:
        تأكيد البريد الإلكتروني
        إذا لم تتمكن من النقر على الزر، انسخ الرابط التالي وضعه في المتصفح:
        ${verificationLink}
        إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد بأمان.`

        :`Welcome to ${this.appName}!
        Thank you for signing up. Please verify your email address to activate your account:
        Verify Email Address
        If the button does not work, copy and paste this link into your browser:
        ${verificationLink}
        If you didn't create an account, you can safely ignore this email.`;
        await this.sendEmail(toEmail, subject, text, html, currentLang);
}

  // ============================================================================
  // 2. بريد رابط إعادة تعيين كلمة المرور
  // ============================================================================
  public async sendResetPasswordTemplate(
  toEmail: string,
  resetLink: string,
  lang: 'ar' | 'en' = 'en',
  ): Promise<void> {
  const currentLang = ['ar', 'en'].includes(lang) ? lang : 'en';
  const subject =
  currentLang === 'ar'
  ? `إعادة تعيين كلمة المرور - ${this.appName}`
  : `Reset Your Password - ${this.appName}`;

  const text =
  currentLang === 'ar'
  ? `مرحباً، يمكنك إعادة تعيين كلمة المرور عبر الرابط: ${resetLink}`
  : `Hello, you can reset your password using the link: ${resetLink}`;

  const html =
  currentLang === 'ar'
  ? `إعادة تعيين كلمة المرور
  تلقينا طلباً لتعيين كلمة مرور جديدة لحسابك. اضغط على الزر التالي للمتابعة:
  تغيير كلمة المرور
  إذا لم تطلب تغيير كلمة المرور، يرجى تجاهل هذه الرسالة، ولن يتم إجراء أي تعديل على حسابك.`

  :`Password Reset Request
  We received a request to reset your password. Click the button below to choose a new one:
  Reset Password
  If you didn't request a password reset, you can safely ignore this email.`;

  await this.sendEmail(toEmail, subject, text, html, currentLang);
  }

  // ============================================================================
  // 3. بريد رمز التحقق (OTP Reset Code)
  // ============================================================================
  public async sendResetCodeEmail(email: string,code: string,lang: 'en' | 'ar' = 'en',) {
    const currentLang = ['ar', 'en'].includes(lang) ? lang : 'en';
    const subject =
      currentLang === 'ar'
        ? `رمز إعادة تعيين كلمة المرور - ${this.appName}`
        : `Password Reset Code - ${this.appName}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        from: `${this.appName} <${this.mailUser}>`,
        subject,
        template: 'reset-code',
        context: {
          email, // <-- إضافة هذا الحقل ليتمكن القالب من قراءته
          code,
          appName: this.appName,
          today: new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US'),
          lang: currentLang,
          message:
            currentLang === 'ar'
              ? `رمز إعادة تعيين كلمة المرور هو: ${code}. هذا الرمز صالح لمدة دقائق معدودة فقط.`
              : `Your password reset code is: ${code}. This code is valid for a limited time only.`,
        },
      });
    } catch (err) {
      console.error('Failed to send reset code email:', err);
      throw new RequestTimeoutException(
        currentLang === 'ar'
          ? 'حدث خطأ أثناء إرسال الرمز، حاول مرة أخرى لاحقًا'
          : 'Failed to send verification code, please try again later',
      );
    }
  }

  // ============================================================================
  // 4. بريد إشعار تسجيل الدخول الجديد (قالب EJS الاحترافي)
  // ============================================================================
  public async sendLoginAlertEmail(toEmail: string,userName: string,lang: 'en' | 'ar' = 'en',) {
    const currentLang = ['ar', 'en'].includes(lang) ? lang : 'en';
    const subject =
    currentLang === 'ar'
    ? `تنبيه أمان: تم تسجيل دخول جديد - ${this.appName}`
    : `Security Alert: New Sign-in - ${this.appName}`;

    try {
      await this.mailerService.sendMail({
        to: toEmail,
        from: `${this.appName} <${this.mailUser}>`,
        subject,
        template: 'login-alert',
        context: {
          lang: currentLang,
          name: userName,
          appName: this.appName,
          today: new Date(),
          resetPasswordUrl: `${this.frontendUrl}/forgot-password`,
        },
      });
    } catch (error) {
      console.error(' Error sending login alert email:', error)
    }
  }

  // ============================================================================
  // 5. دالة الإرسال العامة المنظمة
  // ============================================================================
  private async sendEmail(toEmail: string,subject: string,text: string,html: string,lang: 'ar' | 'en',): Promise<void> {
  try {
  const result = await this.mailerService.sendMail({
  to: toEmail,
  from: `${this.appName} <${this.mailUser}>`,
  subject,
  text,
  html,
  });

    console.log('Email Delivered Successfully to:', toEmail);
    console.log('Message ID:', result?.messageId);
  } catch (error) {
    console.error('Error sending email to:', toEmail, error);
    throw new InternalServerErrorException(
      lang === 'ar'
        ? 'فشل في إرسال البريد الإلكتروني'
        : 'Failed to send email',
    );
  }
  }
}