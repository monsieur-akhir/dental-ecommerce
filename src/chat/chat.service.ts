import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession, ChatSessionStatus } from '../entities/chat-session.entity';
import { ChatMessage, MessageType } from '../entities/chat-message.entity';
import { User } from '../entities/user.entity';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createChatSession(
    userId: number,
    createChatSessionDto: CreateChatSessionDto,
  ): Promise<ChatSession> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Créer la session
    const session = this.chatSessionRepository.create({
      userId,
      subject: createChatSessionDto.subject,
      initialMessage: createChatSessionDto.initialMessage,
      status: ChatSessionStatus.WAITING,
    });

    const savedSession = await this.chatSessionRepository.save(session);

    // Créer le message initial si fourni
    if (createChatSessionDto.initialMessage) {
      await this.chatMessageRepository.save({
        sessionId: savedSession.id,
        senderId: userId,
        content: createChatSessionDto.initialMessage,
        type: MessageType.TEXT,
        isFromSupport: false,
      });
    }

    const result = await this.chatSessionRepository.findOne({
      where: { id: savedSession.id },
      relations: ['user', 'messages', 'assignedTo'],
    });

    if (!result) {
      throw new NotFoundException('Erreur lors de la création de la session');
    }

    return result;
  }

  async sendMessage(
    userId: number,
    sessionId: number,
    sendMessageDto: SendMessageDto,
  ): Promise<ChatMessage> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });

    if (!session) {
      throw new NotFoundException('Session de chat non trouvée');
    }

    // Vérifier que l'utilisateur peut envoyer des messages dans cette session
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const canSendMessage = 
      session.userId === userId || // Propriétaire de la session
      user.role.name === 'admin' || // Admin
      session.assignedToUserId === userId; // Assigné à cette session

    if (!canSendMessage) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à envoyer des messages dans cette session');
    }

    // Créer le message
    const message = this.chatMessageRepository.create({
      sessionId,
      senderId: userId,
      content: sendMessageDto.content,
      type: sendMessageDto.type || MessageType.TEXT,
      fileUrl: sendMessageDto.fileUrl,
      fileName: sendMessageDto.fileName,
      isFromSupport: user.role.name === 'admin' || session.assignedToUserId === userId,
    });

    const savedMessage = await this.chatMessageRepository.save(message);

    // Mettre à jour le statut de la session si nécessaire
    if (session.status === ChatSessionStatus.WAITING && user.role.name === 'admin') {
      session.status = ChatSessionStatus.ACTIVE;
      session.assignedToUserId = userId;
      await this.chatSessionRepository.save(session);
    }

    const result = await this.chatMessageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'session'],
    });

    if (!result) {
      throw new NotFoundException('Erreur lors de la sauvegarde du message');
    }

    return result;
  }

  async getUserChatSessions(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    sessions: ChatSession[];
    total: number;
  }> {
    const [sessions, total] = await this.chatSessionRepository.findAndCount({
      where: { userId },
      relations: ['messages', 'assignedTo'],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { sessions, total };
  }

  async getChatSession(userId: number, sessionId: number): Promise<ChatSession> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user', 'messages', 'messages.sender', 'assignedTo'],
    });

    if (!session) {
      throw new NotFoundException('Session de chat non trouvée');
    }

    // Vérifier les permissions
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const canViewSession = 
      session.userId === userId || // Propriétaire
      user.role.name === 'admin' || // Admin
      session.assignedToUserId === userId; // Assigné

    if (!canViewSession) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à voir cette session');
    }

    // Marquer les messages comme lus
    await this.markMessagesAsRead(userId, sessionId);

    return session;
  }

  async markMessagesAsRead(userId: number, sessionId: number): Promise<void> {
    await this.chatMessageRepository.update(
      {
        sessionId,
        senderId: { $ne: userId } as any, // Messages pas de l'utilisateur actuel
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async closeChatSession(
    userId: number,
    sessionId: number,
    reason?: string,
  ): Promise<ChatSession> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });

    if (!session) {
      throw new NotFoundException('Session de chat non trouvée');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const canClose = session.userId === userId || user.role.name === 'admin';

    if (!canClose) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à fermer cette session');
    }

    if (reason) {
      session.closureReason = reason;
    }

    session.status = ChatSessionStatus.CLOSED;
    session.closedAt = new Date();

    const savedSession = await this.chatSessionRepository.save(session);

    const result = await this.chatSessionRepository.findOne({
      where: { id: savedSession.id },
      relations: ['user', 'messages', 'assignedTo'],
    });

    if (!result) {
      throw new NotFoundException('Erreur lors de la fermeture de la session');
    }

    return result;
  }

  // Méthodes pour les administrateurs
  async getAdminChatSessions(
    adminId: number,
    status?: ChatSessionStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    sessions: ChatSession[];
    total: number;
    stats: {
      waiting: number;
      active: number;
      closed: number;
      resolved: number;
    };
  }> {
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
      relations: ['role'],
    });

    if (!admin || admin.role.name !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }

    const queryBuilder = this.chatSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .leftJoinAndSelect('session.assignedTo', 'assignedTo')
      .leftJoinAndSelect('session.messages', 'messages')
      .orderBy('session.priority', 'DESC')
      .addOrderBy('session.createdAt', 'ASC');

    if (status) {
      queryBuilder.where('session.status = :status', { status });
    }

    const [sessions, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Statistiques
    const stats = await this.getChatStats();

    return { sessions, total, stats };
  }

  async assignChatSession(
    adminId: number,
    sessionId: number,
    assignToUserId?: number,
  ): Promise<ChatSession> {
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
      relations: ['role'],
    });

    if (!admin || admin.role.name !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }

    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session de chat non trouvée');
    }

    const assignToId = assignToUserId || adminId;
    const assignToUser = await this.userRepository.findOne({
      where: { id: assignToId },
      relations: ['role'],
    });

    if (!assignToUser || assignToUser.role.name !== 'admin') {
      throw new NotFoundException('Utilisateur assigné non trouvé ou non autorisé');
    }

    session.assignedToUserId = assignToId;
    session.status = ChatSessionStatus.ACTIVE;

    await this.chatSessionRepository.save(session);

    // Message système
    await this.chatMessageRepository.save({
      sessionId,
      senderId: adminId,
      content: `Session assignée à ${assignToUser.firstName || assignToUser.email}`,
      type: MessageType.SYSTEM,
      isFromSupport: true,
    });

    const savedSession = await this.chatSessionRepository.save(session);

    const result = await this.chatSessionRepository.findOne({
      where: { id: savedSession.id },
      relations: ['user', 'messages', 'assignedTo'],
    });

    if (!result) {
      throw new NotFoundException('Erreur lors de l\'assignation de la session');
    }

    return result;
  }

  async getChatStats(): Promise<{
    waiting: number;
    active: number;
    closed: number;
    resolved: number;
  }> {
    const [waiting, active, closed, resolved] = await Promise.all([
      this.chatSessionRepository.count({ where: { status: ChatSessionStatus.WAITING } }),
      this.chatSessionRepository.count({ where: { status: ChatSessionStatus.ACTIVE } }),
      this.chatSessionRepository.count({ where: { status: ChatSessionStatus.CLOSED } }),
      this.chatSessionRepository.count({ where: { status: ChatSessionStatus.RESOLVED } }),
    ]);

    return { waiting, active, closed, resolved };
  }

  async getUnreadMessagesCount(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role.name === 'admin') {
      // Pour les admins, compter les messages non lus dans toutes les sessions assignées
      return this.chatMessageRepository.count({
        where: {
          isRead: false,
          isFromSupport: false, // Messages des clients
          session: { assignedToUserId: userId },
        },
      });
    } else {
      // Pour les clients, compter les messages non lus dans leurs sessions
      return this.chatMessageRepository.count({
        where: {
          isRead: false,
          isFromSupport: true, // Messages du support
          session: { userId },
        },
      });
    }
  }
}
