const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

const { GitService } = require('../services/git');
const { AnthropicService } = require('../services/anthropic');

async function generateChangelog(options) {
  const spinner = ora('Generating changelog...').start();
  
  try {
    // Initialize services
    const gitService = new GitService();
    
    // Validate environment
    await validateEnvironment(gitService);
    
    // Get commits
    spinner.text = 'Fetching Git commits...';
    const commits = await gitService.getCommitsWithDiffs({
      commits: options.commits,
      since: options.since
    });
    
    if (commits.length === 0) {
      spinner.warn('No commits found matching the criteria');
      console.log(chalk.yellow('Try adjusting your --commits or --since parameters'));
      return;
    }
    
    // Check for duplicate commits
    spinner.text = 'Checking for duplicate commits...';
    const { newCommits, duplicateCommits } = await filterDuplicateCommits(commits);
    
    if (duplicateCommits.length > 0) {
      spinner.warn('Some commits have already been processed');
      console.log(chalk.yellow(`\n⚠️ Found ${duplicateCommits.length} commits already in changelogs:`));
      duplicateCommits.forEach(commit => {
        console.log(`  ${chalk.gray(commit.shortHash)} ${commit.message}`);
      });
      console.log();
    }
    
    if (newCommits.length === 0) {
      spinner.fail('No new commits to process');
      console.log(chalk.red('All specified commits have already been included in previous changelogs.'));
      console.log(chalk.yellow('\nTry:'));
      console.log('- Increasing --commits number');
      console.log('- Using --since with an earlier date');
      console.log('- Run "changelog-ai history" to see processed commits');
      return;
    }
    
    if (newCommits.length < commits.length) {
      console.log(chalk.blue(`Processing ${newCommits.length} new commits (${duplicateCommits.length} already processed):`));
    } else {
      console.log(chalk.blue(`\nFound ${newCommits.length} commits to analyze:`));
    }
    
    newCommits.forEach(commit => {
      console.log(`  ${chalk.gray(commit.shortHash)} ${commit.message}`);
    });
    
    // Get repository info
    const repositoryInfo = await gitService.getRepositoryInfo();
    
    // Generate changelog with AI
    spinner.start('Generating changelog with AI...');
    const anthropicService = new AnthropicService();
    const changelogSections = await anthropicService.summarizeCommits(newCommits, repositoryInfo);
    
    // Create changelog file
    spinner.text = 'Creating changelog file...';
    const filename = await createChangelogFile(changelogSections, newCommits, repositoryInfo, options.output);
    
    // Update metadata
    await updateMetadata(filename, newCommits.length, options, newCommits);
    
    spinner.succeed('Changelog generated successfully!');
    
    // Display results
    console.log(chalk.green(`\n✅ Changelog created: ${filename}`));
    console.log(chalk.blue('\nPreview:'));
    await displayChangelog(changelogSections);
    
    console.log(chalk.yellow('\nNext steps:'));
    console.log('1. Review the generated changelog');
    console.log('2. Edit if needed');
    console.log('3. Build your website with: npm run build:web');
    
  } catch (error) {
    spinner.fail('Failed to generate changelog');
    console.error(chalk.red('Error:'), error.message);
    
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      console.log(chalk.yellow('\nTo fix this:'));
      console.log('1. Get an API key from https://console.anthropic.com/');
      console.log('2. Copy .env.example to .env');
      console.log('3. Add your API key to the .env file');
    }
    
    process.exit(1);
  }
}

async function validateEnvironment(gitService) {
  // Check if in git repository
  const isGitRepo = await gitService.isGitRepository();
  if (!isGitRepo) {
    throw new Error('Not in a Git repository. Please run this command from a Git repository root.');
  }
  
  // Check if initialized
  try {
    await fs.access('changelogs');
  } catch (error) {
    throw new Error('Project not initialized. Run: changelog-ai init');
  }
  
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found in environment variables');
  }
}

async function createChangelogFile(sections, commits, repositoryInfo, outputDir) {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}.md`;
  const filepath = path.join(outputDir, filename);
  
  // Create frontmatter
  const frontmatter = `---
