# Supabase Database Setup Instructions

## Prerequisites
- Supabase account created
- Supabase project created
- Access to the Supabase SQL editor

## Setup Steps

### 1. Open Supabase SQL Editor
1. Log in to your Supabase dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### 2. Run the Database Schema
1. Copy the entire contents of `/supabase/schema.sql`
2. Paste it into the SQL editor
3. Click "Run" to execute the SQL

### 3. Verify Tables Created
After running the schema, you should see the following tables in your database:
- `profiles`
- `family_members`
- `budget_categories`
- `budget_items`
- `baby_items`
- `wishlist_items`
- `wishlist_shares`
- `hospital_bag_items`
- `baby_names`
- `baby_name_votes`

### 4. Enable Authentication
1. Go to Authentication > Settings
2. Enable Email/Password authentication
3. Configure email templates if desired

### 5. Set up Storage (Optional)
If you plan to add image uploads later:
1. Go to Storage
2. Create a new bucket called "baby-photos"
3. Set appropriate policies

### 6. Row Level Security
The schema already includes RLS policies, but verify they're working:
1. Go to Authentication > Policies
2. Check that all tables have RLS enabled
3. Review the policies to ensure they match your requirements

### 7. Test the Setup
1. Run the app locally
2. Create a test account
3. Try adding data to each section
4. Verify that data is being saved correctly

## Troubleshooting

### If tables aren't created:
- Check for SQL syntax errors
- Ensure you have the UUID extension enabled
- Try running the schema in smaller chunks

### If authentication isn't working:
- Verify your environment variables are correct
- Check that email/password auth is enabled
- Ensure the Supabase URL and anon key are valid

### If data isn't saving:
- Check browser console for errors
- Verify RLS policies are correct
- Ensure the user is properly authenticated

## Next Steps
Once the database is set up:
1. Test all features locally
2. Invite family members to test
3. Deploy to Cloudflare Pages
