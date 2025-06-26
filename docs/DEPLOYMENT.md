# Deployment Guide

This guide covers deploying Number Munchers 3D to various platforms.

## Replit Deployment (Recommended)

The easiest way to deploy Number Munchers 3D is using Replit's built-in deployment:

1. Fork this repository on Replit
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Click the "Deploy" button in Replit
5. Configure your custom domain (optional)

### Environment Variables

No environment variables are required for basic deployment. For production with database:

```bash
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

## Manual Deployment

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL (optional, for user data)

### Build Process

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### File Structure After Build

```
dist/
├── public/          # Client-side assets
│   ├── index.html
│   ├── assets/
│   └── textures/
└── index.js         # Server bundle
```

## Platform-Specific Deployments

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**/*",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

3. Deploy: `vercel --prod`

### Railway

1. Connect your GitHub repository to Railway
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Deploy automatically on push

### Heroku

1. Create `Procfile`:
```
web: npm start
```

2. Set buildpacks:
```bash
heroku buildpacks:set heroku/nodejs
```

3. Configure environment:
```bash
heroku config:set NODE_ENV=production
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t number-munchers-3d .
docker run -p 5000:5000 number-munchers-3d
```

## Database Setup (Optional)

For persistent user data and statistics:

### PostgreSQL Setup

1. Create a PostgreSQL database
2. Set `DATABASE_URL` environment variable
3. Run migrations: `npm run db:push`

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=number_munchers
```

## Performance Optimization

### Client-Side Optimizations

- Enable gzip compression
- Set proper cache headers for static assets
- Use CDN for static files
- Optimize 3D models and textures

### Server-Side Optimizations

```javascript
// Add to server/index.ts
app.use(compression());
app.use('/assets', express.static('dist/public/assets', {
  maxAge: '1y',
  etag: false
}));
```

## Monitoring and Analytics

### Health Check Endpoint

The application includes a health check at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

### Error Monitoring

Integrate with error monitoring services:

```javascript
// Example: Sentry integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

## SSL/HTTPS Configuration

Most platforms handle SSL automatically. For manual deployment:

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Configure HTTPS in Express:

```javascript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(443);
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version (18+ required)
2. **Static files not served**: Verify build output directory
3. **3D models not loading**: Check file paths and CORS headers
4. **Audio not playing**: Ensure HTTPS for autoplay policies

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development npm start
```

### Log Analysis

Check application logs for errors:

```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Docker
docker logs container_name
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancers for multiple instances
- Implement session affinity if needed
- Consider Redis for session storage

### Database Scaling

- Use connection pooling
- Implement read replicas for high traffic
- Consider database sharding for large datasets

## Security Checklist

- [ ] Environment variables properly configured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Dependencies updated
- [ ] Security headers set
- [ ] Input validation enabled
- [ ] Error messages don't expose sensitive data