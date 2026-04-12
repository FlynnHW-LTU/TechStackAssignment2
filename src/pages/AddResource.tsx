import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export function AddResource() {
  const navigate = useNavigate();
  const { categories, addResource } = useData();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    link: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    // check required fields and basic url format
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.link.trim()) {
      newErrors.link = 'Link is required';
    } else if (!/^https?:\/\/.+/.test(formData.link)) {
      newErrors.link = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // mimic request delay for feedback state
    await new Promise(resolve => setTimeout(resolve, 500));

    addResource({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      link: formData.link.trim(),
      userId: user.id,
      userName: user.fullName,
    });

    setLoading(false);
    setShowSuccess(true);

    // clear form after successful submit
    setFormData({
      title: '',
      description: '',
      category: '',
      link: '',
    });

    // send user to selected category page
    setTimeout(() => {
      navigate('/categories/' + formData.category);
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="backdrop-blur-xl bg-white/60 rounded-2xl border border-white/20 shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Resource Added Successfully!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for contributing to the Skill Swap Hub community.
            </p>
            <p className="text-gray-500">
              Redirecting you to the category page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Share a Resource</h1>
          <p className="text-gray-600">
            Help others learn by sharing valuable resources from around the web
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/60 rounded-2xl border border-white/20 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* title */}
            <div>
              <label htmlFor="title" className="block mb-2">
                Resource Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-4 py-2 backdrop-blur-sm bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="e.g., Complete React Tutorial for Beginners"
              />
              {errors.title && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </div>
              )}
            </div>

            {/* description */}
            <div>
              <label htmlFor="description" className="block mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-2 backdrop-blur-sm bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="Provide a brief description of what this resource offers and why it's valuable..."
              />
              {errors.description && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </div>
              )}
            </div>

            {/* category */}
            <div>
              <label htmlFor="category" className="block mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full px-4 py-2 backdrop-blur-sm bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.category ? 'border-red-500' : 'border-white/30'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </div>
              )}
            </div>

            {/* link */}
            <div>
              <label htmlFor="link" className="block mb-2">
                Resource Link *
              </label>
              <input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => handleChange('link', e.target.value)}
                className={`w-full px-4 py-2 backdrop-blur-sm bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.link ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="https://example.com/resource"
              />
              {errors.link && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.link}
                </div>
              )}
            </div>

            {/* submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding Resource...' : 'Share Resource'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-gray-500 text-center">
            * Required fields
          </p>
        </div>
      </div>
    </div>
  );
}