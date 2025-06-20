const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

async function initProject() {
  const spinner = ora('Initializing changelog-ai...').start();
  
  try {
    // Create changelogs directory
    await fs.mkdir('changelogs', { recursive: true });
    
    // Create .env.example file
    const envExample = `# Anthropic API Key - Get one at https://console.anthropic.com/
ANTHROPIC_API_KEY=your_api_key_here
`;
    await fs.writeFile('.env.example', envExample);
    
    // Create config file
    const config = {
      anthropic: {
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000
      },
      changelog: {
        categories: ['Features', 'Bug Fixes', 'Improvements', 'Breaking Changes'],
        excludePatterns: [
          'merge',
          'wip',
          'fixup',
          'squash'
        ]
      }
    };
    
    await fs.writeFile('changelog-ai.config.json', JSON.stringify(config, null, 2));
    
    // Create initial metadata file
    const metadata = {
      changelogs: [],
      lastGenerated: null
    };
    
    await fs.writeFile('changelogs/metadata.json', JSON.stringify(metadata, null, 2));
    
    // Create README for changelogs directory
    const changelogReadme = `# Changelogs

This directory contains AI-generated changelog files.

## Files
- \`metadata.json\` - Tracks all generated changelogs
- \`YYYY-MM-DD.md\` - Individual changelog files

## Usage
Run \`changelog-ai generate\` to create new changelog entries.
`;
    
    await fs.writeFile('changelogs/README.md', changelogReadme);
    
    spinner.succeed('Project initialized successfully!');
    
    console.log(chalk.green('\n✅ Setup complete!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('1. Copy .env.example to .env and add your Anthropic API key');
    console.log('2. Run: changelog-ai generate --commits 5');
    console.log('\nGet your API key at: https://console.anthropic.com/');
    
  } catch (error) {
    spinner.fail('Failed to initialize project');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

module.exports = { initProject }; 