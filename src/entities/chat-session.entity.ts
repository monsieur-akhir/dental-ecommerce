import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';

export enum ChatSessionStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  CLOSED = 'closed',
  RESOLVED = 'resolved',
}

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ChatSessionStatus,
    default: ChatSessionStatus.WAITING,
  })
  status: ChatSessionStatus;

  @Column({ nullable: true })
  subject: string;

  @Column('text', { nullable: true })
  initialMessage: string;

  @Column({ nullable: true })
  assignedToUserId: number;

  @Column({ nullable: true })
  closedAt: Date;

  @Column('text', { nullable: true })
  closureReason: string;

  @Column({ type: 'int', default: 0 })
  priority: number; // 0 = low, 1 = medium, 2 = high, 3 = urgent

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => User, user => user.chatSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToUserId' })
  assignedTo: User;

  @OneToMany(() => ChatMessage, message => message.session)
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Propriété pour la relation
  userId: number;
}

