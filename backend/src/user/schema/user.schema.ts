import {Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,Index, DeleteDateColumn,} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from 'utilitis/enums';

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  //============================================================================
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;
  //============================================================================
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phoneNumber: string;
  //============================================================================
  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;
  //============================================================================
  @Column({type: 'enum',enum: UserRole,default: UserRole.CUSTOMER,})
  role: UserRole;
  //============================================================================
  // الحالات الممكنة: pending_verification, active, deactivated, suspended
  @Column({ default: 'pending_verification' })
  status: string;
  //============================================================================
  @Column({ type: 'varchar', length: 100 })
  firstName: string;
  //============================================================================
  @Column({ type: 'varchar', length: 100 })
  lastName: string;
  //============================================================================
  @Column({ type: 'text', nullable: true })
  avatarUrl: string;
  //============================================================================
  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date;
  //============================================================================
  @Column({ type: 'timestamptz', nullable: true })
  phoneVerifiedAt: Date;
  //============================================================================
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string;
  //============================================================================
  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpiresAt: Date;
  //============================================================================
  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;
  //============================================================================
  @Column({ type: 'inet', nullable: true })
  lastLoginIp: string;
  //============================================================================
  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;
  //============================================================================
  @Column({ type: 'timestamptz', nullable: true })
  lockoutUntil: Date;
  //============================================================================
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  //============================================================================
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
  //============================================================================
  @Column({ name: 'verificationToken', type: 'varchar', nullable: true })
  verificationToken: string | null;
  //============================================================================
  @Column({ default: false })
  isAccountverified: boolean;
  //============================================================================
   @Column({ type: 'varchar',default: false })
  refreshToken?: string | null;
  //============================================================================
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}