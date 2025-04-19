import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface SessionUser {
  id: string;
  socketId: string;
  role: string;
  sessionId?: string;
}

class WebSocketService {
  private io: SocketIOServer;
  private users: Map<string, SessionUser> = new Map();
  private sessionParticipants: Map<string, Set<string>> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.init();
  }

  private init() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as { id: string };
        
        const user = await User.findById(decoded.id);
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.data.user = {
          id: user._id.toString(),
          role: user.role,
          name: user.name,
          email: user.email,
        };
        
        next();
      } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      this.handleConnection(socket);

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Faculty-specific events
      if (socket.data.user.role === 'faculty') {
        this.setupFacultyEvents(socket);
      }

      // Student-specific events
      if (socket.data.user.role === 'student') {
        this.setupStudentEvents(socket);
      }
    });
  }

  private handleConnection(socket: Socket) {
    const user: SessionUser = {
      id: socket.data.user.id,
      socketId: socket.id,
      role: socket.data.user.role,
    };

    this.users.set(user.id, user);
    socket.emit('connection_success', { message: 'Successfully connected' });
  }

  private handleDisconnect(socket: Socket) {
    const userId = socket.data.user.id;
    const user = this.users.get(userId);

    if (user) {
      // If user was in a session, remove them
      if (user.sessionId) {
        const sessionParticipants = this.sessionParticipants.get(user.sessionId);
        if (sessionParticipants) {
          sessionParticipants.delete(userId);

          // If it was a faculty member, notify all students
          if (user.role === 'faculty') {
            this.io.to(user.sessionId).emit('session_ended', {
              sessionId: user.sessionId,
              message: 'Faculty has ended the session',
            });
          }
        }
      }

      this.users.delete(userId);
    }

    console.log(`User disconnected: ${socket.id}`);
  }

  private setupFacultyEvents(socket: Socket) {
    // Start a session
    socket.on('start_session', (data: { sessionId: string, courseId: string }) => {
      const { sessionId, courseId } = data;
      const userId = socket.data.user.id;
      const user = this.users.get(userId);

      if (user) {
        // Update user's session
        user.sessionId = sessionId;
        this.users.set(userId, user);

        // Join the room
        socket.join(sessionId);

        // Initialize session participants if needed
        if (!this.sessionParticipants.has(sessionId)) {
          this.sessionParticipants.set(sessionId, new Set<string>());
        }

        // Add faculty to participants
        this.sessionParticipants.get(sessionId)?.add(userId);

        // Broadcast session start to all online students
        this.io.emit('session_available', {
          sessionId,
          courseId,
          facultyName: socket.data.user.name,
          startTime: new Date().toISOString(),
        });

        socket.emit('session_started', {
          sessionId,
          message: 'Session started successfully',
        });
      }
    });

    // End a session
    socket.on('end_session', (data: { sessionId: string }) => {
      const { sessionId } = data;
      const userId = socket.data.user.id;
      const user = this.users.get(userId);

      if (user && user.sessionId === sessionId) {
        // Notify all participants
        this.io.to(sessionId).emit('session_ended', {
          sessionId,
          message: 'Session has ended',
        });

        // Clear participants
        this.sessionParticipants.delete(sessionId);

        // Leave the room
        socket.leave(sessionId);

        // Update user
        user.sessionId = undefined;
        this.users.set(userId, user);
      }
    });

    // Attendance update (when a student is marked)
    socket.on('attendance_marked', (data: { 
      sessionId: string, 
      studentId: string,
      status: string,
      method: string
    }) => {
      const { sessionId, studentId, status, method } = data;
      
      // Broadcast to session room
      this.io.to(sessionId).emit('attendance_update', {
        sessionId,
        studentId,
        status,
        method,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupStudentEvents(socket: Socket) {
    // Join a session
    socket.on('join_session', (data: { sessionId: string }) => {
      const { sessionId } = data;
      const userId = socket.data.user.id;
      const user = this.users.get(userId);

      if (user) {
        // Update user's session
        user.sessionId = sessionId;
        this.users.set(userId, user);

        // Join the room
        socket.join(sessionId);

        // Add to participants
        if (!this.sessionParticipants.has(sessionId)) {
          this.sessionParticipants.set(sessionId, new Set<string>());
        }
        this.sessionParticipants.get(sessionId)?.add(userId);

        // Notify student
        socket.emit('session_joined', {
          sessionId,
          message: 'Successfully joined session',
        });

        // Notify faculty
        this.notifyFaculty(sessionId, 'student_joined', {
          sessionId,
          studentId: userId,
          studentName: socket.data.user.name,
        });
      }
    });

    // Leave a session
    socket.on('leave_session', (data: { sessionId: string }) => {
      const { sessionId } = data;
      const userId = socket.data.user.id;
      const user = this.users.get(userId);

      if (user && user.sessionId === sessionId) {
        // Remove from participants
        const participants = this.sessionParticipants.get(sessionId);
        if (participants) {
          participants.delete(userId);
        }

        // Leave the room
        socket.leave(sessionId);

        // Update user
        user.sessionId = undefined;
        this.users.set(userId, user);

        // Notify student
        socket.emit('session_left', {
          sessionId,
          message: 'Successfully left session',
        });

        // Notify faculty
        this.notifyFaculty(sessionId, 'student_left', {
          sessionId,
          studentId: userId,
          studentName: socket.data.user.name,
        });
      }
    });
  }

  // Utility function to notify the faculty member of a session
  private notifyFaculty(sessionId: string, event: string, data: any) {
    // Find faculty member for this session
    for (const [userId, user] of this.users.entries()) {
      if (user.role === 'faculty' && user.sessionId === sessionId) {
        this.io.to(user.socketId).emit(event, data);
        break;
      }
    }
  }

  // Method to broadcast attendance update
  public broadcastAttendanceUpdate(sessionId: string, attendanceData: any) {
    this.io.to(sessionId).emit('attendance_update', {
      ...attendanceData,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to broadcast session update
  public broadcastSessionUpdate(sessionId: string, updateData: any) {
    this.io.to(sessionId).emit('session_update', {
      ...updateData,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to get active sessions
  public getActiveSessions() {
    return Array.from(this.sessionParticipants.keys());
  }

  // Method to get participants in a session
  public getSessionParticipants(sessionId: string) {
    const participants = this.sessionParticipants.get(sessionId);
    if (!participants) return [];
    
    return Array.from(participants).map(userId => {
      const user = this.users.get(userId);
      return {
        id: userId,
        role: user?.role,
      };
    });
  }
}

export default WebSocketService;
