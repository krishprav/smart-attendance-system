// Centralized session data store for faculty and student portals
// In a real app, this would be an API/database. Here it's a shared file for demo.

export interface Session {
  id: string;
  courseCode: string;
  title: string;
  faculty: string;
  date: string; // ISO format
  time: string; // e.g., '10:00 AM - 11:00 AM'
  location: string;
  description?: string;
}

// Demo: Initial sessions (can be empty)
export const sessions: Session[] = [];
