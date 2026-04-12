import { Link } from 'react-router-dom';
import { ArrowRight, Share2, Sparkles } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ResourceCard } from '../components/ResourceCard';
import { CategoryCard } from '../components/CategoryCard';

export function Home() {
  const { resources, categories } = useData();
  const { isAuthenticated } = useAuth();

  // Get top resources
  const topResources = [...resources]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 6);

  // Get featured categories
  const featuredCategories = categories.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/30 mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Share Skills, Learn Together
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Discover and share the best learning resources for your hobbies and skills
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center px-8 py-4 backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl hover:bg-white/80 transition-all shadow-lg"
                >
                  Browse Resources
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/add-resource"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share a Resource
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center px-8 py-4 backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl hover:bg-white/80 transition-all shadow-lg"
                >
                  Browse Categories
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="mb-2">Explore Categories</h2>
              <p className="text-gray-600">Find resources by topic</p>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center text-blue-600 hover:text-purple-600 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                resourceCount={resources.filter(r => r.category === category.id).length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="mb-2">Popular Resources</h2>
            <p className="text-gray-600">Most loved by our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover AI Tools
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Explore AI-powered tools to enhance your hobbies and skills
          </p>
          <Link
            to="/ai-tools"
            className="inline-flex items-center px-8 py-4 backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl hover:bg-white/80 transition-all shadow-lg"
          >
            Explore AI Tools
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
