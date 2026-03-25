# 🚀 Production Deployment Guide

Complete guide for deploying all three AI-enhanced projects to production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] All API keys acquired (Claude, OpenAI, Google Cloud, Pinecone)
- [ ] Production databases configured (MongoDB Atlas)
- [ ] Redis instance setup (for caching)
- [ ] Domain names purchased/configured
- [ ] SSL certificates ready
- [ ] Email service configured (SendGrid/AWS SES)

### 2. Security Review
- [ ] All secrets in environment variables (not hardcoded)
- [ ] CORS origins properly configured
- [ ] Rate limiting tested
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented where needed

### 3. Performance Optimization
- [ ] Database indexes created
- [ ] Redis caching enabled
- [ ] Static assets CDN configured
- [ ] Image optimization enabled
- [ ] Gzip compression active
- [ ] API response times < 500ms

### 4. Monitoring Setup
- [ ] Error tracking (Sentry/LogRocket)
- [ ] Performance monitoring (New Relic/DataDog)
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Cost tracking (AI API usage)
- [ ] Log aggregation (CloudWatch/Loggly)

---

## 🏗️ Deployment Options

### Option 1: Vercel (Recommended for Quick Start)

**Best for:** All three projects, fastest deployment

#### Backend-Ledger

```bash
# Backend
cd Backend-Ledger-AI-Enhanced/backend
npm install -g vercel
vercel

# Frontend
cd ../frontend
vercel
```

**vercel.json** (backend):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### POST_MUSIC

```bash
# Backend
cd POST_MUSIC-AI-Enhanced/Backend
vercel

# Frontend
cd ../Frontend
vercel
```

#### Portfolio

```bash
cd Sahilyadhuvansi-AI-Portfolio
vercel
```

### Option 2: Railway (Great for Full-Stack)

**Best for:** Projects needing persistent Redis/DB

1. Install Railway CLI:
```bash
npm install -g railway
railway login
```

2. Initialize project:
```bash
railway init
railway add
```

3. Add services:
```bash
railway add redis
railway add mongodb
```

4. Deploy:
```bash
railway up
```

### Option 3: AWS (Enterprise Grade)

**Best for:** High traffic, complex requirements

#### Architecture:
```
ELB → EC2/ECS → RDS MongoDB → S3 (static)
  ↓
CloudFront (CDN)
  ↓
Route53 (DNS)
```

#### Steps:

1. **Setup VPC**
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16
```

2. **Launch EC2/ECS**
```bash
# Use provided CloudFormation template
aws cloudformation create-stack \
  --stack-name ledger-ai-stack \
  --template-body file://cloudformation.yaml
```

3. **Configure Load Balancer**
```bash
aws elbv2 create-load-balancer \
  --name ledger-ai-lb \
  --subnets subnet-xxx subnet-yyy
```

4. **Setup Auto-Scaling**
```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name ledger-ai-asg \
  --min-size 2 --max-size 10
```

### Option 4: DigitalOcean (Cost-Effective)

**Best for:** Budget-conscious deployments

1. **Create Droplet**
   - Ubuntu 22.04
   - 2GB RAM minimum
   - 2 vCPUs

2. **Install Dependencies**
```bash
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt-get install -y redis-server

# Install PM2
npm install -g pm2
```

3. **Deploy Application**
```bash
# Clone repo
git clone your-repo-url
cd Backend-Ledger-AI-Enhanced/backend

# Install dependencies
npm install --production

# Setup environment
nano .env

# Start with PM2
pm2 start src/index.js --name ledger-backend
pm2 startup
pm2 save
```

4. **Setup Nginx**
```bash
sudo apt-get install -y nginx

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/default
```

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

5. **Setup SSL (Let's Encrypt)**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Environment Variables (Production)

### Backend-Ledger Production .env

```env
NODE_ENV=production
PORT=3000

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ledger-prod?retryWrites=true&w=majority

# Security
JWT_SECRET=<generate-strong-secret-256-bit>
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://ledger.yourdomain.com
CORS_ORIGINS=https://ledger.yourdomain.com,https://www.yourdomain.com

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
GOOGLE_CLOUD_KEY_FILE=/app/credentials/google-cloud.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX=ledger-prod

# Cost Controls
AI_DAILY_BUDGET=50.0
ALERT_EMAIL=alerts@yourdomain.com

# Email
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@yourdomain.com

# Redis
REDIS_URL=redis://username:password@redis-host:port

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEW_RELIC_LICENSE_KEY=...
```

### POST_MUSIC Production .env

```env
NODE_ENV=production
PORT=3001

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/music-prod
JWT_SECRET=<strong-secret>

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_CLOUD_KEY_FILE=/app/credentials/google-cloud.json

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourname

