import {BadRequestException,ConflictException,ForbiddenException,forwardRef,Inject,Injectable,UnauthorizedException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from "../schema/user.schema";
import { UserService } from '../user.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthTokens, JwtPayload, JWTPayloadType } from 'utilitis/types';
import { RequestWithCookies } from 'utilitis/interface';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}
  //============================================================================
  // Register a new user
  //============================================================================
  public async Register(registerUserDto: RegisterUserDto, lang: 'en' | 'ar' = 'en') {
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';
    const { email, firstName, lastName, password, phoneNumber } = registerUserDto;

    const normalizedEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    // 1. Clear & Check data form user
    if (!cleanFirstName || typeof cleanFirstName !== 'string') {
      const msg =
        currentLang === 'ar'
          ? 'اسم المستخدم مطلوب ويجب أن يكون نصًا'
          : 'First Name is required and must be a string'
      throw new ConflictException(msg);
    }

    if (!cleanLastName || typeof cleanLastName !== 'string') {
      const msg =
        currentLang === 'ar'
          ? 'الكنية المستخدم مطلوب ويجب أن يكون نصًا'
          : 'Last Name is required and must be a string'
        throw new ConflictException(msg);
    }


    // 2. Check the email is correct or is duplicate
    const existingEmailUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmailUser) {
      const msg =
        currentLang === 'ar'
          ? 'البريد الإلكتروني مستخدم بالفعل'
          : 'Email is already registered';
      throw new ConflictException(msg);
    }

    // 3. check the phone nuber is correct
    if (phoneNumber) {
      const existingPhone = await this.userRepository.findOne({
        where: { phoneNumber: phoneNumber.trim() },
      });

      if (existingPhone) {
        const msg =
          currentLang === 'ar'
            ? 'رقم الهاتف مستخدم بالفعل'
            : 'Phone number is already registered';
        throw new ConflictException(msg);
      }
    }


    // 4. Hash password
    const hashedPassword = await this.hashPasswword(password);
    const verificationToken = randomBytes(32).toString('hex');

    
    // 5. create a row in database for new user
    const userInstance = this.userRepository.create({
      email: normalizedEmail,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      phoneNumber: phoneNumber ? phoneNumber.trim() : null,
      passwordHash: hashedPassword,
      verificationToken,
    });

    const savedUser = await this.userRepository.save(userInstance);

    // 6. create Verify Email and send it to user
    const link = await this.generateVerificationLink(
      savedUser.id,
       savedUser.verificationToken);
    await this.mailService.sendVerifyEmailTemplate(savedUser.email, link);

    const msg =
      currentLang === 'ar'
        ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق للمتابعة'
        : 'Verification token has been sent to your email. Please verify your email to continue';

    return {
      message: msg,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        phoneNumber: savedUser.phoneNumber,
        role: savedUser.role,
        status: savedUser.status,
        link:link,
        verificationToken:savedUser.verificationToken,
        refreshToken:savedUser.refreshToken,
      },
   }
  };
  // ============================================================================
  //  Sing in 
  // ============================================================================
  // Authenticate User, Validate Account State, and Issue Tokens
  // ============================================================================
  public async Login(loginDto: LoginDto,response: Response,lang: 'en' | 'ar' = 'en',) {
    // 1. Sanitize language input
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';
    const { email, password } = loginDto;
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Query user including soft-deleted check if applicable
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    // 3. Reject invalid email (Keep error generic for security best practices)
    if (!user) {
      const message =
        currentLang === 'ar'
          ? 'بيانات الاعتماد غير صحيحة'
          : 'Invalid credentials';
      throw new UnauthorizedException(message);
    }

    // 4. Check if account is deactivated and instruct to contact Admin
    if (user.status === 'deactivated') {
      const message =
        currentLang === 'ar'
          ? 'حسابك معطل حالياً. يرجى التواصل مع مسؤول النظام (Admin) لإعادة تفعيل حسابك.'
          : 'Your account is deactivated. Please contact the administrator to reactivate it.';
      throw new ForbiddenException(message);
    }

    // 5. Enforce email verification constraint
    if (user.status === 'pending_verification' || !user.emailVerifiedAt) {
      const message =
        currentLang === 'ar'
          ? 'يرجى تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول'
          : 'Please verify your email before logging in';
      throw new ForbiddenException(message);
    }

    // 6. Check for administrative bans / suspensions
    if (user.status === 'suspended' || user.status === 'banned') {
      const message =
        currentLang === 'ar'
          ? 'تم حظر هذا الحساب لمخالفة شروط الاستخدام'
          : 'This account has been banned due to policy violations';
      throw new ForbiddenException(message);
    }

    // 7. Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const message =
        currentLang === 'ar'
          ? 'بيانات الاعتماد غير صحيحة'
          : 'Invalid credentials';
      throw new UnauthorizedException(message);
    }

    // 8. Generate Access and Refresh JWTs
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 9. Store hashed refresh token in database for rotation/revocation
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      passwordResetToken: hashedRefreshToken,
    });

    // 10. Optional: Attach refreshToken in an httpOnly cookie for web security
    if (response && typeof response.cookie === 'function') {
      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
     
    await this.mailService.sendLoginAlertEmail(user.email, `${user.firstName} ${user.lastName}`, currentLang);

    // 11. Return response payload
    return {
      success: true,
      message:
        currentLang === 'ar'
          ? 'تم تسجيل الدخول بنجاح'
          : 'Logged in successfully',
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }
  // ============================================================================
  // Access Token (Refresh Token)
  // ============================================================================
  public async refreshTokens(userId: string, refreshToken: string) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  
  if (!user || !user.passwordResetToken) {
    throw new ForbiddenException('Access Denied');
  }

  // مطابقة التوكن المرسل مع الهاش المخزن
  const rtMatches = await bcrypt.compare(refreshToken, user.passwordResetToken);
  if (!rtMatches) {
    throw new ForbiddenException('Access Denied');
  }

  // توليد زوج جديد وتحديث الهاش (Token Rotation)
  const tokens = await this.generateTokens(user.id, user.email, user.role);
  const newHashedRt = await bcrypt.hash(tokens.refreshToken, 10);
  
  await this.userRepository.update(user.id, {
    passwordResetToken: newHashedRt,
  });

  return tokens;
  };

  // ============================================================================
  //  إرسال كود استعادة كلمة المرور (Forgot Password)
  // ============================================================================
  public async SendResetPasswordCode(userEmail: string, lang: 'en' | 'ar' = 'en') {
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';
    const cleanedEmail = userEmail.trim().toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email: cleanedEmail },
    });

    const successMsg =
      currentLang === 'ar'
        ? 'إذا كان هذا البريد مسجلاً لدينا، فقد تم إرسال رمز إعادة التعيين إليه'
        : 'If this email is registered, a password reset code has been sent';

    // حماية من تخمين الإيميلات (User Enumeration Protection)
    if (!user) {
      return {
        message: successMsg,
      };
    }

    // توليد رمز مكون من 4 أو 6 أرقام (الأفضل 6 أرقام للأمان)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 دقائق صلاحية

    // تشفير الرمز قبل حفظه في قاعدة البيانات
    const hashedCode = await bcrypt.hash(resetCode, 10);

    // تخزين الرمز المشفر وتاريخ الانتهاء
    user.passwordResetToken = hashedCode; // أو الحقل المخصص في الـ Entity (مثل resetCode)
    user.resetCodeExpiry = expiry;
    await this.userRepository.save(user);

    // إرسال الكود الحقيقي للمستخدم عبر البريد
    await this.mailService.sendResetCodeEmail(user.email, resetCode, currentLang);

    return {
      message: successMsg,
      userName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
    };
  }
  // ============================================================================
  // 5. تعيين كلمة المرور الجديدة (Reset Password)
  // ============================================================================
  public async ResetPassword(resetPasswordDto: ResetPasswordDto,lang: 'en' | 'ar' = 'en',) {
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';
    const { email, newPassword, resetCode } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException(
        currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found',
      );
    }

    // 1. التحقق من وجود التوكن وتاريخ الصلاحية
    const isExpired =
      !user.resetCodeExpiry || new Date() > new Date(user.resetCodeExpiry);

    if (!user.passwordResetToken || isExpired) {
      throw new BadRequestException(
        currentLang === 'ar'
          ? 'رمز التحقق منتهي الصلاحية أو غير صالح'
          : 'Invalid or expired reset code',
      );
    }

    // 2. مطابقة الرمز المدخل مع الـ Hash المخزن في القاعدة
    const isMatch = await bcrypt.compare(
      String(resetCode).trim(),
      user.passwordResetToken,
    );

    if (!isMatch) {
      throw new BadRequestException(
        currentLang === 'ar'
          ? 'رمز التحقق غير صحيح'
          : 'Invalid reset code',
      );
    }

    // 3. تحديث كلمة المرور وتصفير الحقول
    user.passwordHash = await this.hashPasswword(newPassword);
    user.passwordResetToken = null;
    user.resetCodeExpiry = null;

    await this.userRepository.save(user);

    return {
      message:
        currentLang === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح'
          : 'Password changed successfully',
      userName: `\(${user.firstName ?? ''}\)${user.lastName ?? ''}`.trim(),
    };
  }
  // ============================================================================
  // دوال مساعدة (Helpers)
  // ============================================================================
  public async hashPasswword(password: string) {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
  }

  public async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { id: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private generateVerificationLink(userId: string, token: string): string {
    const baseUrl = this.configService.get('APP_URL') || 'http://localhost:5000';
    return `${baseUrl}/api/user/verify-email/${userId}/${token}`;
  }
}