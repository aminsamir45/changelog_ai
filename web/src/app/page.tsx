import Link from 'next/link';
import { getAllChangelogs, getVersionEmoji, getVersionBadgeClass, formatDate, getRelativeTime } from '@/lib/changelog';

export default async function Home() {
  const changelogs = await getAllChangelogs();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">Changelog</h1>
              <p className="text-gray-400 text-base">
                New features, improvements, and fixes to our product.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="status-dot green"></div>
              <span>{changelogs.length} updates</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {changelogs.map((changelog) => (
            <Link
              key={changelog.filename}
              href={`/changelog/${changelog.slug}`}
              className="block group"
            >
              <article className="changelog-card">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {formatDate(changelog.date)}
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

                {/* Content Preview */}
                <div className="space-y-3">
                  {changelog.sections.features && changelog.sections.features.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="status-dot blue mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-blue-300 mb-1">
                          {changelog.sections.features.length} new feature{changelog.sections.features.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-gray-300 line-clamp-2">
                          {changelog.sections.features[0]}{changelog.sections.features.length > 1 && '...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {changelog.sections.bugFixes && changelog.sections.bugFixes.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="status-dot green mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-green-300 mb-1">
                          {changelog.sections.bugFixes.length} bug fix{changelog.sections.bugFixes.length !== 1 ? 'es' : ''}
                        </div>
                        <div className="text-gray-300 line-clamp-2">
                          {changelog.sections.bugFixes[0]}{changelog.sections.bugFixes.length > 1 && '...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {changelog.sections.improvements && changelog.sections.improvements.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="status-dot orange mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-orange-300 mb-1">
                          {changelog.sections.improvements.length} improvement{changelog.sections.improvements.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-gray-300 line-clamp-2">
                          {changelog.sections.improvements[0]}{changelog.sections.improvements.length > 1 && '...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {changelog.sections.breakingChanges && changelog.sections.breakingChanges.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-red-300 mb-1">
                          {changelog.sections.breakingChanges.length} breaking change{changelog.sections.breakingChanges.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-gray-300 line-clamp-2">
                          {changelog.sections.breakingChanges[0]}{changelog.sections.breakingChanges.length > 1 && '...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {!changelog.sections.features?.length && 
                   !changelog.sections.bugFixes?.length && 
                   !changelog.sections.improvements?.length && 
                   !changelog.sections.breakingChanges?.length && (
                    <div className="text-gray-500 italic">
                      No significant user-facing changes detected
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-2">
                      <div className="status-dot blue"></div>
                      <span>{changelog.commits} commit{changelog.commits !== 1 ? 's' : ''}</span>
                    </span>
                    <span>{changelog.repository}</span>
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
        {changelogs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-2">No changelogs yet</div>
            <div className="text-gray-600 text-sm">
              Generate your first changelog using the CLI tool
            </div>
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
