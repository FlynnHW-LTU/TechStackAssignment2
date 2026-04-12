import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Category } from '../contexts/DataContext';

interface CategoryCardProps {
  category: Category;
  resourceCount?: number;
}

export function CategoryCard({ category, resourceCount = 0 }: CategoryCardProps) {
  const IconComponent = (Icons as any)[category.icon] || Icons.Folder;

  return (
    <Link
      to={`/categories/${category.id}`}
      className="group block backdrop-blur-xl bg-white/60 rounded-2xl border border-white/20 hover:bg-white/80 hover:shadow-xl hover:shadow-purple-500/10 transition-all p-6"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl backdrop-blur-sm ${
          category.isAICategory 
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-200/30' 
            : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-200/30'
        }`}>
          <IconComponent className={`w-6 h-6 ${
            category.isAICategory ? 'text-purple-600' : 'text-blue-600'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 group-hover:text-purple-600 transition-colors">{category.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{category.description}</p>
          <span className="text-sm text-gray-500">{resourceCount} resources</span>
        </div>
      </div>
    </Link>
  );
}
