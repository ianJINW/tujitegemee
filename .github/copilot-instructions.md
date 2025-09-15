# Tujitegemee Project AI Instructions

## Project Overview
Tujitegemee is a full-stack TypeScript web application with a React frontend and Express backend. The project focuses on community engagement and email communication.

## Architecture

### Frontend (`/client`)
- React 19 with TypeScript and Vite
- TailwindCSS for styling
- React Router for navigation
- TanStack Query (React Query) for data fetching
- Axios for API communication

### Backend (`/server`) 
- Express.js with TypeScript
- Nodemailer for email functionality
- CORS and Helmet for security
- Environment variables for configuration

## Key Files and Components

### Frontend Structure
- `src/App.tsx` - Main application component with routing setup
- `src/components/Navbar.tsx` - Navigation component with social links
- `src/pages/*.tsx` - Page components (Us, Stories, Partners, Contacts)
- `src/api/` - API integration layer
  - `axios.ts` - Axios instance with interceptors
  - `api.ts` - API hooks using TanStack Query

### Backend Structure
- `index.ts` - Express server setup with middleware
- `utils/mailer.ts` - Email sending functionality
- `controllers/` - Route handlers

## Development Workflows

### Running the Application
1. Frontend:
   ```bash
   cd client
   npm install
   npm run dev   # Vite dev server on port 5173
   ```

2. Backend:
   ```bash
   cd server
   npm install
   npm run dev   # Nodemon server on port 8080
   ```

### Environment Setup
Required environment variables in `server/.env`:
```
EMAIL_USER=<gmail_address>
EMAIL_PASS=<gmail_app_password>
```

## Common Patterns

### Frontend Patterns
1. Page Components:
   - Use TypeScript FC type
   - Tailwind classes for styling
   - Consistent layout structure with `min-h-screen` containers

2. API Integration:
   - TanStack Query mutations for state management
   - Axios interceptors for auth and error handling
   - Type-safe API payloads

### Backend Patterns
1. Request Handling:
   - TypeScript types for request/response
   - Consistent error handling with status codes
   - Environment variable validation

2. Email Service:
   - Gmail SMTP configuration
   - Structured email templates
   - Error handling with detailed messages

## Cross-Component Communication
- Frontend-Backend: REST API calls through Axios
- Data Flow: React Query → Axios → Express → Nodemailer
- Authentication: Token-based (Bearer) through Axios interceptors

## Testing and Debugging
- Frontend tests use Vite's test runner
- Backend uses Jest (`npm test`)
- Debug logs available through console statements

## Common Gotchas
1. Email Configuration:
   - Gmail requires App Password for SMTP
   - CORS must be configured for frontend communication
   - Verify environment variables before email operations

2. Frontend Routes:
   - All routes must be defined in `App.tsx`
   - Protected routes require token validation
   - 404 handling needed for undefined routes

3. API Calls:
   - Check CORS configuration for development
   - Verify environment variables are loaded
   - Handle network errors appropriately

## Security Considerations
- Use Helmet middleware for HTTP headers
- CORS configuration limits access to frontend origin
- Environment variables for sensitive data
- Token validation in API requests