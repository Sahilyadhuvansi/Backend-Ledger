#!/bin/bash

# 🤖 GenAI Enhanced Projects - Quick Start Installation Script
# This script sets up all three AI-enhanced projects

set -e

echo "🤖 Starting GenAI Projects Installation..."
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed.${NC}" >&2; exit 1; }
command -v mongod >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  MongoDB not found. Make sure it's installed or available remotely.${NC}"; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Function to setup project
setup_project() {
    local project_dir=$1
    local project_name=$2
    
    echo "🔧 Setting up $project_name..."
    
    cd "$project_dir"
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        echo "   📦 Installing dependencies..."
        npm install --legacy-peer-deps
        
        # Create .env if it doesn't exist
        if [ ! -f ".env" ]; then
            if [ -f ".env.example" ]; then
                cp .env.example .env
                echo -e "${YELLOW}   ⚠️  Created .env from .env.example - Please configure!${NC}"
            else
                echo -e "${YELLOW}   ⚠️  No .env file found - Please create one!${NC}"
            fi
        fi
        
        echo -e "${GREEN}   ✅ $project_name setup complete${NC}"
    else
        echo -e "${YELLOW}   ⚠️  No package.json found in $project_dir${NC}"
    fi
    
    cd - > /dev/null
    echo ""
}

# Setup Backend-Ledger
if [ -d "Backend-Ledger-AI-Enhanced" ]; then
    echo "=" | perl -ne 'print "=" x 50, "\n"'
    echo "PROJECT 1: Backend-Ledger AI-Enhanced"
    echo "=" | perl -ne 'print "=" x 50, "\n"'
    
    setup_project "Backend-Ledger-AI-Enhanced/backend" "Backend-Ledger Backend"
    setup_project "Backend-Ledger-AI-Enhanced/frontend" "Backend-Ledger Frontend"
fi

# Setup POST_MUSIC
if [ -d "POST_MUSIC-AI-Enhanced" ]; then
    echo "=" | perl -ne 'print "=" x 50, "\n"'
    echo "PROJECT 2: POST_MUSIC AI-Enhanced"
    echo "=" | perl -ne 'print "=" x 50, "\n"'
    
    setup_project "POST_MUSIC-AI-Enhanced/Backend" "POST_MUSIC Backend"
    setup_project "POST_MUSIC-AI-Enhanced/Frontend" "POST_MUSIC Frontend"
fi

# Setup Portfolio
if [ -d "Sahilyadhuvansi-AI-Portfolio" ]; then
    echo "=" | perl -ne 'print "=" x 50, "\n"'
    echo "PROJECT 3: Sahilyadhuvansi AI Portfolio"
    echo "=" | perl -ne 'print "=" x 50, "\n"'
    
    setup_project "Sahilyadhuvansi-AI-Portfolio" "Portfolio"
fi

echo "=" | perl -ne 'print "=" x 50, "\n"'
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo "=" | perl -ne 'print "=" x 50, "\n"'
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure .env files in each project with your API keys:"
echo "   - ANTHROPIC_API_KEY (Claude)"
echo "   - OPENAI_API_KEY (OpenAI)"
echo "   - GOOGLE_CLOUD_KEY_FILE (Google Vision)"
echo "   - PINECONE_API_KEY (Vector DB)"
echo ""
echo "2. Start MongoDB (if running locally):"
echo "   $ mongod"
echo ""
echo "3. Start each project:"
echo ""
echo "   Backend-Ledger:"
echo "   $ cd Backend-Ledger-AI-Enhanced/backend && npm run dev"
echo "   $ cd Backend-Ledger-AI-Enhanced/frontend && npm run dev"
echo ""
echo "   POST_MUSIC:"
echo "   $ cd POST_MUSIC-AI-Enhanced/Backend && npm run dev"
echo "   $ cd POST_MUSIC-AI-Enhanced/Frontend && npm run dev"
echo ""
echo "   Portfolio:"
echo "   $ cd Sahilyadhuvansi-AI-Portfolio && npm run dev"
echo ""
echo "4. Access the applications:"
echo "   - Backend-Ledger: http://localhost:5173"
echo "   - POST_MUSIC: http://localhost:5174"
echo "   - Portfolio: http://localhost:3000"
echo ""
echo "📚 Documentation: See README.md for detailed usage"
echo "🐛 Issues? Check TROUBLESHOOTING.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
