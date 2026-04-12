import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, ExternalLink, Share2, MessageSquare, Send } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ResourceCard } from '../components/ResourceCard';

export function ResourceDetail() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const { resources, categories, upvoteResource, addComment, getResourcesByCategory } = useData();
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');

  const resource = resources.find(r => r.id === resourceId);
  const category = resource ? categories.find(c => c.id === resource.category) : null;

  const relatedResources = resource
    ? getResourcesByCategory(resource.category)
        .filter(r => r.id !== resource.id)
        .slice(0, 3)
    : [];

  useEffect(() => {
    if (!resource) {
      navigate('/404');
    }
  }, [resource, navigate]);

  if (!resource || !category) {
    return null;
  }

  const hasUpvoted = user ? resource.upvotedBy.includes(user.id) : false;

  const handleUpvote = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    upvoteResource(resource.id, user.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    if (commentText.trim()) {
      addComment(resource.id, {
        userId: user.id,
        userName: user.fullName,
        text: commentText.trim(),
      });
      setCommentText('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/categories" className="hover:text-blue-600">
            Categories
          </Link>
          <span>/</span>
          <Link to={`/categories/${category.id}`} className="hover:text-blue-600">
            {category.name}
          </Link>
          <span>/</span>
          <span>{resource.title}</span>
        </div>

        {/* Resource Details */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="mb-2">{resource.title}</h1>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {category.name}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{resource.description}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Shared by {resource.userName}</span>
              <span>•</span>
              <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* External Link */}
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
          >
            Visit Resource
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-6 border-t">
            <button
              onClick={handleUpvote}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                hasUpvoted
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 mr-2 ${hasUpvoted ? 'fill-current' : ''}`} />
              {resource.upvotes} {resource.upvotes === 1 ? 'Upvote' : 'Upvotes'}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <div className="flex items-center text-gray-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              {resource.comments.length} {resource.comments.length === 1 ? 'Comment' : 'Comments'}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="mb-6">Comments & Reviews</h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts about this resource..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">
                Please log in to leave a comment
              </p>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700"
              >
                Log In
              </Link>
            </div>
          )}

          {/* Comments List */}
          {resource.comments.length > 0 ? (
            <div className="space-y-6">
              {resource.comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white">
                        {comment.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm">{comment.userName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* More from this category */}
        {relatedResources.length > 0 && (
          <div>
            <h2 className="mb-6">More from {category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedResources.map(relatedResource => (
                <ResourceCard key={relatedResource.id} resource={relatedResource} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
