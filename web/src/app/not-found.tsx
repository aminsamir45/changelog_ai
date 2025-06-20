import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Changelog Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The changelog you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <span>←</span>
          <span>Back to Changelog</span>
        </Link>
      </div>
    </div>
  );
} 