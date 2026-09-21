import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthProvider } from './auth/auth.provider';
import { User } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService ,ConfigModule} from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';



@Module({
  controllers: [UserController],
  providers: [UserService, AuthProvider],
  imports: [
    TypeOrmModule.forFeature([User]),
    // 👈 يجب استيراد JwtModule هنا قبل تصديره
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
    ConfigModule,
    MailModule,
  ],
  exports: [UserService, JwtModule],
})
export class UserModule {}
