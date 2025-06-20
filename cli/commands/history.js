const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function viewHistory(options) {
  try {
    // Check if metadata exists
    const metadataPath = 'changelogs/metadata.json';
    
    try {
      await fs.access(metadataPath);
    } catch (error) {
      console.log(chalk.yellow('No changelog history found.'));
      console.log(chalk.gray('Run "changelog-ai init" to initialize the project.'));
      return;
    }

    // Read metadata
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    
    if (!metadata.changelogs || metadata.changelogs.length === 0) {
      console.log(chalk.yellow('No changelogs generated yet.'));
      console.log(chalk.gray('Run "changelog-ai generate" to create your first changelog.'));
      return;
    }

    // Handle JSON output
    if (options.json) {
      console.log(JSON.stringify(metadata, null, 2));
      return;
    }

    // Display formatted history
    const limit = parseInt(options.limit) || 10;
    const changelogs = metadata.changelogs.slice(0, limit);
    
    console.log(chalk.blue.bold('\n📚 Changelog History\n'));
    console.log(chalk.gray(`Showing ${changelogs.length} of ${metadata.changelogs.length} changelogs\n`));

    for (const changelog of changelogs) {
      const date = new Date(changelog.generated);
      const relativeTime = getRelativeTime(date);
      
      console.log(`${chalk.green('●')} ${chalk.bold(changelog.filename)}`);
      console.log(`  ${chalk.gray('Date:')} ${changelog.date}`);
      console.log(`  ${chalk.gray('Commits:')} ${changelog.commitCount}`);
      console.log(`  ${chalk.gray('Generated:')} ${relativeTime}`);
      
      if (changelog.options) {
        const opts = [];
        if (changelog.options.commits) opts.push(`--commits ${changelog.options.commits}`);
        if (changelog.options.since) opts.push(`--since ${changelog.options.since}`);
        if (opts.length > 0) {
          console.log(`  ${chalk.gray('Options:')} ${opts.join(', ')}`);
        }
      }
      
      console.log(); // Empty line
    }

    // Show summary stats
    const totalCommits = metadata.changelogs.reduce((sum, cl) => sum + cl.commitCount, 0);
    const lastGenerated = metadata.lastGenerated ? 
      getRelativeTime(new Date(metadata.lastGenerated)) : 'Never';
    
    console.log(chalk.blue('📊 Summary:'));
    console.log(`  Total changelogs: ${metadata.changelogs.length}`);
    console.log(`  Total commits processed: ${totalCommits}`);
    console.log(`  Last generated: ${lastGenerated}`);
    
    // Show available commands
    console.log(chalk.yellow('\n💡 Commands:'));
    console.log(`  View changelog: ${chalk.cyan('cat changelogs/' + changelogs[0]?.filename)}`);
    console.log(`  Generate new: ${chalk.cyan('changelog-ai generate --commits 5')}`);
    console.log(`  Full history: ${chalk.cyan('changelog-ai history --limit 50')}`);

  } catch (error) {
    console.error(chalk.red('Error reading changelog history:'), error.message);
    process.exit(1);
  }
}

function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

module.exports = { viewHistory }; 