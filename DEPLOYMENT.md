# Deployment Guide

This guide covers multiple deployment options for the Smart Reconciliation Visualizer.

## Option 1: Vercel (Recommended - Easiest)

Vercel is the platform created by the Next.js team and offers the best integration.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **That's it!** Your app will be live in minutes at a URL like `https://your-project.vercel.app`

### Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

## Option 2: Netlify

### Steps:

1. **Push your code to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
   - Click "Deploy site"

3. **Configure Next.js for Netlify**
   - Install Netlify plugin: `npm install --save-dev @netlify/plugin-nextjs`
   - Create `netlify.toml` in root directory (see below)

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Option 3: Railway

### Steps:

1. **Push your code to GitHub**

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Next.js
   - Click "Deploy"

3. **Configure Environment Variables** (if needed)
   - Railway will provide a public URL automatically

## Option 4: AWS Amplify

### Steps:

1. **Push your code to GitHub**

2. **Deploy to AWS Amplify**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Click "New app" → "Host web app"
   - Connect to GitHub and select your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Output directory**: `.next`
   - Click "Save and deploy"

## Option 5: Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Update next.config.js for Docker

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
}

module.exports = nextConfig
```

### Build and Run

```bash
# Build Docker image
docker build -t reconciliation-visualizer .

# Run container
docker run -p 3000:3000 reconciliation-visualizer
```

## Option 6: Traditional Server (VPS/Cloud)

### Prerequisites
- Node.js 18+ installed
- PM2 (process manager) installed: `npm install -g pm2`

### Steps:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start npm --name "reconciliation-app" -- start
   ```

3. **Save PM2 configuration**
   ```bash
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx** (reverse proxy)

   Create `/etc/nginx/sites-available/reconciliation-app`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/reconciliation-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Environment Variables

If you need to add environment variables (currently none required):

1. **Vercel**: Project Settings → Environment Variables
2. **Netlify**: Site Settings → Environment Variables
3. **Railway**: Variables tab in project settings
4. **Local**: Create `.env.local` file

## Post-Deployment Checklist

- [ ] Test file upload functionality
- [ ] Verify CSV/Excel parsing works
- [ ] Check reconciliation algorithm performance
- [ ] Test search and filter features
- [ ] Verify responsive design on mobile devices
- [ ] Check browser console for errors
- [ ] Test with sample datasets

## Troubleshooting

### Build Errors
- Ensure Node.js version is 18+ (`node --version`)
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Check for TypeScript errors: `npm run lint`

### Runtime Errors
- Check server logs in your deployment platform
- Verify all dependencies are installed
- Ensure environment variables are set correctly

### File Upload Issues
- Check file size limits (Vercel: 4.5MB, Netlify: 6MB)
- Verify CORS settings if using external APIs
- Check browser console for errors

## Recommended: Vercel

For Next.js applications, **Vercel is the recommended choice** because:
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Free tier is generous
- ✅ Built by the Next.js team

## Getting Your Live Demo URL

After deployment, you'll receive a URL like:
- Vercel: `https://your-project-name.vercel.app`
- Netlify: `https://your-project-name.netlify.app`
- Railway: `https://your-project-name.up.railway.app`

Add this URL to your README.md under "Live Demo" section!
