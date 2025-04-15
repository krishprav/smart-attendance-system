/**
 * Authentication configuration
 * 
 * When deploying to production, replace this with your actual Google OAuth credentials
 */

export const authConfig = {
  // Google OAuth Client ID - replace with your actual client ID when deploying
  googleClientId: "123456789-example.apps.googleusercontent.com",
  
  // Email domain for institutional emails
  allowedEmailDomain: "iiitmanipur.ac.in",
  
  // Authentication settings
  settings: {
    // Minimum password length
    minPasswordLength: 8,
    
    // Whether to allow registration with non-institutional emails (false for stricter security)
    allowNonInstitutionalEmails: false,
    
    // Whether to require face registration for students
    requireFaceRegistration: true,
    
    // Whether to auto-verify emails in development (should be false in production)
    autoVerifyEmails: true,
  }
};

// Instructions for getting a Google OAuth Client ID
// 1. Go to https://console.developers.google.com/
// 2. Create a new project
// 3. Go to "Credentials" and create an OAuth client ID
// 4. Add the authorized JavaScript origins (e.g., http://localhost:3000 for development)
// 5. Copy the client ID and paste it above
