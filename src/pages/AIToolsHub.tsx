import { Link } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ResourceCard } from '../components/ResourceCard';

export function AIToolsHub() {
  const { resources, categories } = useData();

  const aiCategory = categories.find(c => c.isAICategory);
  const aiResources = resources.filter(r => r.category === 'ai-tools');

  // Group AI resources by subcategories (based on description keywords)
  const artTools = aiResources.filter(r => 
    r.description.toLowerCase().includes('art') || 
    r.title.toLowerCase().includes('art') ||
    r.title.toLowerCase().includes('midjourney')
  );

  const codeTools = aiResources.filter(r => 
    r.description.toLowerCase().includes('code') || 
    r.title.toLowerCase().includes('code') ||
    r.title.toLowerCase().includes('gpt')
  );

  const otherTools = aiResources.filter(r => 
    !artTools.includes(r) && !codeTools.includes(r)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Bot className="w-8 h-8" />
            </div>
            <h1 className="mb-6">
              AI Tools for Your Hobbies
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Discover cutting-edge AI-powered tools to enhance your creative process,
              boost productivity, and explore new possibilities in your favorite hobbies.
            </p>
            <Link
              to="/add-resource"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Share an AI Tool
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="mb-4">Why AI Tools?</h2>
            <p className="text-gray-600 text-lg">
              AI technology is revolutionizing how we learn, create, and practice our hobbies.
              From generating art to optimizing code, these tools can help you achieve more
              while focusing on what you love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-2">Boost Creativity</h3>
              <p className="text-gray-600">
                AI tools can inspire new ideas and help you overcome creative blocks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-2">Save Time</h3>
              <p className="text-gray-600">
                Automate repetitive tasks and focus on the aspects you enjoy most.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-2">Learn Faster</h3>
              <p className="text-gray-600">
                Get instant feedback and personalized guidance on your projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Art Generation Tools */}
      {artTools.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="mb-2">AI Art Generation</h2>
              <p className="text-gray-600">
                Create stunning visuals with AI-powered art tools
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artTools.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Code & Development Tools */}
      {codeTools.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="mb-2">AI for Coding</h2>
              <p className="text-gray-600">
                Write better code faster with AI assistance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {codeTools.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other AI Tools */}
      {otherTools.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="mb-2">More AI Tools</h2>
              <p className="text-gray-600">
                Explore other AI-powered resources
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTools.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Resources Yet */}
      {aiResources.length === 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2">No AI Tools Yet</h3>
              <p className="text-gray-600 mb-6">
                Be the first to share an AI tool with the community!
              </p>
              <Link
                to="/add-resource"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Share an AI Tool
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">Explore All Categories</h2>
          <p className="text-xl text-purple-100 mb-8">
            AI tools are just one part of our resource library. Discover resources
            for coding, art, music, and more.
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse All Categories
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
