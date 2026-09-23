import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthProvider } from './auth/auth.provider';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { JWTPayloadType } from 'utilitis/types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'utilitis/enums';
import { RequestWithCookies } from 'utilitis/interface';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendCodeDto } from './dto/send-code.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly authProvider: AuthProvider,
    private readonly configService: ConfigService,
  ) {}
  //============================================================================
  //This for language of role
  private roleTranslations = {
    ADMIN: { en: 'Admin', ar: 'مدير' },
    PERSON: { en: 'Person', ar: 'شخص' },
  };
  //============================================================================
  // Register a new user
  //============================================================================
  public async Register(registerUserDto: RegisterUserDto, lang: 'en' | 'ar' = 'en') {
    const currentLang = ['en', 'ar'].includes(lang) ? lang : 'en';
    return await this.authProvider.Register(registerUserDto, currentLang);
  };
  //============================================================================
  // Log in a user
  //============================================================================
  public async Login(loginDto: LoginDto,response: Response,lang: 'en' | 'ar' = 'en') {
      lang=['en','ar'].includes(lang)?lang:'en';
      return await this.authProvider.Login(loginDto, response,lang);
  };
  //============================================================================
  // Log out the current user
  //============================================================================
  public async logout(response: Response, req: Request, lang: 'en' | 'ar' = 'en') {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    response.clearCookie('refresh_token', {
    httpOnly: true,
      sameSite: isProduction ? 'strict' : 'lax',
      secure:isProduction,
      path: '/',
    });
    const message =
    lang === 'ar'
      ? 'تم تسجيل الخروج بنجاح'
      : 'Logged out successfully';

  return { message };
  };
  //============================================================================
  // Refresh the access token (used when the current one expires)
  //============================================================================
  public async refreshTokens(userId: string, refreshToken: string) {
  return this.authProvider.refreshTokens(userId, refreshToken);
  };
  // ============================================================================
  // Get Current Authenticated User Profile
  // ============================================================================
  public async getCurrentUser(id: string, lang: 'en' | 'ar' = 'en') {
    // 1. Sanitize requested language parameter
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';

    // 2. Fetch user with selective fields (excludes passwordHash & tokens)
    const user = await this.userModel.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'role',
        'status',
        'emailVerifiedAt',
        'lastLoginAt',
        'createdAt',
      ],
    });

    // 3. Throw localized exception if record does not exist
    if (!user) {
      const message = currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found';
      throw new NotFoundException(message);
    }

    // 4. Return complete profile representation for the owner
    return {
      id: user.id,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      phone: user.phoneNumber,
      role: this.roleTranslations?.[user.role]?.[currentLang] || user.role,
      status: user.status,
      isEmailVerified: Boolean(user.emailVerifiedAt),
      lastLogin: user.lastLoginAt,
      memberSince: user.createdAt,
    };
  };
  // ============================================================================
  // Get User By ID (Public / Administrative Reference)
  // ============================================================================
  public async getUserById(id: string, lang: 'en' | 'ar' = 'en') {
    // 1. Sanitize language input
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';

    // 2. Query target entity by UUID
    const user = await this.userModel.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'status', 'lastLoginAt'],
    });

    // 3. Handle missing resource
    if (!user) {
      const message = currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found';
      throw new NotFoundException(message);
    }

    // 4. Return concise public summary
    return {
      id: user.id,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      phone: user.phoneNumber,
      role: this.roleTranslations?.[user.role]?.[currentLang] || user.role,
      status: user.status,
      lastLogin: user.lastLoginAt,
    };
  };
  //============================================================================
  // Get all users with pagination, search, and role filtering
  //============================================================================
  public async getAllUsers(page: number = 1,limit: number = 10,search?: string,role?: string,lang: 'en' | 'ar' = 'en',) {
  // 1. Sanitize pagination parameters to avoid negative numbers or division by zero
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10)); // Caps max limit to 100
  const skip = (safePage - 1) * safeLimit;
  const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';

  // 2. Initialize QueryBuilder with explicit columns selection (avoids fetching sensitive fields like passwordHash)
  const queryBuilder = this.userModel
    .createQueryBuilder('user')
    .select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.avatarUrl',
      'user.role',
      'user.phoneNumber',
      'user.status',
      'user.lastLoginAt',
      'user.createdAt',
    ]);

  // 3. Filter by search keyword across full name and email
  if (search && search.trim() !== '') {
    queryBuilder.andWhere(
      "(CONCAT(user.firstName, ' ', user.lastName) ILIKE :search OR user.email ILIKE :search)",
      { search: `%${search.trim()}%` },
    );
  }

  // 4. Filter by role if provided
  if (role && role.trim() !== '') {
    queryBuilder.andWhere('user.role = :role', { role: role.trim() });}

  // 5. Apply deterministic sorting and pagination
  queryBuilder
    .orderBy('user.createdAt', 'DESC')
    .skip(skip)
    .take(safeLimit);

  // 6. Fetch paginated data and total count concurrently
  const [users, totalUsers] = await queryBuilder.getManyAndCount();
  const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / safeLimit) : 0;

  // 7. Format the payload and localize dynamic attributes
  const localizedUsers = users.map((u) => ({
    id: u.id,
    fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    email: u.email,
    picture: u.avatarUrl,
    role: this.roleTranslations?.[u.role]?.[currentLang] || u.role,
    phoneNumber: u.phoneNumber,
    status: u.status,
    lastLoginAt: u.lastLoginAt,
  }));

  // 8. Return standardized paginated response structure
  return {
    success: true,
    meta: {
      totalUsers,
      currentPage: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
    data: localizedUsers,
  };
  };
  //============================================================================
  // Update user information
  //============================================================================
  public async update(id: string,currentUser: JWTPayloadType,updateUserDto: UpdateUserDto,lang: 'en' | 'ar' = 'en',): Promise<User> {
    // 1. Sanitize language input
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';

    // 2. Authorization check: User can only update their own profile unless they are an ADMIN
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === 'admin';
    const isOwner = currentUser.id?.toString() === id.toString();

    // 403 Forbidden is the proper HTTP semantic
    if (!isAdmin && !isOwner) {
      const message =
        currentLang === 'ar'
          ? 'غير مسموح لك بتعديل بيانات هذا المستخدم'
          : 'You are not authorized to modify this user';
      throw new ForbiddenException(message); 
    }

    // 3. Find target user in PostgreSQL
    const user = await this.userModel.findOne({ where: { id } });
    if (!user) {
      const message = currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found';
      throw new NotFoundException(message);
    }

    // 4. Validate unique email collision if email is being modified
    if (updateUserDto.email && updateUserDto.email.trim().toLowerCase() !== user.email) {
      const emailExists = await this.userModel.findOne({
        where: {
          email: updateUserDto.email.trim().toLowerCase(),
          id: Not(id),
        },
      });

      if (emailExists) {
        const message =
          currentLang === 'ar'
            ? 'البريد الإلكتروني الجديد مستخدم بالفعل'
            : 'Email is already in use by another account';
        throw new ConflictException(message);
      }

      user.email = updateUserDto.email.trim().toLowerCase();
      // Invalidate previous email verification when changing address
      user.status == 'pending_verification';
      user.emailVerifiedAt = null;
    }

    // 5. Validate unique phone number collision if provided
    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber.trim() !== user.phoneNumber) {
      const phoneExists = await this.userModel.findOne({
        where: {
          phoneNumber: updateUserDto.phoneNumber.trim(),
          id: Not(id),
        },
      });

      if (phoneExists) {
        const message =
          currentLang === 'ar'
            ? 'رقم الهاتف مستخدم بالفعل'
            : 'Phone number is already in use';
        throw new ConflictException(message);
      }

      user.phoneNumber = updateUserDto.phoneNumber.trim();
    }

    // 6. Update general identity fields
    if (updateUserDto.firstName !== undefined) user.firstName = updateUserDto.firstName.trim();
    if (updateUserDto.lastName !== undefined) user.lastName = updateUserDto.lastName.trim();
    if (updateUserDto.avatarUrl !== undefined) user.avatarUrl = updateUserDto.avatarUrl;

    // 7. Strictly enforce role elevation: Only ADMINs can mutate roles
    if (updateUserDto.role !== undefined && isAdmin) {
      user.role = updateUserDto.role;
    }

    // 8. Persist updated user state
    return await this.userModel.save(user);
  }
  //============================================================================
  // Deactivate account (User-initiated or temporary suspension)
  //============================================================================
  public async deactivateAccount(id: string,currentUser: JWTPayloadType,lang: 'en' | 'ar' = 'en',) {
    const currentLang = ['en', 'ar'].includes(lang) ? lang : 'en';
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === 'admin';
    const isOwner = currentUser.id?.toString() === id.toString();

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        currentLang === 'ar' ? 'غير مصرح لك بتعطيل هذا الحساب' : 'Unauthorized to deactivate this account',
      );
    }

    const user = await this.userModel.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found',
      );
    }

    // Update status and revoke refresh token to force logout
    user.status = 'deactivated';
    user.passwordResetToken = null;
    await this.userModel.save(user);

    return {
      success: true,
      message:
        currentLang === 'ar'
          ? 'تم تعطيل الحساب بنجاح وتسجيل الخروج'
          : 'Account has been deactivated successfully',
    };
  }
  //============================================================================
  // Soft delete user (Keeps data for relational integrity like orders/invoices)
  //============================================================================
  public async remove(id: string,currentUser: JWTPayloadType,lang: 'en' | 'ar' = 'en',) {
    const currentLang = ['en', 'ar'].includes(lang) ? lang : 'en';
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === 'admin';
    const isOwner = currentUser.id?.toString() === id.toString();

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        currentLang === 'ar' ? 'غير مصرح لك بحذف هذا الحساب' : 'Unauthorized to delete this account',
      );
    }

    const user = await this.userModel.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found',
      );
    }

    // Revoke active sessions
    user.passwordResetToken = null;
    user.status = 'deactivated';
    await this.userModel.save(user);

    // TypeORM softDelete marks deleted_at with current timestamp
    await this.userModel.softDelete(id);

    return {
      success: true,
      message:
        currentLang === 'ar'
          ? 'تم حذف الحساب بنجاح (حذف مرن)'
          : 'Account has been soft-deleted successfully',
    };
  }
  //============================================================================
  // Restore a Soft-Deleted / Deactivated User Account (Admin Only)
  // ============================================================================
  public async restoreUser(id: string, lang: 'en' | 'ar' = 'en') {
    const currentLang = ['en', 'ar'].includes(lang) ? lang : 'en';

    // 1. Fetch user including soft-deleted records
    const user = await this.userModel.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(
        currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found',
      );
    }

    // 2. Check if the user is neither soft-deleted nor deactivated
    const isSoftDeleted = Boolean(user.deletedAt);
    const isDeactivated = user.status === 'deactivated';

    if (!isSoftDeleted && !isDeactivated) {
      return {
        success: true,
        message:
          currentLang === 'ar'
            ? 'الحساب نشط بالفعل ولا يحتاج استعادة'
            : 'User account is already active',
      };
    }

    // 3. Restore soft delete if deletedAt exists (resets deleted_at to NULL)
    if (isSoftDeleted) {
      await this.userModel.restore(id);
    }

    // 4. Safely update status to 'active' using update query (avoids entity state conflicts)
    await this.userModel.update(id, {
      status: 'active',
    });

    return {
      success: true,
      message:
        currentLang === 'ar'
          ? 'تمت استعادة وتفعيل الحساب بنجاح'
          : 'Account has been restored and activated successfully',
    };
  }
  //============================================================================
  // Verify user's email using a verification token
  //============================================================================
  public async verifyEmail(userId: string, token: string) {
  const user = await this.userModel.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('المستخدم غير موجود');
  }

  // التحقق من تطابق التوكن وحالة الحساب
  if (user.status === 'active' || user.emailVerifiedAt) {
    return { message: 'البريد الإلكتروني مؤكد مسبقاً' };
  }

  if (!user.verificationToken || user.verificationToken !== token) {
    throw new BadRequestException('رمز التحقق غير صالح أو منتهي الصلاحية');
  }

  // تفعيل الحساب وتصفير التوكن لمرة واحدة
  user.emailVerifiedAt = new Date();
  user.verificationToken = null;

  await this.userModel.save(user);

  return {
    message: 'تم تأكيد البريد الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول',
  };
  }
  //============================================================================
  // Send a reset password link to user's email
  public async sendRestPassword(sendCodeDto: SendCodeDto,lang: 'en' | 'ar' = 'en',) {
    const currentLang: 'en' | 'ar' = ['en', 'ar'].includes(lang) ? lang : 'en';
    const { email } = sendCodeDto;

    // 1. Verify Google reCAPTCHA (v2 / v3)
    /*if (recaptchaToken) {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      try {
        const { data } = await axios.post(
          'https://www.google.com/recaptcha/api/siteverify',
          null,
          {
            params: {
              secret: secretKey,
              response: recaptchaToken,
            },
          },
        );

        if (!data.success) {
          throw new BadRequestException(
            currentLang === 'ar'
              ? 'فشل التحقق من أنك لست روبوتاً'
              : 'Failed to verify reCAPTCHA',
          );
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException(
          currentLang === 'ar'
            ? 'خطأ أثناء التحقق من reCAPTCHA'
            : 'Error validating reCAPTCHA token',
        );
      }
    }*/

    // 2. Delegate to AuthProvider
    return this.authProvider.SendResetPasswordCode(email, currentLang);
  }
  //============================================================================
  // Reset the user's password
  public async resetPassword(body: ResetPasswordDto,lang: 'en' | 'ar' = 'en') {
            lang=['en','ar'].includes(lang)?lang:'en';
      return await this.authProvider.ResetPassword(body,lang);
  };
  //============================================================================
}
