'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getVersionEmoji, getVersionBadgeClass, formatDate, getRelativeTime, type ChangelogEntry } from '@/lib/changelog-client';

export default function Home() {
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [filteredChangelogs, setFilteredChangelogs] = useState<ChangelogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChangelogs = async () => {
      try {
        const response = await fetch('/api/changelogs');
        if (!response.ok) {
          throw new Error('Failed to fetch changelogs');
        }
        const data = await response.json();
        setChangelogs(data);
        setFilteredChangelogs(data);
      } catch (error) {
        console.error('Error loading changelogs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChangelogs();
  }, []);

  useEffect(() => {
    let filtered = changelogs;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(changelog => {
        const query = searchQuery.toLowerCase();
        
        // Search in title
        if (changelog.title && changelog.title.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in date
        if (formatDate(changelog.date).toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in what's new
        if (changelog.whatsNew && changelog.whatsNew.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in features
        if (changelog.sections.features && changelog.sections.features.some(feature => 
          feature.toLowerCase().includes(query)
        )) {
          return true;
        }
        
        // Search in bug fixes
        if (changelog.sections.bugFixes && changelog.sections.bugFixes.some(fix => 
          fix.toLowerCase().includes(query)
        )) {
          return true;
        }
        
        // Search in improvements
        if (changelog.sections.improvements && changelog.sections.improvements.some(improvement => 
          improvement.toLowerCase().includes(query)
        )) {
          return true;
        }
        
        // Search in breaking changes
        if (changelog.sections.breakingChanges && changelog.sections.breakingChanges.some(change => 
          change.toLowerCase().includes(query)
        )) {
          return true;
        }
        
        // Search in repository name
        if (changelog.repository && changelog.repository.toLowerCase().includes(query)) {
          return true;
        }
        
        return false;
      });
    }

    // Apply category filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(changelog => {
        return selectedFilters.some(filter => {
          switch (filter) {
            case 'major':
              return changelog.versionType === 'major';
            case 'minor':
              return changelog.versionType === 'minor';
            case 'patch':
              return changelog.versionType === 'patch';
            case 'features':
              return changelog.sections.features && changelog.sections.features.length > 0;
            case 'bugfixes':
              return changelog.sections.bugFixes && changelog.sections.bugFixes.length > 0;
            case 'improvements':
              return changelog.sections.improvements && changelog.sections.improvements.length > 0;
            case 'breaking':
              return changelog.sections.breakingChanges && changelog.sections.breakingChanges.length > 0;
            default:
              return false;
          }
        });
      });
    }

    setFilteredChangelogs(filtered);
  }, [searchQuery, selectedFilters, changelogs]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchQuery('');
  };

  const getFilterCount = (filter: string) => {
    return changelogs.filter(changelog => {
      switch (filter) {
        case 'major':
          return changelog.versionType === 'major';
        case 'minor':
          return changelog.versionType === 'minor';
        case 'patch':
          return changelog.versionType === 'patch';
        case 'features':
          return changelog.sections.features && changelog.sections.features.length > 0;
        case 'bugfixes':
          return changelog.sections.bugFixes && changelog.sections.bugFixes.length > 0;
        case 'improvements':
          return changelog.sections.improvements && changelog.sections.improvements.length > 0;
        case 'breaking':
          return changelog.sections.breakingChanges && changelog.sections.breakingChanges.length > 0;
        default:
          return false;
      }
    }).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading changelogs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">Changelog</h1>
              <p className="text-gray-400 text-base">
                New features, improvements, and fixes to our product.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="status-dot green"></div>
              <span>{filteredChangelogs.length} of {changelogs.length} updates</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search changelogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-900 bg-opacity-50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {/* Version Type Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400 font-medium">Version:</span>
                {[
                  { key: 'major', label: '🚨 Major', emoji: '🚨' },
                  { key: 'minor', label: '✨ Minor', emoji: '✨' },
                  { key: 'patch', label: '🔧 Patch', emoji: '🔧' }
                ].map(filter => {
                  const count = getFilterCount(filter.key);
                  const isSelected = selectedFilters.includes(filter.key);
                  return (
                    <button
                      key={filter.key}
                      onClick={() => toggleFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-500 bg-opacity-20 text-blue-300 border-blue-500 border-opacity-50'
                          : 'bg-gray-800 bg-opacity-50 text-gray-400 border-gray-600 border-opacity-50 hover:border-gray-500'
                      }`}
                      disabled={count === 0}
                    >
                      {filter.emoji} {filter.key.toUpperCase()} ({count})
                    </button>
                  );
                })}
              </div>
              
              {/* Content Type Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400 font-medium">Content:</span>
                {[
                  { key: 'features', label: '✨ Features', emoji: '✨' },
                  { key: 'bugfixes', label: '🐛 Bug Fixes', emoji: '🐛' },
                  { key: 'improvements', label: '⚡ Improvements', emoji: '⚡' },
                  { key: 'breaking', label: '⚠️ Breaking', emoji: '⚠️' }
                ].map(filter => {
                  const count = getFilterCount(filter.key);
                  const isSelected = selectedFilters.includes(filter.key);
                  return (
                    <button
                      key={filter.key}
                      onClick={() => toggleFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-500 bg-opacity-20 text-blue-300 border-blue-500 border-opacity-50'
                          : 'bg-gray-800 bg-opacity-50 text-gray-400 border-gray-600 border-opacity-50 hover:border-gray-500'
                      }`}
                      disabled={count === 0}
                    >
                      {filter.emoji} {filter.key === 'bugfixes' ? 'BUG FIXES' : filter.key.toUpperCase()} ({count})
                    </button>
                  );
                })}
              </div>
              
              {/* Clear All Button */}
              {(selectedFilters.length > 0 || searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-red-500 bg-opacity-10 text-red-300 border-red-500 border-opacity-30 hover:bg-opacity-20 transition-all duration-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {(searchQuery || selectedFilters.length > 0) && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm">
              {filteredChangelogs.length === 0 
                ? 'No changelogs found matching your criteria'
                : `Found ${filteredChangelogs.length} changelog${filteredChangelogs.length !== 1 ? 's' : ''}`
              }
              {searchQuery && ` for "${searchQuery}"`}
              {selectedFilters.length > 0 && ` with filters: ${selectedFilters.join(', ')}`}
            </p>
          </div>
        )}
        
        <div className="space-y-8">
          {filteredChangelogs.map((changelog) => (
            <Link
              key={changelog.filename}
              href={`/changelog/${changelog.slug}`}
              className="block group"
            >
              <article className="changelog-card">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-wrap gap-3">
                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {changelog.title || `Update ${formatDate(changelog.date)}`}
                    </h2>
                    {changelog.versionType && changelog.versionType !== 'unknown' && (
                      <span className={`version-badge ${getVersionBadgeClass(changelog.versionType)}`}>
                        {getVersionEmoji(changelog.versionType)} {changelog.versionType.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getRelativeTime(changelog.generated)}
                  </div>
                </div>

                                {/* High-level summary */}
                <div className="space-y-2">
                  {/* Show "What's new" summary for Stripe-style changelogs */}
                  {changelog.whatsNew && (
                    <div className="text-gray-300 line-clamp-2">
                      {changelog.whatsNew}
                    </div>
                  )}
                  
                  {/* For legacy format, show change counts */}
                  {!changelog.whatsNew && (
                    <div className="flex flex-wrap gap-3 text-sm">
                      {changelog.sections.features && changelog.sections.features.length > 0 && (
                        <span className="text-blue-300">
                          ✨ {changelog.sections.features.length} feature{changelog.sections.features.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {changelog.sections.bugFixes && changelog.sections.bugFixes.length > 0 && (
                        <span className="text-green-300">
                          🐛 {changelog.sections.bugFixes.length} fix{changelog.sections.bugFixes.length !== 1 ? 'es' : ''}
                        </span>
                      )}
                      {changelog.sections.improvements && changelog.sections.improvements.length > 0 && (
                        <span className="text-orange-300">
                          ⚡ {changelog.sections.improvements.length} improvement{changelog.sections.improvements.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {changelog.sections.breakingChanges && changelog.sections.breakingChanges.length > 0 && (
                        <span className="text-red-300">
                          ⚠️ {changelog.sections.breakingChanges.length} breaking change{changelog.sections.breakingChanges.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {!changelog.sections.features?.length && 
                       !changelog.sections.bugFixes?.length && 
                       !changelog.sections.improvements?.length && 
                       !changelog.sections.breakingChanges?.length && (
                        <span className="text-gray-500 italic">
                          No significant changes detected
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                  <div className="text-sm text-gray-500">
                    {changelog.commits} commit{changelog.commits !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                    View details →
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredChangelogs.length === 0 && (
          <div className="text-center py-16">
            {changelogs.length === 0 ? (
              <>
                <div className="text-gray-500 text-lg mb-2">No changelogs yet</div>
                <div className="text-gray-600 text-sm">
                  Generate your first changelog using the CLI tool
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-500 text-lg mb-2">No changelogs found</div>
                <div className="text-gray-600 text-sm">
                  Try adjusting your search query
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>Generated automatically from Git commits</div>
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <code className="bg-gray-800 bg-opacity-40 px-2 py-1 rounded text-green-400 font-mono">
                changelog-ai
              </code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
