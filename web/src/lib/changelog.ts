import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ChangelogEntry {
  filename: string;
  slug: string;
  date: string;
  commits: number;
  repository: string;
  versionType: 'major' | 'minor' | 'patch' | 'unknown';
  versionConfidence: number;
  generated: string;
  content: string;
  // New Stripe-style fields
  title?: string;
  whatsNew?: string;
  impact?: string;
  upgrade?: string;
  related?: string;
  // Legacy and current format
  sections: {
    features?: string[];
    bugFixes?: string[];
    improvements?: string[];
    breakingChanges?: string[];
  };
}

export interface ChangelogMetadata {
  changelogs: Array<{
    filename: string;
    date: string;
    commitCount: number;
    versionType?: string;
    versionConfidence?: number;
    options: {
      commits?: string;
      since?: string;
    };
    generated: string;
  }>;
  lastGenerated: string;
}

const CHANGELOGS_DIR = path.join(process.cwd(), '..', 'changelogs');

export async function getAllChangelogs(): Promise<ChangelogEntry[]> {
  try {
    // Check if changelogs directory exists
    if (!fs.existsSync(CHANGELOGS_DIR)) {
      return [];
    }

    const files = fs.readdirSync(CHANGELOGS_DIR);
    const markdownFiles = files.filter(file => 
      file.endsWith('.md') && file !== 'README.md'
    );

    const changelogs = markdownFiles.map(filename => {
      const filePath = path.join(CHANGELOGS_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Parse content sections
      const sections = parseChangelogContent(content);
      
      // Create slug from filename
      const slug = filename.replace('.md', '');

      return {
        filename,
        slug,
        date: data.date || '',
        commits: data.commits || 0,
        repository: data.repository || '',
        versionType: (data.versionType as ChangelogEntry['versionType']) || 'unknown',
        versionConfidence: data.versionConfidence || 0,
        generated: data.generated || '',
        content,
        // New Stripe-style fields
        title: data.title || '',
        whatsNew: data.whatsNew || '',
        impact: data.impact || '',
        upgrade: data.upgrade || '',
        related: data.related || '',
        sections,
      };
    });

    // Sort by date (newest first)
    return changelogs.sort((a, b) => 
      new Date(b.generated).getTime() - new Date(a.generated).getTime()
    );
  } catch (error) {
    console.error('Error reading changelogs:', error);
    return [];
  }
}

export async function getChangelogBySlug(slug: string): Promise<ChangelogEntry | null> {
  try {
    const filename = `${slug}.md`;
    const filePath = path.join(CHANGELOGS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const sections = parseChangelogContent(content);

    return {
      filename,
      slug,
      date: data.date || '',
      commits: data.commits || 0,
      repository: data.repository || '',
      versionType: (data.versionType as ChangelogEntry['versionType']) || 'unknown',
      versionConfidence: data.versionConfidence || 0,
      generated: data.generated || '',
      content,
      // New Stripe-style fields
      title: data.title || '',
      whatsNew: data.whatsNew || '',
      impact: data.impact || '',
      upgrade: data.upgrade || '',
      related: data.related || '',
      sections,
    };
  } catch (error) {
    console.error('Error reading changelog:', error);
    return null;
  }
}

function parseChangelogContent(content: string) {
  const sections: ChangelogEntry['sections'] = {};
  
  // Parse markdown sections - handle both legacy and new Stripe-style formats
  const lines = content.split('\n');
  let currentSection: string | null = null;
  let currentItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Legacy format patterns (## with emojis)
    if (trimmed.startsWith('## ✨ Features')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'features';
      currentItems = [];
    } else if (trimmed.startsWith('## 🐛 Bug Fixes')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'bugFixes';
      currentItems = [];
    } else if (trimmed.startsWith('## 🚀 Improvements')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'improvements';
      currentItems = [];
    } else if (trimmed.startsWith('## ⚠️ Breaking Changes')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'breakingChanges';
      currentItems = [];
    // New Stripe-style format patterns (### under ## Changes)
    } else if (trimmed.startsWith('### ✨ Features')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'features';
      currentItems = [];
    } else if (trimmed.startsWith('### 🐛 Bug Fixes')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'bugFixes';
      currentItems = [];
    } else if (trimmed.startsWith('### 🚀 Improvements')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'improvements';
      currentItems = [];
    } else if (trimmed.startsWith('### ⚠️ Breaking Changes')) {
      if (currentSection && currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      currentSection = 'breakingChanges';
      currentItems = [];
    } else if (trimmed.startsWith('- ') && currentSection) {
      currentItems.push(trimmed.substring(2));
    } else if (trimmed.startsWith('---') && currentSection) {
      // End of changelog sections
      if (currentItems.length > 0) {
        sections[currentSection as keyof typeof sections] = [...currentItems];
      }
      break;
    }
  }

  // Don't forget the last section
  if (currentSection && currentItems.length > 0) {
    sections[currentSection as keyof typeof sections] = [...currentItems];
  }

  return sections;
}

export function getVersionEmoji(versionType: string): string {
  switch (versionType) {
    case 'major': return '🚨';
    case 'minor': return '✨';
    case 'patch': return '🔧';
    default: return '📦';
  }
}

export function getVersionBadgeClass(versionType: string): string {
  switch (versionType) {
    case 'major': return 'version-badge version-major';
    case 'minor': return 'version-badge version-minor';
    case 'patch': return 'version-badge version-patch';
    default: return 'version-badge version-unknown';
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  } catch {
    return dateString;
  }
} 