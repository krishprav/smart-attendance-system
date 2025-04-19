# Detailed Guide: Setting Up Google OAuth for Smart Attendance System

This guide provides step-by-step instructions with screenshots to help you set up Google OAuth for the Smart Attendance System.

## Step 1: Go to Google Cloud Console

1. Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account

## Step 2: Create a New Project

1. Click on the project dropdown at the top of the page
2. Click "New Project"
   
   ![New Project](https://i.imgur.com/8JZvLJQ.png)

3. Enter a name for your project (e.g., "Smart Attendance System")
4. Click "Create"

## Step 3: Enable the Google Sign-In API

1. In the left sidebar, navigate to "APIs & Services" > "Library"
   
   ![API Library](https://i.imgur.com/QZqGHJm.png)

2. Search for "Google Identity Services"
3. Click on the API and click "Enable"

## Step 4: Configure the OAuth Consent Screen

1. In the left sidebar, navigate to "APIs & Services" > "OAuth consent screen"
   
   ![OAuth Consent Screen](https://i.imgur.com/JYYNDjJ.png)

2. Select "External" as the user type (or "Internal" if you're using Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - App name: "Smart Attendance System"
   - User support email: Your email address
   - Developer contact information: Your email address
   
   ![App Registration](https://i.imgur.com/L8QJZJZ.png)

5. Click "Save and Continue"
6. Add the necessary scopes:
   - Click "Add or Remove Scopes"
   - Select the following scopes:
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
   
   ![Scopes](https://i.imgur.com/Y9JZmLN.png)

7. Click "Update" and then "Save and Continue"
8. Add test users if needed (your own email is a good start)
9. Click "Save and Continue"
10. Review your settings and click "Back to Dashboard"

## Step 5: Create OAuth Client ID

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
   
   ![Credentials](https://i.imgur.com/8mLKnSJ.png)

2. Click "Create Credentials" > "OAuth client ID"
   
   ![Create OAuth Client ID](https://i.imgur.com/YwQJGXL.png)

3. Select "Web application" as the application type
4. Name: "Smart Attendance System Web Client"
5. Add Authorized JavaScript origins:
   - Click "Add URI"
   - For development: `http://localhost:3000` and `http://localhost:3003`
   - For production: Your actual domain (e.g., `https://attendance.iiitmanipur.ac.in`)
   
   ![JavaScript Origins](https://i.imgur.com/ZQZrJWG.png)

6. Click "Create"
7. A popup will appear with your Client ID and Client Secret. Copy the Client ID.
   
   ![Client ID Created](https://i.imgur.com/W8QJZJZ.png)

## Step 6: Update the Application Configuration

1. Use the provided script to update your client ID:

   **Windows:**
   ```
   update-google-client-id.bat YOUR_CLIENT_ID.apps.googleusercontent.com
   ```

   **Linux/Mac:**
   ```
   ./update-google-client-id.sh YOUR_CLIENT_ID.apps.googleusercontent.com
   ```

   Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with the actual client ID you copied.

2. Alternatively, you can manually edit the `.env.local` file in the `frontend` directory:
   ```
   # Google OAuth
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
   
   # API URLs
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_ML_API_URL=http://localhost:8080
   
   # Authentication
   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=iiitmanipur.ac.in
   ```

## Step 7: Restart the Application

1. Stop the frontend development server (press Ctrl+C in the terminal)
2. Start it again:
   ```
   cd frontend
   npm run dev
   ```

## Step 8: Test the Google Sign-In

1. Open your application in the browser
2. Click on the "Sign in with Google" button
3. Select your Google account
4. If everything is set up correctly, you should be signed in successfully

## Troubleshooting

If you encounter any issues:

1. **Check the Browser Console**
   - Open the browser developer tools (F12 or right-click > Inspect)
   - Go to the Console tab
   - Look for any error messages related to Google OAuth

2. **Verify Your Configuration**
   - Double-check that the client ID in your `.env.local` file matches the one in Google Cloud Console
   - Make sure you've added the correct authorized JavaScript origins

3. **Check the OAuth Consent Screen**
   - Make sure your OAuth consent screen is properly configured
   - If you're in testing mode, ensure your email is added as a test user

4. **Restart Your Development Server**
   - Sometimes changes to environment variables require a server restart

5. **Clear Browser Cache**
   - Clear your browser cache and cookies
   - Try signing in again

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web/sign-in)
