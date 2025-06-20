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
        maxTokens: 2000
      };
    } catch (error) {
      return {
        model: 'claude-3-sonnet-20240229',
        maxTokens: 2000
      };
    }
  }

  async summarizeCommits(commits, repositoryInfo = {}) {
    if (!commits || commits.length === 0) {
      throw new Error('No commits provided for summarization');
    }

    const prompt = this.buildStripeStylePrompt(commits, repositoryInfo);
    
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return this.parseStripeStyleResponse(response.content[0].text);
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

  buildStripeStylePrompt(commits, repositoryInfo) {
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

    return `You are creating a professional changelog entry in the style of Stripe's changelog. The audience includes both developers and business users.

Your task is to analyze the following Git commits and create a comprehensive changelog entry with these sections:

1. **TITLE**: A concise, descriptive title (like "Adds balance types to the Balance Transactions API")
2. **WHAT'S NEW**: A brief 1-2 sentence summary of what was added/changed and its primary benefit
3. **IMPACT**: 2-3 sentences explaining how this affects users, what they can now do, and why it matters
4. **CHANGES**: Technical details organized by category (Features, Bug Fixes, Improvements, Breaking Changes)
5. **UPGRADE**: Step-by-step instructions if users need to take action (only if needed)
6. **RELATED**: Mention any related changes or dependencies (only if applicable)

Guidelines:
- Write for both technical and non-technical audiences
- Focus on user benefits, not implementation details
- Use professional, clear language
- Be specific about what changed and why it matters
- Include technical details in the Changes section
- Only include Upgrade section if users need to take action
- Only include Related section if there are genuine connections

Here are the commits to analyze:
${commitDetails}

Please provide the response in this exact format:

TITLE: [Concise descriptive title]

WHAT'S NEW: [1-2 sentence summary of what's new and its primary benefit]

IMPACT: [2-3 sentences explaining how this affects users and why it matters]

CHANGES:
## Features
- [Feature description if any]

## Bug Fixes  
- [Bug fix description if any]

## Improvements
- [Improvement description if any]

## Breaking Changes
- [Breaking change description if any]

UPGRADE: [Step-by-step instructions if needed, otherwise omit this section]

RELATED: [Related changes if any, otherwise omit this section]

Only include sections that have actual content. Omit empty sections entirely.`;
  }

  parseStripeStyleResponse(response) {
    try {
      const result = {
        title: '',
        whatsNew: '',
        impact: '',
        changes: {
          features: [],
          bugFixes: [],
          improvements: [],
          breakingChanges: []
        },
        upgrade: '',
        related: ''
      };

      const lines = response.split('\n');
      let currentSection = null;
      let currentChangeType = null;
      let content = [];

      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('TITLE:')) {
          result.title = trimmed.substring(6).trim();
        } else if (trimmed.startsWith('WHAT\'S NEW:')) {
          result.whatsNew = trimmed.substring(11).trim();
        } else if (trimmed.startsWith('IMPACT:')) {
          currentSection = 'impact';
          result.impact = trimmed.substring(7).trim();
        } else if (trimmed.startsWith('CHANGES:')) {
          currentSection = 'changes';
          currentChangeType = null;
        } else if (trimmed.startsWith('UPGRADE:')) {
          currentSection = 'upgrade';
          result.upgrade = trimmed.substring(8).trim();
        } else if (trimmed.startsWith('RELATED:')) {
          currentSection = 'related';
          result.related = trimmed.substring(8).trim();
        } else if (currentSection === 'changes') {
          if (trimmed.startsWith('## Features')) {
            currentChangeType = 'features';
          } else if (trimmed.startsWith('## Bug Fixes')) {
            currentChangeType = 'bugFixes';
          } else if (trimmed.startsWith('## Improvements')) {
            currentChangeType = 'improvements';
          } else if (trimmed.startsWith('## Breaking Changes')) {
            currentChangeType = 'breakingChanges';
          } else if (trimmed.startsWith('- ') && currentChangeType) {
            result.changes[currentChangeType].push(trimmed.substring(2));
          }
        } else if (currentSection === 'impact' && trimmed && !trimmed.startsWith('CHANGES:')) {
          result.impact += ' ' + trimmed;
        } else if (currentSection === 'upgrade' && trimmed && !trimmed.startsWith('RELATED:')) {
          result.upgrade += ' ' + trimmed;
        } else if (currentSection === 'related' && trimmed) {
          result.related += ' ' + trimmed;
        }
      }

      // Clean up multi-line content
      result.impact = result.impact.trim();
      result.upgrade = result.upgrade.trim();
      result.related = result.related.trim();

      return result;
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not parse AI response, using fallback format'));
      return {
        title: 'Recent Updates',
        whatsNew: 'Multiple improvements and fixes have been made to enhance the user experience.',
        impact: 'These changes improve the overall functionality and reliability of the system.',
        changes: {
          features: [response.trim()]
        },
        upgrade: '',
        related: ''
      };
    }
  }

  // Keep the old method for backward compatibility
  async summarizeCommitsLegacy(commits, repositoryInfo = {}) {
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