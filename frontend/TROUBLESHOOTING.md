# Frontend Troubleshooting Guide

## Common Issues and Solutions

### 1. "useAuth must be used within an AuthProvider" Error

**Problem**: This error occurs when components try to use the `useAuth` hook but aren't wrapped in the `AuthProvider` context.

**Solutions**:
- Ensure the `Providers.tsx` component is properly imported and used in the root layout.tsx file
- Check that all pages using authentication hooks are within the AuthProvider context
- Clean the Next.js cache by deleting the `.next` folder and restarting the development server
- Use the included `dev-start.bat` script to start the development server with a clean build

### 2. Camera Access Issues

**Problem**: The webcam doesn't initialize or shows errors when trying to access it.

**Solutions**:
- Ensure your browser has camera permissions enabled for localhost
- Check if another application is using the camera
- Try using Google Chrome or Firefox for better WebRTC support
- See the detailed camera troubleshooting guide in the component's README

### 3. Authentication Not Persisting Between Pages

**Problem**: User needs to log in again when navigating between pages.

**Solutions**:
- Check that localStorage is being properly used and the AuthProvider is correctly set up
- Verify the middleware.ts file is correctly configured to check auth on protected routes
- Ensure cookies are being properly set and read for server-side authentication

### 4. Next.js Build Errors

**Problem**: The application fails to build with TypeScript or other errors.

**Solutions**:
- Run `npm run lint` to find and fix linting issues
- Update Next.js to the latest version with `npm install next@latest`
- Check TypeScript errors with `npx tsc --noEmit`
- Delete the node_modules folder and package-lock.json, then run `npm install` again

### 5. API Connection Issues

**Problem**: Frontend cannot connect to backend or ML services.

**Solutions**:
- Verify the services are running (check with system_health_check.bat)
- Ensure environment variables in .env.local are correctly set
- Check for CORS issues in the browser console
- Verify network connectivity between services

## Quick Fixes

### Reset the Frontend

If you encounter persistent issues, try the following reset procedure:

1. Stop the development server
2. Delete the `.next` folder
3. Clear browser cache and cookies for localhost
4. Run `npm run dev` to start with a fresh build

### Fix Auth Provider Issues

To fix auth provider issues:

1. Make sure `layout.tsx` includes:
   ```jsx
   <Providers>
     {children}
     <ToastProvider />
   </Providers>
   ```

2. Delete all browser storage:
   - In Chrome DevTools → Application → Storage → Clear site data

3. Restart the development server with a clean build:
   ```
   dev-start.bat
   ```

## Development Tips

- Use the browser console to check for errors
- Utilize React DevTools to inspect component hierarchies and props
- Use the Network tab in DevTools to monitor API calls
- Check localStorage in the Application tab to verify auth data is being stored correctly

## Need More Help?

If you continue to experience issues, please check the main [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) file for system-wide troubleshooting tips.
