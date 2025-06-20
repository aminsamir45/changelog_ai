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
    // Handle YYYY-MM-DD format by parsing directly to avoid timezone issues
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const shortYear = year.toString().slice(-2);
      return `${month}-${day}-${shortYear}`;
    } else {
      // For other formats, use Date parsing
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear().toString().slice(-2);
      return `${month}-${day}-${year}`;
    }
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