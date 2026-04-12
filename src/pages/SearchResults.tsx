import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ResourceCard } from '../components/ResourceCard';

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchResources, categories } = useData();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');

  const results = searchResources(searchQuery, categoryFilter || undefined);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    setSearchQuery(query);
    setCategoryFilter(category);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (categoryFilter) params.category = categoryFilter;
    setSearchParams(params);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (newCategory) params.category = newCategory;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Search Results</h1>
          <p className="text-gray-600">
            {searchQuery && `Results for "${searchQuery}"`}
            {!searchQuery && 'Enter a search query to find resources'}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-gray-600">
              Found {results.length} {results.length === 1 ? 'resource' : 'resources'}
              {categoryFilter && (
                <>
                  {' '}in{' '}
                  <span className="text-blue-600">
                    {categories.find(c => c.id === categoryFilter)?.name}
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Filter Chips */}
        {(searchQuery || categoryFilter) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams(categoryFilter ? { category: categoryFilter } : {});
                }}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                Query: {searchQuery}
                <span className="ml-2">×</span>
              </button>
            )}
            {categoryFilter && (
              <button
                onClick={() => handleCategoryChange('')}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {categories.find(c => c.id === categoryFilter)?.name}
                <span className="ml-2">×</span>
              </button>
            )}
          </div>
        )}

        {/* Results Grid */}
        {searchQuery ? (
          results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600 mb-4">
                No resources found matching your search criteria.
              </p>
              <Link
                to="/categories"
                className="text-blue-600 hover:text-blue-700"
              >
                Browse all categories
              </Link>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Enter a search query above to find resources
            </p>
            <Link
              to="/categories"
              className="text-blue-600 hover:text-blue-700"
            >
              Or browse all categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
