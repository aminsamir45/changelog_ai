# AI-Powered Changelog Generator

A simple tool that generates user-friendly changelogs from Git commits using AI, with a clean web interface to display them.

## Overview

This project solves the common developer pain point of writing changelogs by:
1. **Analyzing Git commits** - Automatically gathering recent changes from your repository
2. **AI Summarization** - Using Anthropic's Claude to convert technical commits into user-friendly bullet points
3. **Simple Publishing** - Displaying changelogs on a clean, minimal website

## Architecture

### Core Components
1. **CLI Tool** (`changelog-ai`) - Node.js command-line interface
2. **AI Service** - Anthropic API integration for commit summarization
3. **Web Interface** - Next.js static site for displaying changelogs
4. **File Storage** - Simple markdown files in `changelogs/` directory

### Workflow
```bash
# Generate changelog from last 10 commits
changelog-ai generate --commits 10

# Or generate from a specific date
changelog-ai generate --since "2024-01-01"
```

This creates a markdown file and updates the website automatically.

## Implementation Plan

### Phase 1: MVP
- [x] Project setup and planning
- [ ] CLI tool with Git integration
- [ ] Anthropic API integration
- [ ] Basic changelog generation
- [ ] Simple Next.js website
- [ ] End-to-end testing

### Phase 2: Polish
- [ ] Better prompt engineering
- [ ] Changelog categorization (Features, Fixes, etc.)
- [ ] Search and filtering on website
- [ ] Improved design and UX

## Tech Stack

- **CLI**: Node.js with Commander.js
- **AI**: Anthropic Claude API
- **Website**: Next.js + Tailwind CSS
- **Storage**: Markdown files + JSON metadata
- **Deployment**: Vercel/Netlify static hosting

## File Structure
```
changelog-ai/
├── cli/                 # CLI tool source
├── web/                 # Next.js website
├── changelogs/          # Generated changelog files
│   ├── 2024-01-15.md
│   └── metadata.json
└── package.json
```

## Design Principles

1. **Simplicity First** - One command should generate a complete changelog
2. **Developer-Friendly** - Minimal setup, works with any Git repository
3. **User-Focused** - AI summaries target end-users, not developers
4. **Beautiful & Minimal** - Clean design inspired by Stripe and Twilio changelogs

## Getting Started

*Coming soon - implementation in progress*

## AI Tools Used

- **Claude (Anthropic)** - For commit summarization and changelog generation
- **GitHub Copilot** - For code assistance during development