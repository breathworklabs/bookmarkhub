# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/sign in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `x-bookmark-manager`
   - **Database Password**: Generate a strong password (save it!) 74u_giN6h4TYw_e
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait for project to be created (1-2 minutes)

## 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:

```
Project URL: https://aadrvhwtkcxcvfpldiov.supabase.co

anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZHJ2aHd0a2N4Y3ZmcGxkaW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU4MzUsImV4cCI6MjA3Mzk1MTgzNX0.xa5WoTSzYO-8I7fvJ5WVlGa2Xp6iWKAS15sf47dlsmA

service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZHJ2aHd0a2N4Y3ZmcGxkaW92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM3NTgzNSwiZXhwIjoyMDczOTUxODM1fQ.Fl5M4zH2L5FBiPiDni9tn6apAGOBMXs6DeFSgB1cpqI
```

## 3. Update Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values:

```env
# Supabase Configuration (Vite format)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJI...your-anon-key...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJI...your-service-role-key...
```

## 4. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

## 5. Enable Authentication (Optional)

If you want user authentication:

1. Go to **Authentication** → **Settings**
2. Configure your preferred auth providers:
   - **Email**: Already enabled
   - **Google**: Add OAuth credentials
   - **GitHub**: Add OAuth credentials
   - etc.

## 6. Test the Connection

1. Restart your development server: `npm run dev`
2. The app should now connect to Supabase
3. Check the browser console for any connection errors
4. Without authentication, the app will use mock data
5. With authentication, the app will use your Supabase database

## 7. Database Tables Created

The schema creates these tables:
- `users` - User profiles
- `bookmarks` - Main bookmarks data
- `collections` - Bookmark folders/collections
- `bookmark_collections` - Many-to-many relationship
- `tags` - Tag management with usage tracking

## 8. Features Available

✅ **With Supabase configured:**
- Real-time bookmark storage
- Full-text search
- User authentication
- Collections and tags
- Multi-user support

✅ **Without Supabase (fallback):**
- Mock data display
- All UI functionality works
- Local-only state management

## Troubleshooting

**Connection errors:**
- Double-check your environment variables
- Ensure project URL is correct (no trailing slash)
- Verify anon key is the public one, not the secret

**Schema errors:**
- Make sure you ran the complete schema
- Check for any SQL execution errors in Supabase dashboard

**Auth errors:**
- Ensure RLS policies are enabled (they're included in the schema)
- Check browser console for detailed error messages

## Next Steps

Once Supabase is configured:
1. The app will automatically detect the configuration
2. Add authentication UI for user login/signup
3. Start using real bookmarks instead of mock data
4. Implement remaining features from the TODO list

---

**Note**: The app is designed to work both with and without Supabase. If you don't configure Supabase, it will continue working with mock data for development and testing purposes.