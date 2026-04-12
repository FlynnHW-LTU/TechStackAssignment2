import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X, Upload, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, uploadProfilePhoto, deleteProfilePhoto } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    pronouns: '',
    phone: '',
    hobbies: [] as string[],
    skills: [] as string[],
    profilePhoto: '',
  });
  const [newHobby, setNewHobby] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        pronouns: user.pronouns || '',
        phone: user.phone || '',
        hobbies: user.hobbies || [],
        skills: user.skills || [],
        profilePhoto: user.profilePhoto || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        pronouns: user.pronouns || '',
        phone: user.phone || '',
        hobbies: user.hobbies || [],
        skills: user.skills || [],
        profilePhoto: user.profilePhoto || '',
      });
    }
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const input = e.target;
    if (!file) return;
    await uploadProfilePhoto(file);
    input.value = '';
  };

  const handleDeletePhoto = async () => {
    await deleteProfilePhoto();
  };

  const addHobby = () => {
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim())) {
      setFormData(prev => ({ ...prev, hobbies: [...prev.hobbies, newHobby.trim()] }));
      setNewHobby('');
    }
  };

  const removeHobby = (hobby: string) => {
    setFormData(prev => ({ ...prev, hobbies: prev.hobbies.filter(h => h !== hobby) }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1>My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Profile Photo */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {formData.profilePhoto ? (
                <img
                  src={formData.profilePhoto}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-4xl">
                    {formData.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isEditing && (
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  <label className="p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.profilePhoto && (
                    <button
                      onClick={handleDeletePhoto}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block mb-2">
                Full Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2">
                Email *
              </label>
              <p className="text-gray-900">{formData.email}</p>
              {isEditing && (
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              )}
            </div>

            {/* Pronouns */}
            <div>
              <label className="block mb-2">
                Pronouns
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pronouns}
                  onChange={(e) => setFormData(prev => ({ ...prev, pronouns: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., they/them, she/her, he/him"
                />
              ) : (
                <p className="text-gray-900">{formData.pronouns || 'Not specified'}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              ) : (
                <p className="text-gray-900">{formData.phone || 'Not specified'}</p>
              )}
            </div>

            {/* Hobbies */}
            <div>
              <label className="block mb-2">
                Hobbies
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.hobbies.map(hobby => (
                  <span
                    key={hobby}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {hobby}
                    {isEditing && (
                      <button
                        onClick={() => removeHobby(hobby)}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {formData.hobbies.length === 0 && !isEditing && (
                  <p className="text-gray-500">No hobbies added yet</p>
                )}
              </div>
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a hobby"
                  />
                  <button
                    onClick={addHobby}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {formData.skills.length === 0 && !isEditing && (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a skill"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