date: ${date}
commits: ${commits.length}
repository: ${repositoryInfo.name}
generated: ${new Date().toISOString()}
---

# Changelog - ${date}

Generated from ${commits.length} commits in ${repositoryInfo.name}

`;

  // Build content
  let content = frontmatter;
  
  if (sections.features && sections.features.length > 0) {
    content += `## ✨ Features\n\n`;
    sections.features.forEach(feature => {
      content += `- ${feature}\n`;
    });
    content += '\n';
  }
  
  if (sections.bugFixes && sections.bugFixes.length > 0) {
    content += `## 🐛 Bug Fixes\n\n`;
    sections.bugFixes.forEach(fix => {
      content += `- ${fix}\n`;
    });
    content += '\n';
  }
  
  if (sections.improvements && sections.improvements.length > 0) {
    content += `## 🚀 Improvements\n\n`;
    sections.improvements.forEach(improvement => {
      content += `- ${improvement}\n`;
    });
    content += '\n';
  }
  
  if (sections.breakingChanges && sections.breakingChanges.length > 0) {
    content += `## ⚠️ Breaking Changes\n\n`;
    sections.breakingChanges.forEach(change => {
      content += `- ${change}\n`;
    });
    content += '\n';
  }
  
  // Add commit details as appendix
  content += `---\n\n## Commit Details\n\n`;
  commits.forEach(commit => {
    content += `- **${commit.shortHash}**: ${commit.message} _(${commit.author_name})_\n`;
  });
  
  await fs.writeFile(filepath, content);
  return filename;
}

async function filterDuplicateCommits(commits) {
  const metadataPath = 'changelogs/metadata.json';
  
  try {
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    
    // Get all processed commit hashes from metadata
    const processedHashes = new Set();
    
    for (const changelog of metadata.changelogs) {
      if (changelog.commitHashes) {
        changelog.commitHashes.forEach(hash => processedHashes.add(hash));
      }
    }
    
    // Separate new and duplicate commits
    const newCommits = [];
    const duplicateCommits = [];
    
    commits.forEach(commit => {
      if (processedHashes.has(commit.hash)) {
        duplicateCommits.push(commit);
      } else {
        newCommits.push(commit);
      }
    });
    
    return { newCommits, duplicateCommits };
    
  } catch (error) {
    // If metadata doesn't exist or is corrupted, treat all commits as new
    return { newCommits: commits, duplicateCommits: [] };
  }
}

async function updateMetadata(filename, commitCount, options, commits) {
  const metadataPath = 'changelogs/metadata.json';
  
  try {
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    
    metadata.changelogs.unshift({
      filename,
      date: new Date().toISOString().split('T')[0],
      commitCount,
      commitHashes: commits.map(c => c.hash), // Store commit hashes for duplicate detection
      options: {
        commits: options.commits,
        since: options.since
      },
      generated: new Date().toISOString()
    });
    
    metadata.lastGenerated = new Date().toISOString();
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not update metadata'));
  }
}

async function displayChangelog(sections) {
  const hasContent = Object.values(sections).some(section => 
    Array.isArray(section) && section.length > 0
  );
  
  if (!hasContent) {
    console.log(chalk.gray('No significant changes detected.'));
    return;
  }
  
  if (sections.features && sections.features.length > 0) {
    console.log(chalk.green('\n✨ Features:'));
    sections.features.forEach(feature => {
      console.log(`  • ${feature}`);
    });
  }
  
  if (sections.bugFixes && sections.bugFixes.length > 0) {
    console.log(chalk.red('\n🐛 Bug Fixes:'));
    sections.bugFixes.forEach(fix => {
      console.log(`  • ${fix}`);
    });
  }
  
  if (sections.improvements && sections.improvements.length > 0) {
    console.log(chalk.blue('\n🚀 Improvements:'));
    sections.improvements.forEach(improvement => {
      console.log(`  • ${improvement}`);
    });
  }
  
  if (sections.breakingChanges && sections.breakingChanges.length > 0) {
    console.log(chalk.magenta('\n⚠️ Breaking Changes:'));
    sections.breakingChanges.forEach(change => {
      console.log(`  • ${change}`);
    });
  }
}

module.exports = { generateChangelog }; 