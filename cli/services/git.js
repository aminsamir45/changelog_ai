const simpleGit = require('simple-git');
const chalk = require('chalk');

class GitService {
  constructor() {
    this.git = simpleGit();
  }

  async isGitRepository() {
    try {
      await this.git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCommits(options = {}) {
    const { commits = 10, since } = options;
    
    try {
      let logOptions = {
        maxCount: parseInt(commits),
        format: {
          hash: '%H',
          date: '%ai',
          message: '%s',
          author_name: '%an',
          author_email: '%ae'
        }
      };

      if (since) {
        logOptions.since = since;
        delete logOptions.maxCount;
      }

      const log = await this.git.log(logOptions);
      return log.all;
    } catch (error) {
      throw new Error(`Failed to get commits: ${error.message}`);
    }
  }

  async getCommitDiff(hash) {
    try {
      const diff = await this.git.show([hash, '--stat', '--format=']);
      return diff;
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not get diff for commit ${hash}`));
      return '';
    }
  }

  async getCommitsWithDiffs(options = {}) {
    const commits = await this.getCommits(options);
    
    const commitsWithDiffs = await Promise.all(
      commits.map(async (commit) => {
        const diff = await this.getCommitDiff(commit.hash);
        return {
          ...commit,
          diff: diff.trim(),
          shortHash: commit.hash.substring(0, 7)
        };
      })
    );

    return this.filterCommits(commitsWithDiffs);
  }

  filterCommits(commits) {
    // Load config to get exclude patterns
    let excludePatterns = ['merge', 'wip', 'fixup', 'squash'];
    
    try {
      const config = require('../../changelog-ai.config.json');
      excludePatterns = config.changelog?.excludePatterns || excludePatterns;
    } catch (error) {
      // Use default patterns if config doesn't exist
    }

    return commits.filter(commit => {
      const message = commit.message.toLowerCase();
      return !excludePatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
    });
  }

  async getCurrentBranch() {
    try {
      const branch = await this.git.branch();
      return branch.current;
    } catch (error) {
      return 'main';
    }
  }

  async getRepositoryInfo() {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find(remote => remote.name === 'origin');
      
      if (origin && origin.refs.fetch) {
        // Extract repo name from URL
        const match = origin.refs.fetch.match(/[\/:]([^\/]+\/[^\/]+)\.git$/);
        if (match) {
          return {
            name: match[1],
            url: origin.refs.fetch
          };
        }
      }
      
      return {
        name: 'Unknown Repository',
        url: null
      };
    } catch (error) {
      return {
        name: 'Unknown Repository',
        url: null
      };
    }
  }
}

module.exports = { GitService }; 