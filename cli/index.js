#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { generateChangelog } = require('./commands/generate');
const { initProject } = require('./commands/init');
const { viewHistory } = require('./commands/history');

const program = new Command();

program
  .name('changelog-ai')
  .description('AI-powered changelog generator from Git commits')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize changelog-ai in current repository')
  .action(initProject);

program
  .command('generate')
  .description('Generate changelog from Git commits')
  .option('-c, --commits <number>', 'Number of recent commits to analyze', '10')
  .option('-s, --since <date>', 'Generate changelog since this date (YYYY-MM-DD)')
  .option('-o, --output <file>', 'Output file path', 'changelogs')
  .action(generateChangelog);

program
  .command('history')
  .description('View changelog generation history')
  .option('-l, --limit <number>', 'Number of changelogs to show', '10')
  .option('--json', 'Output as JSON')
  .action(viewHistory);

// Error handling
program.configureOutput({
  writeErr: (str) => process.stderr.write(chalk.red(str))
});

program.parse(); 