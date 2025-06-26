# SnapVote Deployment Guide

## Common Issues When Deploying

### 1. Environment Variables
**Problem**: Voting works locally but fails when deployed
**Solution**: Set environment variables in your deployment platform

#### For Vercel:
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your_supabase_url
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your_supabase_anon_key

#### For Netlify:
1. Go to Site settings → Environment variables
2. Add the same variables as above

#### For Railway/Render:
1. Go to your project settings
2. Add environment variables in the Variables section

### 2. CORS Issues
**Problem**: Supabase requests blocked by CORS
**Solution**: Configure Supabase to allow your domain

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Add your deployed domain to the "Additional Allowed Origins" list
4. Example: `https://your-app.vercel.app`

### 3. Build Issues
**Problem**: Build fails or app doesn't work after deployment
**Solution**: Check build logs and Node.js version

#### Check your deployment platform's build logs for:
- Node.js version compatibility
- Missing dependencies
- Build errors

#### Ensure your `package.json` has:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 4. Crypto API Issues
**Problem**: `crypto.randomUUID()` not available in some environments
**Solution**: We've implemented a fallback in `lib/utils.ts`

The app now uses a fallback UUID generator that works in all environments.

## Debugging Steps

### 1. Use the Debug Page
Visit `/debug-env` on your deployed app to check:
- Environment variables status
- Supabase connection
- Browser compatibility
- Network status

### 2. Check Browser Console
Open developer tools and look for:
- Network errors
- JavaScript errors
- Supabase connection errors

### 3. Test Supabase Connection
Use the test page at `/test-vote` to:
- Test database connectivity
- Verify RLS policies
- Test vote insertion

## Deployment Platforms

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Netlify
```bash
# Build locally
npm run build

# Deploy the .next folder
# Set environment variables in Netlify dashboard
```

### Railway
```bash
# Connect your GitHub repo
# Railway will auto-deploy
# Set environment variables in Railway dashboard
```

## Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Supabase project allows your domain in CORS
- [ ] Database schema is properly set up
- [ ] RLS policies are configured

## Quick Fix Commands

If you need to update environment variables after deployment:

```bash
# Vercel
vercel env pull .env.local
# Edit .env.local
vercel env push

# Netlify
# Update in dashboard and redeploy
```

## Support

If you're still having issues:
1. Check the debug page at `/debug-env`
2. Compare local vs deployed environment info
3. Check deployment platform logs
4. Verify Supabase project settings 