import { Link } from 'react-router-dom';
import { Home, Search, Folder } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl mb-4">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="text-gray-600 text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <p className="text-gray-600 mb-6">
            Here are some helpful links instead:
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/categories"
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Folder className="w-5 h-5" />
              <span>Browse Categories</span>
            </Link>

            <Link
              to="/search"
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Search Resources</span>
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          If you think this is a mistake, please{' '}
          <Link to="/contact" className="text-blue-600 hover:text-blue-700">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
