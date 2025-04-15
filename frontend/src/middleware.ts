import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log which page is being accessed (for debugging)
  console.log(`Middleware processing: ${pathname}`);
  
  // Check if the route is a protected route
  const isStudentRoute = pathname.startsWith('/student');
  const isFacultyRoute = pathname.startsWith('/faculty');
  const isProtectedRoute = isStudentRoute || isFacultyRoute;
  
  // If it's not a protected route, let it pass through
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get the user from cookies/localStorage (in client-side, we'd use localStorage)
  // Since middleware runs on the server, we need to use cookies
  const user = request.cookies.get('user')?.value;
  
  // If no user is found, redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Parse the user cookie
    const userData = JSON.parse(user);
    
    // Check if the user is trying to access their own role's routes
    if (isStudentRoute && userData.role !== 'student') {
      // Faculty trying to access student routes, redirect to faculty dashboard
      return NextResponse.redirect(new URL('/faculty/classes', request.url));
    }
    
    if (isFacultyRoute && userData.role !== 'faculty') {
      // Student trying to access faculty routes, redirect to student dashboard
      return NextResponse.redirect(new URL('/student/profile', request.url));
    }
    
    // Check if student is trying to access routes without face registration
    if (isStudentRoute && userData.role === 'student' && 
        userData.faceRegistered === false && 
        pathname !== '/student/face-registration') {
      console.log('Redirecting to face registration, faceRegistered status:', userData.faceRegistered);
      // Redirect to face registration
      return NextResponse.redirect(new URL('/student/face-registration?firstTime=true', request.url));
    }
  } catch (error) {
    // If there's an error parsing the user cookie, redirect to login
    console.error('Error parsing user cookie:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Let the request pass through
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
