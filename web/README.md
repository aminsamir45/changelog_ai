# Changelog Website

A beautiful, dark-themed Next.js website that displays AI-generated changelogs.

## Features

- **Dark Theme**: Clean black background with gray accents, inspired by Stripe's design
- **Responsive Cards**: Clickable changelog cards with hover effects
- **Version Badges**: Visual indicators for MAJOR 🚨, MINOR ✨, PATCH 🔧, and UNKNOWN 📦 changes
- **Confidence Scores**: Shows AI confidence percentage for version detection
- **Relative Timestamps**: Human-friendly time display ("9 minutes ago")
- **Detailed Views**: Click any card to see full changelog details
- **Semantic Organization**: Changes grouped by Features, Bug Fixes, Improvements, and Breaking Changes

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## File Structure

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main changelog listing
│   │   ├── changelog/[slug]/     # Individual changelog pages
│   │   ├── layout.tsx            # Root layout with dark theme
│   │   ├── globals.css           # Global styles and components
│   │   └── not-found.tsx         # 404 page
│   └── lib/
│       └── changelog.ts          # Utility functions for reading changelog data
├── package.json
└── README.md
```

## Design Principles

1. **Simplicity First**: Clean, minimal design focused on readability
2. **Dark Theme**: Easy on the eyes for developers
3. **Stripe-Inspired**: Professional, modern aesthetic
4. **Performance**: Static generation for fast loading
5. **Accessibility**: Semantic HTML and proper contrast ratios

## Data Source

The website reads changelog data from `../changelogs/` directory:
- Markdown files with frontmatter metadata
- JSON metadata file for indexing
- Automatic parsing of changelog sections