# Content Moderation
PERSPECTIVE_API_KEY=...

REDIS_URL=redis://...
SENTRY_DSN=https://...
```

### Portfolio Production .env

```env
NODE_ENV=production

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=portfolio-prod

NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

SENTRY_DSN=https://...
```

---

## 📊 Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to mongodb.com/cloud/atlas
   - Create M10+ cluster for production
   - Choose region closest to users

2. **Configure Network Access**
   - Add IP addresses of your servers
   - Or use 0.0.0.0/0 with strong auth

3. **Create Database Users**
   - Username: ledger-app-prod
   - Strong password (32+ characters)
   - Roles: readWrite on specific database

4. **Create Indexes**
```javascript
// Connect to production DB
use ledger-prod

// User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })

// Transaction indexes
db.transactions.createIndex({ senderId: 1, createdAt: -1 })
db.transactions.createIndex({ receiverId: 1, createdAt: -1 })
db.transactions.createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true })
db.transactions.createIndex({ createdAt: -1 })
db.transactions.createIndex({ isFlagged: 1 })

// Account indexes
db.accounts.createIndex({ userId: 1 }, { unique: true })

// Blacklist indexes (TTL)
db.blacklists.createIndex({ createdAt: 1 }, { expireAfterSeconds: 259200 })
```

5. **Enable Monitoring**
   - Set up alerts for:
     - High CPU usage (> 80%)
     - High connections (> 90%)
     - Slow queries (> 1s)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/deploy.yml**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./backend
          vercel-args: '--prod'

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Frontend
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.FRONTEND_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'
```

---

## 🐋 Docker Deployment

### Backend-Ledger Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### docker-compose.yml (Full Stack)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: always

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      MONGO_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/ledger-prod
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      - mongodb
      - redis
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://backend:3000
    depends_on:
      - backend
    restart: always

volumes:
  mongo-data:
  redis-data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

---

## 📈 Monitoring & Alerts

### Sentry Setup

```javascript
// backend/src/index.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### CloudWatch Metrics

```javascript
// backend/src/common/services/metrics.service.js
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

async function trackMetric(metricName, value) {
  await cloudwatch.putMetricData({
    Namespace: 'LedgerAI',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: 'Count',
      Timestamp: new Date()
    }]
  }).promise();
}

module.exports = { trackMetric };
```

---

## 🔒 Security Hardening

### 1. Rate Limiting (Production)
```javascript
const rateLimit = require('express-rate-limit');

const productionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for production
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.isPremium, // Skip for premium users
});
```

### 2. Helmet Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.yourdomain.com"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.yourdomain.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));
```

### 3. API Key Rotation
```bash
# Rotate keys every 90 days
# Set calendar reminder
# Use AWS Secrets Manager or HashiCorp Vault
```

---

## ✅ Post-Deployment Checklist

- [ ] All services running (docker ps / pm2 list)
- [ ] Database connections working
- [ ] Redis caching functional
- [ ] API endpoints responding (< 500ms)
- [ ] Frontend loading correctly
- [ ] SSL certificates valid
- [ ] CORS configured properly
- [ ] Email sending working
- [ ] AI services connected
- [ ] Error tracking active (Sentry)
- [ ] Monitoring dashboards live
- [ ] Backups configured (daily)
- [ ] Alerts tested
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Documentation updated

---

## 🚨 Troubleshooting Production Issues

### Issue: High API Costs

**Solution:**
```javascript
// Implement aggressive caching
const cache = require('./cache.service');

async function expensiveAICall(input) {
  const cacheKey = `ai:${hash(input)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  const result = await aiService.call(input);
  await cache.set(cacheKey, result, 86400); // 24 hours
  return result;
}
```

### Issue: Database Connection Timeout

**Solution:**
```javascript
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  minPoolSize: 10,
});
```

### Issue: Memory Leaks

**Solution:**
```bash
# Monitor with PM2
pm2 monit

# Increase memory limit
pm2 start src/index.js --max-memory-restart 1G
```

---

## 📞 Support & Maintenance

### Health Check Endpoints

**Test all services:**
```bash
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/ai/stats
```

### Automated Backups

```bash
# MongoDB backup (daily cron)
0 2 * * * mongodump --uri="$MONGO_URI" --out=/backups/$(date +\%Y\%m\%d)
```

---

**Deployment Complete!** 🎉

Your AI-enhanced projects are now live in production!
