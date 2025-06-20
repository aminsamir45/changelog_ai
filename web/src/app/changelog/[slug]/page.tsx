import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChangelogBySlug, getAllChangelogs, getVersionEmoji, getVersionBadgeClass, formatDate, getRelativeTime } from '@/lib/changelog';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const changelogs = await getAllChangelogs();
  return changelogs.map((changelog) => ({
    slug: changelog.slug,
  }));
}

export default async function ChangelogPage({ params }: PageProps) {
  const { slug } = await params;
  const changelog = await getChangelogBySlug(slug);

  if (!changelog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <span>←</span>
                <span>Back to Changelog</span>
              </Link>
              <h1 className="text-3xl font-semibold text-white mb-2">
                {formatDate(changelog.date)}
              </h1>
              <div className="flex items-center space-x-4">
                {changelog.versionType && changelog.versionType !== 'unknown' && (
                  <span className={`version-badge ${getVersionBadgeClass(changelog.versionType)}`}>
                    {getVersionEmoji(changelog.versionType)} {changelog.versionType.toUpperCase()}
                  </span>
                )}
                {changelog.versionConfidence && (
                  <span className="text-sm text-gray-500">
                    {changelog.versionConfidence}% confidence
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {getRelativeTime(changelog.generated)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Features */}
          {changelog.sections.features && changelog.sections.features.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-3">
                <span className="text-blue-400">✨</span>
                <span>Features</span>
              </h2>
              <div className="space-y-4">
                {changelog.sections.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="status-dot blue mt-2 flex-shrink-0"></div>
                    <div className="text-gray-300 leading-relaxed">
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bug Fixes */}
          {changelog.sections.bugFixes && changelog.sections.bugFixes.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-3">
                <span className="text-green-400">🐛</span>
                <span>Bug Fixes</span>
              </h2>
              <div className="space-y-4">
                {changelog.sections.bugFixes.map((fix, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="status-dot green mt-2 flex-shrink-0"></div>
                    <div className="text-gray-300 leading-relaxed">
                      {fix}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Improvements */}
          {changelog.sections.improvements && changelog.sections.improvements.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-3">
                <span className="text-orange-400">⚡</span>
                <span>Improvements</span>
              </h2>
              <div className="space-y-4">
                {changelog.sections.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="status-dot orange mt-2 flex-shrink-0"></div>
                    <div className="text-gray-300 leading-relaxed">
                      {improvement}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Breaking Changes */}
          {changelog.sections.breakingChanges && changelog.sections.breakingChanges.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-3">
                <span className="text-red-400">⚠️</span>
                <span>Breaking Changes</span>
              </h2>
              <div className="bg-red-900 bg-opacity-20 border border-red-800 border-opacity-50 rounded-lg p-6 mb-6">
                <p className="text-red-200 text-sm">
                  <strong>Important:</strong> These changes may require updates to your code or configuration.
                </p>
              </div>
              <div className="space-y-4">
                {changelog.sections.breakingChanges.map((change, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-gray-300 leading-relaxed">
                      {change}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section className="border-t border-gray-800 pt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Repository</div>
                <div className="text-gray-300">{changelog.repository}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Commits</div>
                <div className="text-gray-300">{changelog.commits} commit{changelog.commits !== 1 ? 's' : ''}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Generated</div>
                <div className="text-gray-300">{getRelativeTime(changelog.generated)}</div>
              </div>
              {changelog.versionType && (
                <div>
                  <div className="text-gray-400 mb-1">Version Impact</div>
                  <div className="text-gray-300">
                    {changelog.versionType.toUpperCase()}
                    {changelog.versionConfidence && (
                      <span className="text-gray-500 ml-2">({changelog.versionConfidence}% confidence)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
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