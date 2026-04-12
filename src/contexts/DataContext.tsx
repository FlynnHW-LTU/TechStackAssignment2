import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_BASE } from '../config/apiBase';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  rating: number;
  upvotes: number;
  upvotedBy: string[];
  userId: string;
  userName: string;
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  isAICategory?: boolean;
}

interface DataContextType {
  resources: Resource[];
  categories: Category[];
  addResource: (resource: Omit<Resource, 'id' | 'rating' | 'upvotes' | 'upvotedBy' | 'createdAt' | 'comments'>) => Promise<void>;
  upvoteResource: (resourceId: string, userId: string) => Promise<void>;
  addComment: (resourceId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  getResourcesByCategory: (categoryId: string) => Resource[];
  searchResources: (query: string, categoryFilter?: string) => Resource[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialCategories: Category[] = [
  { id: 'coding', name: 'Coding', description: 'Programming tutorials and resources', icon: 'Code' },
  { id: 'baking', name: 'Baking', description: 'Recipes and baking techniques', icon: 'Cookie' },
  { id: 'art', name: 'Art', description: 'Drawing, painting, and digital art', icon: 'Palette' },
  { id: 'music', name: 'Music', description: 'Music theory, instruments, and composition', icon: 'Music' },
  { id: 'photography', name: 'Photography', description: 'Photography tips and techniques', icon: 'Camera' },
  { id: 'writing', name: 'Writing', description: 'Creative and technical writing', icon: 'PenTool' },
  { id: 'fitness', name: 'Fitness', description: 'Exercise routines and health tips', icon: 'Dumbbell' },
  { id: 'gardening', name: 'Gardening', description: 'Gardening and plant care', icon: 'Sprout' },
  { id: 'ai-tools', name: 'AI Tools', description: 'AI-powered tools for various hobbies', icon: 'Bot', isAICategory: true },
];

const initialResources: Resource[] = [
  {
    id: '1',
    title: 'React Complete Guide',
    description: 'A comprehensive guide to learning React from scratch to advanced concepts.',
    category: 'coding',
    link: 'https://react.dev',
    rating: 4.8,
    upvotes: 142,
    upvotedBy: [],
    userId: 'system',
    userName: 'Admin',
    createdAt: new Date('2024-11-15').toISOString(),
    comments: [
      { id: '1', userId: 'system', userName: 'Sarah', text: 'Excellent resource! Really helped me understand hooks.', createdAt: new Date('2024-11-16').toISOString() }
    ]
  },
  {
    id: '2',
    title: 'Sourdough Starter Guide',
    description: 'Learn how to create and maintain a healthy sourdough starter from scratch.',
    category: 'baking',
    link: 'https://example.com/sourdough',
    rating: 4.9,
    upvotes: 89,
    upvotedBy: [],
    userId: 'system',
    userName: 'Admin',
    createdAt: new Date('2024-11-20').toISOString(),
    comments: []
  },
  {
    id: '3',
    title: 'Digital Art Basics',
    description: 'Introduction to digital art tools and techniques for beginners.',
    category: 'art',
    link: 'https://example.com/digital-art',
    rating: 4.6,
    upvotes: 67,
    upvotedBy: [],
    userId: 'system',
    userName: 'Admin',
    createdAt: new Date('2024-11-10').toISOString(),
    comments: [
      { id: '2', userId: 'system', userName: 'Mike', text: 'Great starting point for digital artists!', createdAt: new Date('2024-11-11').toISOString() }
    ]
  },
  {
    id: '4',
    title: 'ChatGPT for Code Review',
    description: 'How to use ChatGPT effectively for code review and debugging.',
    category: 'ai-tools',
    link: 'https://chat.openai.com',
    rating: 4.7,
    upvotes: 156,
    upvotedBy: [],
    userId: 'system',
    userName: 'Admin',
    createdAt: new Date('2024-11-25').toISOString(),
    comments: []
  },
  {
    id: '5',
    title: 'Midjourney Art Generation',
    description: 'A comprehensive guide to creating stunning art with Midjourney AI.',
    category: 'ai-tools',
    link: 'https://midjourney.com',
    rating: 4.8,
    upvotes: 203,
    upvotedBy: [],
    userId: 'system',
    userName: 'Admin',
    createdAt: new Date('2024-11-28').toISOString(),
    comments: []
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories] = useState<Category[]>(initialCategories);

  // load resources from api on mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        const res = await fetch(`${API_BASE}/resources`);
        if (!res.ok) throw new Error('failed to load resources');
        const data = await res.json();
        setResources((data.resources || []).map(mapApiResource));
      } catch {
        // fallback keeps demo usable if api is unavailable
        setResources(initialResources);
      }
    };
    loadResources();
  }, []);

  const mapApiResource = (apiResource: any): Resource => {
    // map backend resource shape to frontend shape
    return {
      id: apiResource.id,
      title: apiResource.title || '',
      description: apiResource.description || '',
      category: apiResource.category || '',
      link: apiResource.link || '',
      rating: typeof apiResource.rating_average === 'number' ? apiResource.rating_average : 0,
      upvotes: apiResource.upvotes_count || 0,
      upvotedBy: apiResource.upvoted_by || [],
      userId: apiResource.user_id || '',
      userName: apiResource.user_name || '',
      createdAt: apiResource.created_at || new Date().toISOString(),
      comments: (apiResource.comments || []).map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.user_name,
        text: c.text,
        createdAt: c.created_at,
      })),
    };
  };

  const addResource = async (resource: Omit<Resource, 'id' | 'rating' | 'upvotes' | 'upvotedBy' | 'createdAt' | 'comments'>) => {
    // create resource then add it to local state
    try {
      const res = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: resource.title,
          description: resource.description,
          category: resource.category,
          link: resource.link,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const created = mapApiResource(data.resource);
      setResources(prev => [created, ...prev]);
    } catch {
      // no-op keeps ui stable if request fails
    }
  };

  const upvoteResource = async (resourceId: string, _userId: string) => {
    // toggle upvote in backend and refresh one item
    try {
      const res = await fetch(`${API_BASE}/resources/${resourceId}/upvote`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      const updated = mapApiResource(data.resource);
      setResources(prev => prev.map(r => (r.id === resourceId ? updated : r)));
    } catch {
      // no-op keeps ui stable if request fails
    }
  };

  const addComment = async (resourceId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    // post comment and refresh one item
    try {
      const res = await fetch(`${API_BASE}/resources/${resourceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: comment.text }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const updated = mapApiResource(data.resource);
      setResources(prev => prev.map(r => (r.id === resourceId ? updated : r)));
    } catch {
      // no-op keeps ui stable if request fails
    }
  };

  const getResourcesByCategory = (categoryId: string) => {
    // filter resources by category id
    return resources.filter(resource => resource.category === categoryId);
  };

  const searchResources = (query: string, categoryFilter?: string) => {
    // match query in title or description
    const lowerQuery = query.toLowerCase();
    return resources.filter(resource => {
      const matchesQuery = 
        resource.title.toLowerCase().includes(lowerQuery) ||
        resource.description.toLowerCase().includes(lowerQuery);
      const matchesCategory = !categoryFilter || resource.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  };

  return (
    <DataContext.Provider
      value={{
        resources,
        categories,
        addResource,
        upvoteResource,
        addComment,
        getResourcesByCategory,
        searchResources,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
