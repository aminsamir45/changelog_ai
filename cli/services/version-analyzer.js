class VersionAnalyzer {
  constructor() {
    // Keywords that indicate different version bump types
    this.patterns = {
      major: [
        // Breaking changes
        'breaking change', 'breaking', 'breaking:', 'BREAKING CHANGE',
        'major change', 'incompatible', 'remove', 'delete',
        'drop support', 'deprecated', 'deprecate',
        // Version indicators
        'v2.', 'v3.', 'v4.', 'v5.', 'major:'
      ],
      minor: [
        // New features
        'feat:', 'feature:', 'add', 'new', 'implement',
        'introduce', 'support', 'enable', 'allow',
        'create', 'build', 'enhance', 'extend',
        // Version indicators  
        'minor:', 'feature'
      ],
      patch: [
        // Bug fixes and small changes
        'fix:', 'bug:', 'hotfix:', 'patch:', 'repair',
        'resolve', 'correct', 'adjust', 'tweak',
        'update', 'improve', 'optimize', 'refactor',
        'docs:', 'doc:', 'documentation', 'typo',
        'style:', 'format', 'lint', 'cleanup'
      ]
    };
  }

  analyzeCommits(commits) {
    const analysis = {
      versionType: 'patch', // Default to patch
      confidence: 0,
      reasoning: [],
      breakdown: {
        major: 0,
        minor: 0, 
        patch: 0
      }
    };

    // Analyze each commit
    commits.forEach(commit => {
      const commitAnalysis = this.analyzeCommit(commit);
      analysis.breakdown[commitAnalysis.type]++;
      
      if (commitAnalysis.confidence > 0) {
        analysis.reasoning.push({
          commit: commit.shortHash,
          message: commit.message,
          type: commitAnalysis.type,
          reason: commitAnalysis.reason
        });
      }
    });

    // Determine overall version type (highest priority wins)
    if (analysis.breakdown.major > 0) {
      analysis.versionType = 'major';
      analysis.confidence = Math.min(0.9, 0.5 + (analysis.breakdown.major * 0.2));
    } else if (analysis.breakdown.minor > 0) {
      analysis.versionType = 'minor';
      analysis.confidence = Math.min(0.8, 0.4 + (analysis.breakdown.minor * 0.15));
    } else {
      analysis.versionType = 'patch';
      analysis.confidence = Math.min(0.7, 0.3 + (analysis.breakdown.patch * 0.1));
    }

    return analysis;
  }

  analyzeCommit(commit) {
    const message = commit.message.toLowerCase();
    const result = {
      type: 'patch',
      confidence: 0,
      reason: ''
    };

    // Check for major changes (highest priority)
    for (const pattern of this.patterns.major) {
      if (message.includes(pattern.toLowerCase())) {
        result.type = 'major';
        result.confidence = 0.9;
        result.reason = `Contains breaking change indicator: "${pattern}"`;
        return result;
      }
    }

    // Check for minor changes (new features)
    for (const pattern of this.patterns.minor) {
      if (message.includes(pattern.toLowerCase())) {
        result.type = 'minor';
        result.confidence = 0.7;
        result.reason = `Contains feature indicator: "${pattern}"`;
        return result;
      }
    }

    // Check for patch changes (fixes, improvements)
    for (const pattern of this.patterns.patch) {
      if (message.includes(pattern.toLowerCase())) {
        result.type = 'patch';
        result.confidence = 0.5;
        result.reason = `Contains patch indicator: "${pattern}"`;
        return result;
      }
    }

    // Default to patch with low confidence
    result.reason = 'No clear version indicators found, defaulting to patch';
    result.confidence = 0.2;
    return result;
  }

  analyzeChangelogSections(sections) {
    const analysis = {
      versionType: 'patch',
      confidence: 0,
      reasoning: []
    };

    // Breaking changes always indicate major version
    if (sections.breakingChanges && sections.breakingChanges.length > 0) {
      analysis.versionType = 'major';
      analysis.confidence = 0.95;
      analysis.reasoning.push(`${sections.breakingChanges.length} breaking changes detected`);
      return analysis;
    }

    // New features indicate minor version
    if (sections.features && sections.features.length > 0) {
      analysis.versionType = 'minor';
      analysis.confidence = 0.8;
      analysis.reasoning.push(`${sections.features.length} new features detected`);
    }

    // Only improvements/fixes indicate patch
    if (sections.improvements || sections.bugFixes) {
      const improvements = sections.improvements?.length || 0;
      const bugFixes = sections.bugFixes?.length || 0;
      
      if (analysis.versionType === 'patch') {
        analysis.confidence = 0.6;
        analysis.reasoning.push(`${improvements + bugFixes} improvements/fixes detected`);
      }
    }

    return analysis;
  }

  suggestNextVersion(currentVersion, versionType) {
    if (!currentVersion) {
      return versionType === 'major' ? '1.0.0' : 
             versionType === 'minor' ? '0.1.0' : '0.0.1';
    }

    const parts = currentVersion.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
    const [major, minor, patch] = parts;

    switch (versionType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  getVersionTypeEmoji(versionType) {
    switch (versionType) {
      case 'major': return '🚨';
      case 'minor': return '✨';
      case 'patch': return '🔧';
      default: return '📦';
    }
  }

  getVersionTypeColor(versionType) {
    switch (versionType) {
      case 'major': return 'red';
      case 'minor': return 'blue';
      case 'patch': return 'green';
      default: return 'gray';
    }
  }
}

module.exports = { VersionAnalyzer }; 