# Cloudflare Pages Deployment Guide

## Prerequisites
- Cloudflare account
- GitHub repository connected
- Build completed locally without errors

## Deployment Steps

### 1. Build the App Locally First
```bash
npm run build
```
This creates a `build` folder with optimised production files.

### 2. Set up Cloudflare Pages

1. Log in to Cloudflare Dashboard
2. Go to "Pages" in the sidebar
3. Click "Create a project"
4. Choose "Connect to Git"

### 3. Connect GitHub Repository

1. Authorise Cloudflare to access your GitHub
2. Select the `BabyTracker` repository
3. Click "Begin setup"

### 4. Configure Build Settings

Set the following build configuration:
- **Framework preset**: Create React App
- **Build command**: `npm run build`
- **Build output directory**: `build`
- **Root directory**: `/` (leave empty)

### 5. Set Environment Variables

Add your Supabase credentials:
1. Click "Environment variables"
2. Add the following:
   - `REACT_APP_SUPABASE_URL`: Your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon key

### 6. Deploy

1. Click "Save and Deploy"
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be available at `[project-name].pages.dev`

### 7. Custom Domain (Optional)

To use a custom domain:
1. Go to your Pages project
2. Click "Custom domains"
3. Add your domain
4. Follow DNS configuration instructions

## Post-Deployment

### Update GitHub for Auto-Deploy

Future pushes to the main branch will automatically deploy:
1. Make changes locally
2. Commit and push to GitHub
3. Cloudflare will automatically rebuild and deploy

### Monitor Deployments

1. Check the "Deployments" tab in your Pages project
2. View build logs if there are issues
3. Roll back to previous deployments if needed

## Environment Variables Best Practices

- Never commit `.env` files to GitHub
- Always use `REACT_APP_` prefix for React env vars
- Keep production and development credentials separate
- Rotate keys periodically for security

## Troubleshooting

### Build Fails
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Site Not Loading
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure all API endpoints are accessible

### Performance Issues
- Enable Cloudflare caching
- Optimise images and assets
- Consider using Cloudflare Workers for API calls

## Security Checklist

- [x] Environment variables set in Cloudflare, not in code
- [x] `.env` file is in `.gitignore`
- [x] Supabase RLS policies are enabled
- [x] No sensitive data in client-side code
- [x] HTTPS is enforced (automatic with Cloudflare)
