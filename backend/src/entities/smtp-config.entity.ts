import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('smtp_configs')
export class SmtpConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, default: 'smtp.gmail.com' })
  host: string;

  @Column({ type: 'int', default: 587 })
  port: number;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adminEmail: string;

  @Column({ type: 'boolean', default: false })
  secure: boolean;

  @Column({ type: 'boolean', default: true })
  auth: boolean;

  @Column({ type: 'boolean', default: true })
  starttls: boolean;

  @Column({ type: 'int', default: 5000 })
  connectionTimeout: number;

  @Column({ type: 'int', default: 3000 })
  timeout: number;

  @Column({ type: 'int', default: 5000 })
  writeTimeout: number;

  @Column({ type: 'boolean', default: false })
  debug: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 