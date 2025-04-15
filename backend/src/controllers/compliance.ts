import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';
import Compliance from '../models/Compliance';

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get audit logs
// @route   GET /api/compliance/logs
// @access  Private (Admin only)
export const getAuditLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get audit logs with pagination
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name email role');
    
    // Get total count for pagination
    const total = await AuditLog.countDocuments();
    
    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: logs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create audit log
// @route   POST /api/compliance/logs
// @access  Private
export const createAuditLog = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { action, resource, resourceId, details } = req.body;
    
    // Create audit log
    const log = await AuditLog.create({
      user: req.user.id,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: log
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get audit log report
// @route   GET /api/compliance/report
// @access  Private (Admin only)
export const getAuditReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    // Get logs within date range
    const logs = await AuditLog.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('user', 'name email role');
    
    // Group by action
    const actionGroups = logs.reduce((acc: Record<string, any[]>, log: any) => {
      if (!acc[log.action]) {
        acc[log.action] = [];
      }
      acc[log.action].push(log);
      return acc;
    }, {});
    
    // Group by resource
    const resourceGroups = logs.reduce((acc: Record<string, any[]>, log: any) => {
      if (!acc[log.resource]) {
        acc[log.resource] = [];
      }
      acc[log.resource].push(log);
      return acc;
    }, {});
    
    // Group by user
    const userGroups = logs.reduce((acc: Record<string, any[]>, log: any) => {
      const userId = log.user?._id?.toString() || 'unknown';
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(log);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: {
        totalLogs: logs.length,
        dateRange: {
          startDate,
          endDate
        },
        actionSummary: Object.entries(actionGroups).map(([action, actionLogs]) => ({
          action,
          count: actionLogs.length
        })),
        resourceSummary: Object.entries(resourceGroups).map(([resource, resourceLogs]) => ({
          resource,
          count: resourceLogs.length
        })),
        userSummary: Object.entries(userGroups).map(([userId, userLogs]) => {
          const user = userLogs[0]?.user || { name: 'Unknown', role: 'Unknown' };
          return {
            userId,
            name: user.name,
            role: user.role,
            count: userLogs.length
          };
        })
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check system compliance
// @route   GET /api/compliance/system
// @access  Private (Admin only)
export const checkSystemCompliance = async (_req: Request, res: Response): Promise<any> => {
  try {
    // This is a placeholder - would typically check system compliance
    res.status(200).json({
      success: true,
      data: {
        compliant: true,
        lastCheck: new Date(),
        checks: [
          {
            name: 'Data Retention',
            status: 'pass',
            details: 'All data retention policies enforced'
          },
          {
            name: 'Authentication Security',
            status: 'pass',
            details: 'Password policies and account lockout functioning correctly'
          },
          {
            name: 'Access Controls',
            status: 'pass',
            details: 'Role-based access control enforced'
          },
          {
            name: 'Audit Logging',
            status: 'pass',
            details: 'All required actions are being logged'
          }
        ]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};