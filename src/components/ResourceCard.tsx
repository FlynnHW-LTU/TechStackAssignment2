import { Link } from 'react-router-dom';
import { ArrowUpRight, ThumbsUp, MessageSquare } from 'lucide-react';
import { Resource } from '../contexts/DataContext';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const categoryName = resource.category.charAt(0).toUpperCase() + resource.category.slice(1);

  return (
    <Link
      to={`/resources/${resource.id}`}
      className="group block backdrop-blur-xl bg-white/60 rounded-2xl border border-white/20 hover:bg-white/80 hover:shadow-xl hover:shadow-purple-500/10 transition-all p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="mb-2 group-hover:text-purple-600 transition-colors">{resource.title}</h3>
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-purple-700 rounded-full text-sm backdrop-blur-sm border border-purple-200/30">
            {categoryName}
          </span>
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 ml-2" />
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">
        {resource.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{resource.upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{resource.comments.length}</span>
          </div>
        </div>
        <span>by {resource.userName}</span>
      </div>
    </Link>
  );
}
