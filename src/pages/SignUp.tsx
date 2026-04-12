import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    pronouns: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await signup(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/profile');
    } else {
      const lower = result.error.toLowerCase();
      let key: 'email' | 'password' | 'form' = 'form';
      if (
        lower.includes('already registered') ||
        lower.includes('already exists')
      ) {
        key = 'email';
      } else if (lower.includes('password')) {
        key = 'password';
      } else if (lower.includes('email')) {
        key = 'email';
      }
      setErrors(key === 'form' ? { form: result.error } : { [key]: result.error });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || errors.form) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
        ...(prev.form ? { form: '' } : {}),
      }));
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Your Account</h1>
          <p className="text-gray-600">
            Join Skill Swap Hub and start sharing knowledge
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/60 rounded-2xl border border-white/20 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="flex items-center text-red-600 text-sm rounded-xl border border-red-200 bg-red-50/80 px-4 py-3">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {errors.form}
              </div>
            )}
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2 backdrop-blur-sm bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full px-4 py-2 backdrop-blur-sm bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.password ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="Minimum 8 characters"
              />
              {errors.password && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-2 backdrop-blur-sm bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="border-t border-white/20 pt-6">
              <p className="text-gray-600 mb-4 text-sm">
                Optional information (you can add this later in your profile)
              </p>

              {/* Pronouns */}
              <div className="mb-4">
                <label htmlFor="pronouns" className="block mb-2">
                  Pronouns
                </label>
                <input
                  id="pronouns"
                  type="text"
                  value={formData.pronouns}
                  onChange={(e) => handleChange('pronouns', e.target.value)}
                  className="w-full px-4 py-2 backdrop-blur-sm bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., they/them, she/her, he/him"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block mb-2">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 backdrop-blur-sm bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="(optional)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}