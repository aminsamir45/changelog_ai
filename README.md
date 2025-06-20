# AI-Powered Changelog Generator

A complete solution that generates user-friendly changelogs from Git commits using AI, with both a developer CLI tool and a beautiful web interface.

## 🎯 Overview

This project solves the common developer pain point of writing changelogs by:
1. **Analyzing Git commits** - Automatically gathering recent changes from your repository
2. **AI Summarization** - Using Anthropic's Claude to convert technical commits into user-friendly bullet points  
3. **Version Detection** - Smart semantic versioning analysis (MAJOR/MINOR/PATCH)
4. **Beautiful Publishing** - Displaying changelogs on a clean, Stripe-inspired website

## ✨ Features

### CLI Tool (`changelog-ai`)
- 🚀 **One-command generation**: `changelog-ai generate --commits 10`
- 🤖 **Stripe-style AI format** - professional, user-friendly changelogs
- 📊 **Smart version detection** with confidence scoring
- 🔄 **Duplicate prevention** - tracks processed commits
- 📈 **History tracking** - view all generated changelogs
- ⚙️ **Flexible options** - by commit count or date range

### Website (`/web`)
- 🌙 **Dark theme** inspired by Stripe's changelog
- 📱 **Responsive design** with hover effects
- 🏷️ **Version badges** with emojis (🚨 MAJOR, ✨ MINOR, 🔧 PATCH)
- 📊 **Confidence indicators** showing AI certainty
- ⏰ **Relative timestamps** ("9 minutes ago")
- 🔗 **Clickable cards** leading to detailed views
- 📋 **Organized sections** (Features, Bug Fixes, Improvements, Breaking Changes)

## 🚀 Quick Start

### 1. Setup
```bash
# Clone and install
git clone <repo>
cd changelog-ai
npm run install:all

# Configure AI (required)
cp .env.example .env
# Add your ANTHROPIC_API_KEY
```

### 2. Generate Your First Changelog
```bash
# Initialize project structure
npx changelog-ai init

# Generate from last 5 commits
npx changelog-ai generate --commits 5

# Or generate from a specific date
npx changelog-ai generate --since "2024-01-01"
```

### 3. View on Website
```bash
# Start the website
npm run dev:web

# Visit http://localhost:3000
```

## 📁 Architecture

```
changelog-ai/
├── cli/                    # Node.js CLI tool
│   ├── commands/          # Command implementations
│   │   ├── init.js       # Project setup
│   │   ├── generate.js   # Main changelog generation
│   │   └── history.js    # View generated changelogs
│   ├── services/         # Core business logic
│   │   ├── git.js        # Git operations & commit analysis
│   │   ├── anthropic.js  # AI summarization
│   │   └── version-analyzer.js  # Semantic version detection
│   └── index.js          # CLI entry point
├── web/                   # Next.js website
│   ├── src/app/          # Pages and layouts
│   ├── src/lib/          # Utility functions
│   └── package.json      # Web dependencies
├── changelogs/           # Generated markdown files
│   ├── *.md             # Individual changelog files
│   └── metadata.json    # Index and tracking
└── package.json          # Root project config
```

## 🎨 Design Philosophy

### CLI Tool
- **Developer-first**: Simple commands, clear output
- **Smart defaults**: Works out of the box
- **Comprehensive**: Handles edge cases and errors gracefully

### Website
- **Stripe-inspired**: Professional, minimal design
- **Dark theme**: Easy on developer eyes
- **Performance-focused**: Static generation for speed
- **User-friendly**: Intuitive navigation and clear information hierarchy

## 🔧 Commands

```bash
# Setup project
changelog-ai init

# Generate changelog
changelog-ai generate [options]
  --commits <number>     Number of recent commits to analyze
  --since <date>         Generate from commits since date (YYYY-MM-DD)

# View history
changelog-ai history [options]
  --limit <number>       Limit number of entries shown
  --json                 Output as JSON

# Website
npm run dev:web          Start development server
npm run build:web        Build for production
npm run start:web        Start production server
```

## 🤖 AI Integration

The tool uses **Anthropic's Claude** with carefully crafted prompts to generate **Stripe-style changelog entries**:

### New Stripe-Style Format
1. **Descriptive Titles**: "Adds balance types to the Balance Transactions API" 
2. **What's New Summary**: Clear, non-technical overview of changes
3. **Impact Explanation**: How changes affect users and why they matter
4. **Categorized Changes**: Technical details organized by type
5. **Upgrade Instructions**: Step-by-step guidance when needed
6. **Related Changes**: Cross-references to connected updates

### AI Processing Pipeline
1. **Commit Analysis**: Examines messages, diffs, and patterns
2. **Impact Assessment**: Determines user-facing effects
3. **Narrative Construction**: Builds coherent story around changes
4. **Professional Writing**: Creates publication-ready content
5. **Version Detection**: Analyzes semantic versioning implications with confidence scoring

### Example Stripe-Style Output
```markdown
# Introduces real-time notifications

## What's new
This release adds real-time notifications that keep users informed about important events as they happen.

## Impact  
Users can now receive instant alerts about critical system events, reducing response times and improving workflow efficiency. The notifications are customizable, allowing users to filter and prioritize information.

```

**📖 See [STRIPE_CHANGELOG_FORMAT.md](STRIPE_CHANGELOG_FORMAT.md) for complete documentation**

## 📊 Version Analysis

The tool includes sophisticated version detection:

- **Pattern Matching**: Recognizes conventional commit formats
- **Content Analysis**: AI analyzes actual changes
- **Confidence Scoring**: Provides 0-100% confidence in recommendations
- **Cross-validation**: Combines multiple analysis methods

## 🛠️ Tech Stack

- **CLI**: Node.js, Commander.js, Simple-git
- **AI**: Anthropic Claude API
- **Website**: Next.js 15, TypeScript, Tailwind CSS
- **Storage**: Markdown files with frontmatter
- **Parsing**: Gray-matter for frontmatter processing

## 🎯 Product Decisions

1. **Simplicity over complexity**: One command generates everything
2. **Markdown storage**: Human-readable, git-friendly format
3. **Static website**: Fast, deployable anywhere
4. **Dark theme**: Developer-focused aesthetic
5. **AI-first**: Let Claude handle the hard work of summarization

## 🚀 Deployment

The website can be deployed to any static hosting service:

```bash
# Build static site
npm run build:web

# Deploy the `web/out` directory to:
# - Vercel, Netlify, GitHub Pages
# - Or any static hosting service
```

## 📝 AI Tools Used

- **Cursor/Claude 4** - For development assistance and code generation

