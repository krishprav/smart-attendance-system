# Setting Up Google OAuth for Smart Attendance System

This guide will help you set up Google OAuth for the Smart Attendance System.

## Prerequisites

- A Google account
- Access to the [Google Cloud Console](https://console.cloud.google.com/)

## Steps to Create a Google OAuth Client ID

1. **Go to the Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top of the page
   - Click "New Project"
   - Enter a name for your project (e.g., "Smart Attendance System")
   - Click "Create"

3. **Enable the Google Sign-In API**
   - In the left sidebar, navigate to "APIs & Services" > "Library"
   - Search for "Google Sign-In API" or "Google Identity Services"
   - Click on the API and click "Enable"

4. **Configure the OAuth Consent Screen**
   - In the left sidebar, navigate to "APIs & Services" > "OAuth consent screen"
   - Select "External" as the user type (or "Internal" if you're using Google Workspace)
   - Click "Create"
   - Fill in the required information:
     - App name: "Smart Attendance System"
     - User support email: Your email address
     - Developer contact information: Your email address
   - Click "Save and Continue"
   - Add the necessary scopes (at minimum, include "email" and "profile")
   - Click "Save and Continue"
   - Add test users if needed
   - Click "Save and Continue"
   - Review your settings and click "Back to Dashboard"

5. **Create OAuth Client ID**
   - In the left sidebar, navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Name: "Smart Attendance System Web Client"
   - Add Authorized JavaScript origins:
     - For development: `http://localhost:3000` and `http://localhost:3003`
     - For production: Your actual domain (e.g., `https://attendance.iiitmanipur.ac.in`)
   - Add Authorized redirect URIs (if needed):
     - For development: `http://localhost:3000/auth/callback` and `http://localhost:3003/auth/callback`
     - For production: Your actual callback URL
   - Click "Create"
   - Note down the Client ID (you'll need this for configuration)

## Configuring the Application

1. **Update Environment Variables**
   - Create or edit the `.env.local` file in the `frontend` directory
   - Add the following line:
     ```
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
     NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=iiitmanipur.ac.in
     ```
   - Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with the actual client ID you received from Google

2. **Restart the Application**
   - Stop and restart the frontend development server to apply the changes

## Troubleshooting

If you encounter any issues with Google OAuth, check the following:

1. **Verify Client ID**
   - Make sure the client ID in your `.env.local` file matches the one in the Google Cloud Console

2. **Check Authorized Origins**
   - Ensure that the URL you're accessing the application from is listed in the Authorized JavaScript origins

3. **Browser Console Errors**
   - Check the browser console for any errors related to Google OAuth

4. **OAuth Consent Screen Configuration**
   - Make sure your OAuth consent screen is properly configured and published

5. **API Enabled**
   - Verify that the Google Sign-In API is enabled for your project

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web/sign-in)
