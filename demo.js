#!/usr/bin/env node

const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.bold.blue('\n🚀 AI-Powered Changelog Generator Demo\n'));

console.log(chalk.yellow('📋 Available Commands:'));
console.log(chalk.gray('  CLI Tool:'));
console.log(chalk.green('    npx changelog-ai init') + chalk.gray('           # Initialize project'));
console.log(chalk.green('    npx changelog-ai generate --commits 5') + chalk.gray(' # Generate changelog'));  
console.log(chalk.green('    npx changelog-ai history') + chalk.gray('           # View all changelogs'));

console.log(chalk.gray('\n  Website:'));
console.log(chalk.green('    npm run dev:web') + chalk.gray('               # Start development server'));
console.log(chalk.green('    npm run build:web') + chalk.gray('             # Build for production'));

console.log(chalk.yellow('\n📁 Generated Files:'));
try {
  const fs = require('fs');
  const files = fs.readdirSync('./changelogs').filter(f => f.endsWith('.md') && f !== 'README.md');
  files.forEach(file => {
    console.log(chalk.green(`    ✓ changelogs/${file}`));
  });
  console.log(chalk.green(`    ✓ changelogs/metadata.json`));
} catch (e) {
  console.log(chalk.red('    No changelogs found - run `npx changelog-ai generate` first'));
}

console.log(chalk.yellow('\n🌐 Website Status:'));
try {
  // Check if Next.js is running
  execSync('curl -s http://localhost:3000 > /dev/null', { stdio: 'ignore' });
  console.log(chalk.green('    ✓ Website running at http://localhost:3000'));
} catch (e) {
  console.log(chalk.gray('    ○ Website not running - use `npm run dev:web` to start'));
}

console.log(chalk.yellow('\n🎨 Features Implemented:'));
console.log(chalk.green('    ✓ AI-powered commit analysis'));
console.log(chalk.green('    ✓ Semantic version detection (MAJOR/MINOR/PATCH)'));
console.log(chalk.green('    ✓ Duplicate prevention'));
console.log(chalk.green('    ✓ Beautiful dark-themed website'));
console.log(chalk.green('    ✓ Clickable changelog cards'));
console.log(chalk.green('    ✓ Version badges with confidence scores'));
console.log(chalk.green('    ✓ Relative timestamps'));
console.log(chalk.green('    ✓ Responsive design'));

console.log(chalk.bold.blue('\n✨ Ready to generate beautiful changelogs!\n')); 