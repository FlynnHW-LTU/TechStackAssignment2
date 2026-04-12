import { useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CategoryCard } from '../components/CategoryCard';

export function Categories() {
  const { categories, resources } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const regularCategories = filteredCategories.filter(c => !c.isAICategory);
  const aiCategories = filteredCategories.filter(c => c.isAICategory);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Browse Categories</h1>
          <p className="text-gray-600">
            Explore resources organized by topic and interest
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* AI Tools Section */}
        {aiCategories.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="mb-2">AI-Powered Tools</h2>
              <p className="text-gray-600">
                Discover AI tools to enhance your hobbies and skills
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  resourceCount={resources.filter(r => r.category === category.id).length}
                />
              ))}
            </div>
          </section>
        )}

        {/* Regular Categories Section */}
        {regularCategories.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="mb-2">All Categories</h2>
              <p className="text-gray-600">
                {regularCategories.length} categories available
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  resourceCount={resources.filter(r => r.category === category.id).length}
                />
              ))}
            </div>
          </section>
        )}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No categories found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}