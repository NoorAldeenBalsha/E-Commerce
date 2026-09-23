import { BadRequestException,ParseUUIDPipe, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorator/current-user.decorator';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import type { JWTPayloadType } from 'utilitis/types';
import type { Request, Response } from 'express';
import { AuthRolesGuard } from './guard/auth-role.guard';
import { Roles } from './decorator/user-role.decorator';
import { UserRole } from 'utilitis/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import type { RequestWithCookies } from 'utilitis/interface';
import { SendCodeDto } from './dto/send-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Users')
@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}
  //============================================================================
  //Register a new user [Public]
  //============================================================================
  @Post('auth/register')
  @ApiBody({ description: 'Register User DTO', type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  public Register(
    @Body() createUserDto: RegisterUserDto,
    @Req() req: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.Register(createUserDto, lang);
  }
  //============================================================================
  //Login user and issue access/refresh tokens [Public]
  //============================================================================
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Login User DTO', type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  public async Login(
    @Body() loginUser: LoginDto,
    @Res({ passthrough: true }) response:Response,
    @Req() req: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.Login(loginUser, response, lang);
  }
  //============================================================================
  //Get details of the currently authenticated user [Any logged-in user]
  //============================================================================
  @Get('current-user')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({ status: 200, description: 'Current user retrieved successfully' })
  public getCurrentUser(
    @CurrentUser() userPayload: JWTPayloadType,
    @Req() req?: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.getCurrentUser(userPayload.id, lang);
  }
  //============================================================================
  // Get user by Id [Any logged-in user]
  //============================================================================
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by Id' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public getUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const lang = req.lang || 'en';
    return this.userService.getUserById(id, lang);
  }
  //============================================================================
  //Login with google account [Public]
  /*@Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with google account' })
  @ApiResponse({ status: 200, description: 'Operation is success' })
  async googleLogin(
    @Body('credential') credential: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const lang = req.headers['lang'] === 'ar' || req.headers['language'] === 'ar' ? 'ar' : 'en';

    if (!credential) {
      throw new BadRequestException(
        lang === 'ar' ? 'رمز جوجل مطلوب' : 'Google token is required',
      );
    }

    try {
      const loginData = await this.userService.loginWithGoogle(credential, res);
      return {
        message: lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful',
        accessToken: loginData.accessToken,
        userData: {
          fullName: loginData.user.fullName,
          email: loginData.user.email,
          picture: loginData.user.picture,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.response || error.message);
    }
  } */
  //============================================================================
  //Callback  Google [Public]
  /*@Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback  Google' })
  @ApiResponse({ status: 200, description: 'Operation is success' })
  async googleAuthRedirect(
     @Res({ passthrough: true }) res: Response,
    @Req() req
   ) {
    const data = await this.userService.loginWithGoogle(req.user,res);

    return this.userService.loginWithGoogle(req.user,res);
  }*/
  //============================================================================
  //Logout user and clear the refresh token cookie [Public]
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and clear refresh token cookie' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  public logout(
    @Res({ passthrough: true }) response: Response,
    @Req() req: any
  ) {
    const lang = req.lang || 'en';
    return this.userService.logout(response, req, lang);
  }
  //============================================================================
  //Issue a new access token using the refresh token from cookies [Public]
  //============================================================================
  @Get('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'New access token generated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  public async refreshTokens(
  @Body('userId') userId: string,
  @Body('refreshToken') refreshToken: string,
) {
  return this.userService.refreshTokens(userId, refreshToken);
}
  //============================================================================
  //Send reset password code to email [Public]
  //============================================================================
  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Send Code DTO', type: SendCodeDto })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  public forgotPassword(
    @Body() body: SendCodeDto,
    @Req() req: any,
  ) {
    const lang = req?.lang || 'en';
    return this.userService.sendRestPassword(body, lang);
  }
  //============================================================================
  //Reset password using code/token [Public]
  //============================================================================
  @Post('reset-password')
  @ApiBody({ description: 'Reset Password DTO', type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  public resetPassword(@Body() body: ResetPasswordDto, @Req() req: any) {
    const lang = req.lang || 'en';
    return this.userService.resetPassword(body, lang);
  }
  //============================================================================
  //Email verification endpoint after registration [Public]
  //============================================================================
 @Get('verify-email/:userId/:token')
  public async verifyEmail(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    await this.userService.verifyEmail(userId, token);
    
    // إعادة التوجيه لصفحة تسجيل الدخول مع بارامتر نجاح
    return res.redirect('http://localhost:3000/login?verified=true');
  }
  //============================================================================
  //Get list of all users with filters and pagination [Admin ,Manager]
  //============================================================================
  @Get()
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN,UserRole.MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  public getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Req() req?: any
  ) {
    const lang = req.lang || 'en';
    return this.userService.getAllUsers(+page, +limit, search, role, lang);
  }
  //============================================================================
  //Update user data [Admin  or current user]
  //============================================================================
  @Patch('update/:id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN ,UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update user information (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only ADMIN allowed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req?: any,
  ) {
    const lang = req?.lang || 'en';
    return this.userService.update(id, payload, updateUserDto, lang);
  }
  //============================================================================
  // Deactivate User Account (Self or Admin)
  // ============================================================================
  @Patch('deactivate/:id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Deactivate user account temporarily (Self or Admin)' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not authorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() payload: JWTPayloadType,
    @Req() req?: any,
  ) {
    const lang = req?.lang || 'en';
    return this.userService.deactivateAccount(id, payload, lang);
  }
  // ============================================================================
  // Soft Delete User Account (Self or Admin)
  // ============================================================================
  @Delete(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Soft delete user account (Self or Admin)' })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not authorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() payload: JWTPayloadType,
    @Req() req?: any,
  ) {
    const lang = req?.lang || 'en';
    return this.userService.remove(id, payload, lang);
  }
  // ============================================================================
  // Restore Soft-Deleted User Account (Admin Only)
  // ============================================================================
  @Patch('restore/:id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Restore a soft-deleted user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only ADMIN allowed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public restore(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req?: any,
  ) {
    const lang = req?.lang || 'en';
    return this.userService.restoreUser(id, lang);
  }
  //============================================================================
  // analytices data for users [Public]
  //============================================================================
 /* @Get('analytices/user')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN,UserRole.MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({summary: 'Comprehensive user analytics',  })
  @ApiResponse({status: 200,description: 'Successfully retrieved user analytics.',})
  async getUserAnalytices(){
    return this.userAnalyticsService.getUserAnalytics();
  }*/
}
