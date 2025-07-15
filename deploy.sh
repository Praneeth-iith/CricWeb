#!/bin/bash

# Cricket Connect Deployment Script
# Created by Praneeth

echo "🏏 Cricket Connect - Deployment Script"
echo "========================================"

echo "📁 Preparing files for deployment..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "🔧 Building project..."
npm run build

echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=. --site-name=cricket-connect

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://cricket-connect.netlify.app"
echo "📝 To use custom domain cricweb.com:"
echo "   1. Purchase cricweb.com domain"
echo "   2. Go to Netlify Dashboard > Domain Management"
echo "   3. Add custom domain: cricweb.com"
echo "   4. Configure DNS settings as instructed"
echo ""
echo "🎮 Game created by Praneeth"
echo "🏏 Cricket Connect - The Ultimate Cricket Chain Game!"