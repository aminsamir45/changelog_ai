const Anthropic = require('@anthropic-ai/sdk');
const chalk = require('chalk');

class AnthropicService {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Load config
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const config = require('../../changelog-ai.config.json');
      return config.anthropic || {
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000
      };
    } catch (error) {
      return {
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000
      };
    }
  }

  async summarizeCommits(commits, repositoryInfo = {}) {
    if (!commits || commits.length === 0) {
      throw new Error('No commits provided for summarization');
    }

    const prompt = this.buildPrompt(commits, repositoryInfo);
    
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return this.parseResponse(response.content[0].text);
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid Anthropic API key. Please check your .env file.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
    }
  }

  buildPrompt(commits, repositoryInfo) {
    const repoName = repositoryInfo.name || 'this repository';
    
    const commitDetails = commits.map(commit => {
      return `
**Commit ${commit.shortHash}**
Message: ${commit.message}
Author: ${commit.author_name}
Date: ${new Date(commit.date).toLocaleDateString()}
${commit.diff ? `Changes:\n${commit.diff}` : ''}
---`;
    }).join('\n');

    return `You are helping create a changelog for ${repoName}. 

Your task is to analyze the following Git commits and create user-friendly changelog entries. The audience is end-users and developers who use this software, not the internal development team.

Guidelines:
1. Write clear, concise bullet points that explain WHAT changed and WHY it matters to users
2. Group similar changes together when possible
3. Use action-oriented language (e.g., "Added", "Fixed", "Improved")
4. Focus on user-facing changes, not internal refactoring
5. Ignore merge commits, version bumps, and minor fixes unless they're significant
6. Categorize changes as: Features, Bug Fixes, Improvements, or Breaking Changes

Here are the commits to analyze:
${commitDetails}

Please provide the changelog entries in this exact format:

## Features
- [Feature description if any]

## Bug Fixes  
- [Bug fix description if any]

## Improvements
- [Improvement description if any]

## Breaking Changes
- [Breaking change description if any]

Only include sections that have actual changes. If a section has no changes, omit it entirely.`;
  }

  parseResponse(response) {
    try {
      // Clean up the response and extract sections
      const sections = {
        features: [],
        bugFixes: [],
        improvements: [],
        breakingChanges: []
      };

      const lines = response.split('\n');
      let currentSection = null;

      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('## Features')) {
          currentSection = 'features';
        } else if (trimmed.startsWith('## Bug Fixes')) {
          currentSection = 'bugFixes';
        } else if (trimmed.startsWith('## Improvements')) {
          currentSection = 'improvements';
        } else if (trimmed.startsWith('## Breaking Changes')) {
          currentSection = 'breakingChanges';
        } else if (trimmed.startsWith('- ') && currentSection) {
          sections[currentSection].push(trimmed.substring(2));
        }
      }

      return sections;
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not parse AI response, using raw text'));
      return {
        features: [response.trim()]
      };
    }
  }

  async testConnection() {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Hello'
        }]
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { AnthropicService }; 