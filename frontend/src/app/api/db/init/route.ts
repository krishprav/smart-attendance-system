// API route to initialize the database
import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/initDb';

export async function GET(req: NextRequest) {
  try {
    // Only allow initialization in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Database initialization is only allowed in development mode' },
        { status: 403 }
      );
    }
    
    const success = await initializeDatabase();
    
    if (success) {
      return NextResponse.json(
        { message: 'Database initialized successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to initialize database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in database initialization route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
