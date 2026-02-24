import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentHead } from '../hooks/useDocumentHead';

const NotFound: React.FC = () => {
  useDocumentHead({
    title: '404 — Page Not Found | Pilot Setup',
    description: 'The page you are looking for does not exist. Return to Pilot Setup to explore flight simulator hardware recommendations.',
  });

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold text-dark-300 opacity-30">404</h1>
        <h2 className="text-2xl font-semibold text-dark-100">Page Not Found</h2>
        <p className="text-dark-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
