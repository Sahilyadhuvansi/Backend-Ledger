# 🛠️ Step-by-Step Implementation Guide

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Backend-Ledger AI Setup](#backend-ledger-setup)
3. [POST_MUSIC AI Setup](#post-music-setup)
4. [Portfolio Setup](#portfolio-setup)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### 1. Prerequisites Installation

```bash
# Check Node.js version (need 18+)
node --version

# If needed, install Node.js
# Visit: https://nodejs.org/

# Install MongoDB (or use Atlas)
# macOS:
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu:
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org

# Or use MongoDB Atlas (recommended)
# Visit: https://www.mongodb.com/cloud/atlas

# Install Redis (optional but recommended)
# macOS:
brew install redis

# Ubuntu:
sudo apt-get install redis-server
```

### 2. Get AI API Keys

#### Anthropic Claude (Primary)
```
1. Visit https://console.anthropic.com/
2. Sign up / Log in
3. Go to API Keys section
4. Create new key
5. Copy: sk-ant-api03-...
```

#### OpenAI (Fallback)
```
1. Visit https://platform.openai.com/
2. Sign up / Log in
3. Go to API Keys
4. Create new secret key
5. Copy: sk-...
```

#### Google Cloud Vision (For OCR)
```
1. Visit https://console.cloud.google.com/
2. Create new project
3. Enable Vision API
4. Create service account
5. Download JSON key file
```

#### Pinecone (For Vector Search)
```
1. Visit https://www.pinecone.io/
2. Sign up for free
3. Create new index
4. Copy API key
```

### 3. Clone Projects

```bash
# Extract the provided zip files
unzip Backend-Ledger-AI-Enhanced.zip
unzip POST_MUSIC-AI-Enhanced.zip
unzip Sahilyadhuvansi-AI-Portfolio.zip
```

---

## Backend-Ledger Setup

### Step 1: Backend Configuration

```bash
cd Backend-Ledger-AI-Enhanced/backend

# Install dependencies
npm install

# This will install:
# - Core: express, mongoose, socket.io
# - AI: @anthropic-ai/sdk, openai, @google-cloud/vision
# - ML: brain.js, natural, tesseract.js
# - Utils: multer, sharp, pdf-parse
```

### Step 2: Environment Configuration

```bash
# Copy example env
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

Fill in these critical values:
```env
# Database
MONGO_URI=mongodb://localhost:27017/backend-ledger-ai
# Or Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your_very_long_secret_key_at_least_32_characters_long

# AI APIs
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY
GOOGLE_CLOUD_KEY_FILE=./config/google-cloud-key.json
```

### Step 3: Set Up Google Cloud Key

```bash
# Create config directory
mkdir -p backend/config

# Place your Google Cloud JSON key
cp ~/Downloads/your-google-key.json backend/config/google-cloud-key.json
```

### Step 4: Database Setup

```bash
# Start MongoDB (if local)
mongod --dbpath /usr/local/var/mongodb

# Or start MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux

# The app will auto-create collections on first run
```

### Step 5: Start Backend

```bash
# Development mode (with auto-reload)
npm run dev

# You should see:
# ✅ MongoDB connected
# 🚀 Server running on http://localhost:3000
```

### Step 6: Test AI Endpoints

```bash
# First, create a user account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Copy the token from response, then test AI chat:
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello, can you help me with my finances?"}'

# Test spending analysis
curl -X GET "http://localhost:3000/api/ai/analyze-spending?period=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 7: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure API endpoint
# Edit src/core/utils/api.js if needed

# Start frontend
npm run dev

# Visit http://localhost:5173
```

### Step 8: Train Fraud Detection Model (Optional)

```bash
cd backend

# After you have some transaction data:
npm run train-fraud-model
```

---

## POST_MUSIC Setup

### Step 1: Backend Configuration

```bash
cd POST_MUSIC-AI-Enhanced/Backend

npm install

cp .env.example .env
```

Configure `.env`:
```env
MONGO_URI=mongodb://localhost:27017/post-music-ai
JWT_SECRET=your_secret_key
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# ImageKit (for file uploads)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### Step 2: Get ImageKit Credentials

```
1. Visit https://imagekit.io/
2. Sign up for free account
3. Go to Developer options
4. Copy Public Key, Private Key, URL Endpoint
```

### Step 3: Start Backend

```bash
npm run dev

# Should see:
# ✅ MongoDB connected
# 🚀 Server running on http://localhost:3001
```

### Step 4: Test Music Recommendations

```bash
# Upload a music file first through the UI
# Then test recommendations:

curl -X GET "http://localhost:3001/api/ai/music/recommendations?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test semantic search:
curl -X POST http://localhost:3001/api/ai/search/semantic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "upbeat morning workout songs"}'
```

### Step 5: Frontend Setup

```bash
cd ../Frontend

npm install

# Configure API endpoint in src/config if needed

npm run dev

# Visit http://localhost:5174
```

---

## Portfolio Setup

### Step 1: Create Portfolio Project (Next.js)

```bash
cd Sahilyadhuvansi-AI-Portfolio

# If starting fresh:
npx create-next-app@latest . --typescript --tailwind --app

# Install AI dependencies
npm install @anthropic-ai/sdk openai langchain @pinecone-database/pinecone

# Install UI dependencies
npm install framer-motion three @react-three/fiber @react-three/drei
npm install react-syntax-highlighter @monaco-editor/react recharts
```

### Step 2: Environment Configuration

```bash
cp .env.example .env.local
```

Configure `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI APIs (server-side)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pc-...
PINECONE_INDEX=portfolio-ai

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 3: Start Development Server

```bash
npm run dev

# Visit http://localhost:3000
```

### Step 4: Test AI Features

```
1. Open the site in browser
2. Click on AI Assistant button
3. Ask: "Tell me about Sahil's projects"
4. Try the code playground
5. Test visitor analytics
```

---

## Testing

### Unit Tests

```bash
# Backend-Ledger
cd Backend-Ledger-AI-Enhanced/backend
npm test

# POST_MUSIC
cd POST_MUSIC-AI-Enhanced/Backend
npm test
```

### Integration Tests

```bash
# Test full user flow
npm run test:integration
```

### AI Feature Tests

Create `test-ai.js`:
```javascript
const aiService = require('./src/common/services/ai.service');

async function testAI() {
  try {
    // Test chat
    const response = await aiService.chat([
      { role: 'user', content: 'Say hello!' }
    ]);
    console.log('✅ AI Chat works:', response.content);

    // Test embeddings
    const embedding = await aiService.generateEmbedding('test text');
    console.log('✅ Embeddings work:', embedding.length);

  } catch (error) {
    console.error('❌ AI Test failed:', error.message);
  }
}

testAI();
```

Run: `node test-ai.js`

---

## Deployment

### Deploy Backend (Railway)

```bash
cd Backend-Ledger-AI-Enhanced/backend

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set MONGO_URI="mongodb+srv://..."
railway variables set JWT_SECRET="..."
railway variables set ANTHROPIC_API_KEY="sk-ant-..."

# Deploy
railway up
```

### Deploy Frontend (Vercel)

```bash
cd Backend-Ledger-AI-Enhanced/frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts, then:
# Set environment variable for API URL
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app

# Deploy to production
vercel --prod
```

### Deploy Portfolio (Vercel)

```bash
cd Sahilyadhuvansi-AI-Portfolio

vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables
```

---

## Troubleshooting

### Issue: "MongoDB connection failed"

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux

# Check connection string
# Ensure no typos in MONGO_URI
```

### Issue: "AI API key invalid"

```bash
# Verify key format:
# Claude: sk-ant-api03-...
# OpenAI: sk-...

# Test key directly:
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Issue: "Port already in use"

```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache if needed
npm cache clean --force
```

### Issue: "Out of memory"

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Issue: "AI responses too slow"

```bash
# Enable Redis caching
# Install Redis
brew install redis  # macOS
sudo apt-get install redis  # Ubuntu

# Start Redis
redis-server

# Update .env
REDIS_URL=redis://localhost:6379
```

### Issue: "Rate limit exceeded"

```bash
# Check AI usage dashboard
# Anthropic: console.anthropic.com
# OpenAI: platform.openai.com/usage

# Implement caching
# Reduce temperature (faster responses)
# Use cheaper models for simple tasks
```

---

## Performance Optimization

### 1. Enable Caching

```javascript
// In ai.service.js
const cache = new Map();

async function chat(messages, options) {
  const cacheKey = JSON.stringify({ messages, options });
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await this._claudeChat(messages, options);
  cache.set(cacheKey, response);
  
  return response;
}
```

### 2. Batch Requests

```javascript
// Instead of multiple calls:
for (let song of songs) {
  await categorize(song);
}

// Batch them:
const categories = await batchCategorize(songs);
```

### 3. Use Cheaper Models for Simple Tasks

```javascript
// For simple classification, use Claude Haiku
if (task === 'simple') {
  model = 'claude-haiku-20240307';  // Cheaper
} else {
  model = 'claude-sonnet-4-20250514';  // More capable
}
```

---

## Monitoring & Maintenance

### Set Up Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start src/index.js --name backend-ledger

# Monitor
pm2 monit

# View logs
pm2 logs backend-ledger

# Set up auto-restart on crash
pm2 startup
pm2 save
```

### Cost Monitoring

```javascript
// Check AI usage stats
GET /api/ai/stats

// Response:
{
  "requestCount": 1523,
  "totalCost": 2.34,
  "avgCostPerRequest": 0.0015
}
```

### Health Checks

```bash
# Check all services
curl http://localhost:3000/health

# Should return:
{
  "status": "healthy",
  "database": "connected",
  "ai": "operational"
}
```

---

## Next Steps

1. ✅ Complete setup of all three projects
2. ✅ Test all AI features locally
3. ✅ Customize for your needs
4. ✅ Deploy to production
5. ✅ Set up monitoring
6. ✅ Gather user feedback
7. ✅ Iterate and improve

---

## Support

If you encounter issues:
1. Check error logs: `pm2 logs` or `npm run dev`
2. Review environment variables
3. Test AI API keys independently
4. Check MongoDB connection
5. Verify network/firewall settings

---

**Happy coding! 🚀**
