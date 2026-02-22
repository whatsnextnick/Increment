# Netlify MCP Server Setup Guide

This guide will help you configure the Netlify MCP server for deploying your ForgeFit application.

## Prerequisites

- Netlify account (sign up at [netlify.com](https://netlify.com))
- Node.js 18+ installed

## Step 1: Get Your Netlify Access Token

1. **Log in to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in with your account

2. **Generate a Personal Access Token**
   - Click on your profile picture in the top right
   - Select **User settings**
   - Navigate to **Applications** → **Personal access tokens**
   - Click **New access token**
   - Give it a name: `MCP Server Token`
   - Select scopes (or use default full access)
   - Click **Generate token**
   - **Copy the token immediately** (you won't see it again)

## Step 2: Configure the MCP Server

The Netlify MCP server has already been added to `.mcp.json`, but you need to add your token:

```json
{
  "mcpServers": {
    "netlify": {
      "command": "/home/nick_1804/.nvm/versions/node/v22.19.0/bin/npx",
      "args": ["-y", "@netlify/mcp-server-netlify@latest"],
      "env": {
        "NETLIFY_AUTH_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

**Replace `YOUR_NETLIFY_TOKEN_HERE` with your actual token.**

## Step 3: Update .mcp.json

```bash
# Edit .mcp.json and replace the placeholder with your token
nano .mcp.json
# or
code .mcp.json
```

Update the `NETLIFY_AUTH_TOKEN` value:

```json
"NETLIFY_AUTH_TOKEN": "nfp_YOUR_ACTUAL_TOKEN_HERE"
```

## Step 4: Restart Claude Code

For the MCP server to connect, restart Claude Code:

```bash
# Exit current session and restart
exit
claude-code
```

## Available Netlify MCP Tools

Once connected, you'll have access to tools for:

### Site Management
- **List Sites**: View all your Netlify sites
- **Create Site**: Create a new site
- **Update Site**: Update site configuration
- **Delete Site**: Remove a site

### Deployment
- **Deploy Site**: Deploy your built application
- **List Deploys**: View deployment history
- **Get Deploy**: Get details about a specific deployment
- **Cancel Deploy**: Cancel an in-progress deployment

### Environment Variables
- **List Env Vars**: View environment variables
- **Set Env Var**: Add or update environment variables
- **Delete Env Var**: Remove environment variables

### DNS & Domains
- **List Domains**: View configured domains
- **Add Domain**: Add a custom domain
- **Configure DNS**: Set up DNS records

### Build Configuration
- **Get Build Settings**: View build configuration
- **Update Build Settings**: Change build commands, publish directory, etc.

## Deploying ForgeFit to Netlify

### Option 1: Using MCP Tools (Recommended)

Once the MCP server is connected, I can help you:

1. Create a new Netlify site
2. Configure build settings
3. Set environment variables
4. Deploy the application

Just ask me: "Deploy ForgeFit to Netlify"

### Option 2: Manual Deployment via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Option 3: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to Netlify dashboard
3. Click **Add new site** → **Import an existing project**
4. Connect your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Required Environment Variables

When deploying to Netlify, set these environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Build Configuration

Netlify build settings for this project:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This file will be created automatically when using the MCP server.

## Post-Deployment Steps

After deploying to Netlify:

1. **Update Supabase Auth URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set **Site URL** to your Netlify URL: `https://your-app.netlify.app`
   - Add to **Redirect URLs**: `https://your-app.netlify.app/**`

2. **Test the Application**
   - Visit your Netlify URL
   - Test sign up / sign in
   - Test all features
   - Check browser console for errors

3. **Configure Custom Domain** (Optional)
   - In Netlify: Settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed
   - Update Supabase auth URLs to match

## Troubleshooting

### Issue: "Netlify token invalid"

**Solution:**
- Generate a new token from Netlify dashboard
- Update `.mcp.json` with new token
- Restart Claude Code

### Issue: Build fails on Netlify

**Solution:**
- Check build logs in Netlify dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct build script
- Check Node version (Netlify uses Node 18 by default)

### Issue: Authentication not working after deploy

**Solution:**
- Verify Supabase auth URLs include your Netlify URL
- Check redirect URLs in Supabase dashboard
- Clear browser cache and try again

### Issue: Environment variables not loading

**Solution:**
- Ensure variables are prefixed with `VITE_`
- Variables must be set in Netlify dashboard (not just in code)
- Redeploy after adding variables

## Security Notes

- **Never commit** your Netlify token to git
- Add `.mcp.json` to `.gitignore` if it contains tokens
- Use environment variables for all secrets
- Rotate tokens regularly
- Use minimum required scopes for tokens

## Continuous Deployment

Once connected to git:

1. Every push to `main` branch triggers automatic deploy
2. Pull requests create preview deployments
3. View deploy previews before merging

## Monitoring

After deployment, monitor your site:

- **Analytics**: Netlify Analytics (paid feature)
- **Functions**: Edge Function logs
- **Forms**: Form submission tracking
- **Bandwidth**: Usage statistics

## Support

For issues with Netlify MCP server:
- Netlify Docs: https://docs.netlify.com
- MCP Server Issues: https://github.com/netlify/mcp-server-netlify

---

## Quick Start Checklist

- [ ] Create Netlify account
- [ ] Generate personal access token
- [ ] Update `.mcp.json` with token
- [ ] Restart Claude Code
- [ ] Verify MCP connection
- [ ] Deploy application
- [ ] Configure environment variables
- [ ] Update Supabase auth URLs
- [ ] Test deployed application
- [ ] (Optional) Set up custom domain

Once configured, you can deploy updates with a single command through the MCP server!
