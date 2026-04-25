import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Logger } from '../../../utils/logger';
import jwt from 'jsonwebtoken';

export class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;
    private user_sockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

    private constructor() {}

    public static get_instance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // JWT AUTH Middleware
        this.io.use((socket, next) => {
            const token = socket.handshake.query.token as string;
            Logger.info(`[SocketAuth] Attempting connection with token: ${token ? 'Present' : 'Missing'}`, 'Socket');
            
            if (!token) {
                Logger.error('[SocketAuth] Authentication failed: Token missing', 'Socket');
                return next(new Error('Authentication error: Token missing'));
            }

            try {
                const secret = process.env.JWT_SECRET || 'locaura_secret_key';
                const decoded = jwt.verify(token, secret) as { id: string };
                (socket as any).userId = decoded.id;
                Logger.success(`[SocketAuth] User ${decoded.id} authenticated successfully`, 'Socket');
                next();
            } catch (err: any) {
                Logger.error(`[SocketAuth] Authentication failed: ${err.message}`, 'Socket');
                return next(new Error('Authentication error: Invalid token'));
            }
        });

        this.io.on('connection', (socket) => {
            const userId = (socket as any).userId;
            
            if (userId) {
                Logger.info(`Secure User ${userId} joined via socket ${socket.id}`, 'Socket');
                const sockets = this.user_sockets.get(userId) || [];
                sockets.push(socket.id);
                this.user_sockets.set(userId, sockets);
                
                // Track disconnect
                socket.on('disconnect', () => {
                   const updated = (this.user_sockets.get(userId) || []).filter(id => id !== socket.id);
                   if (updated.length === 0) {
                       this.user_sockets.delete(userId);
                   } else {
                       this.user_sockets.set(userId, updated);
                   }
                   Logger.info(`Socket ${socket.id} disconnected for user ${userId}`, 'Socket');
                });
            }

            // JOIN specific rooms (e.g., store_room_ID)
            socket.on('join_store', (storeId: string) => {
                socket.join(`store_${storeId}`);
                Logger.info(`Socket ${socket.id} joined store channel store_${storeId}`, 'Socket');
            });
        });

        Logger.success('Secured Socket.io integrated successfully', 'Socket');
    }

    /**
     * Send real-time data to a specific user (across all their active connections)
     */
    public emit_to_user(userId: string, event: string, data: any) {
        const socketIds = this.user_sockets.get(userId);
        if (socketIds && this.io) {
            socketIds.forEach(id => this.io!.to(id).emit(event, data));
        }
    }

    /**
     * Notify an entire store (all its workers/retailers)
     */
    public emit_to_store(storeId: string, event: string, data: any) {
        if (this.io) {
            this.io.to(`store_${storeId}`).emit(event, data);
        }
    }

    public get_io() {
        return this.io;
    }
}
