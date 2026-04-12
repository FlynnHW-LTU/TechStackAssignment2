import { Link } from 'react-router-dom';
import { Users, Target, Heart, ArrowRight } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">About Skill Swap Hub</h1>
          <p className="text-xl text-blue-100">
            A community-driven platform for discovering and sharing learning resources
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg">
              We believe that learning should be accessible, collaborative, and fun.
              Skill Swap Hub connects passionate learners with high-quality resources
              curated by the community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-2">Community-Driven</h3>
              <p className="text-gray-600">
                Every resource is shared by real people who are passionate about their hobbies and skills.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-2">Organized & Searchable</h3>
              <p className="text-gray-600">
                Find exactly what you need with our intuitive categories and powerful search.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-2">Quality First</h3>
              <p className="text-gray-600">
                Community ratings and reviews help surface the best resources for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">
              Getting started with Skill Swap Hub is easy
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                1
              </div>
              <div>
                <h3 className="mb-2">Browse or Search</h3>
                <p className="text-gray-600">
                  Explore resources by category or search for specific topics you want to learn.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="mb-2">Create an Account</h3>
                <p className="text-gray-600">
                  Sign up to upvote your favorite resources, leave comments, and share your own discoveries.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="mb-2">Share Resources</h3>
                <p className="text-gray-600">
                  Found something amazing? Share it with the community and help others learn.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                4
              </div>
              <div>
                <h3 className="mb-2">Engage & Learn</h3>
                <p className="text-gray-600">
                  Upvote helpful resources, leave reviews, and connect with other learners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">What You Can Learn</h2>
            <p className="text-gray-600 text-lg">
              From traditional hobbies to cutting-edge AI tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Coding',
              'Baking',
              'Art',
              'Music',
              'Photography',
              'Writing',
              'Fitness',
              'Gardening',
              'AI Tools',
              'And More...',
            ].map(category => (
              <div
                key={category}
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">Join Our Community</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your learning journey today and discover resources shared by passionate learners worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Browse Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
