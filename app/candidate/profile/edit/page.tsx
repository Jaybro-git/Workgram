'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbarlog';

interface FormData {
  name: string;
  phone: string;
  location: string;
  bio: string;
  profileImage: string;
  experience: string;
  skills: string[];
  cvLink: string;
}

export default function EditCandidateProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState(''); // Separate state for skills input
  const [formData, setFormData] = useState<FormData>({
    // Basic fields
    name: '',
    phone: '',
    location: '',
    bio: '',
    profileImage: '',
    
    // Candidate fields
    experience: '',
    skills: [],
    cvLink: '',
  });

  useEffect(() => {
    // Fetch current profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        
        if (data.user) {
          const skills = data.user.candidateProfile?.skills || [];
          setFormData({
            name: data.user.name || '',
            phone: data.user.phone || '',
            location: data.user.location || '',
            bio: data.user.bio || '',
            profileImage: data.user.profileImage || '',
            experience: data.user.candidateProfile?.experience || '',
            skills: skills,
            cvLink: data.user.candidateProfile?.cvLink || '',
          });
          setSkillsInput(skills.join(', ')); // Set the input string
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update basic profile
      const basicResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          profileImage: formData.profileImage,
        }),
      });

      // Update candidate profile
      const candidateResponse = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience: formData.experience,
          skills: formData.skills,
          cvLink: formData.cvLink,
        }),
      });

      if (basicResponse.ok && candidateResponse.ok) {
        router.push('/candidate/profile');
      } else {
        alert('Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fixed skills handling
  const handleSkillsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillsInput(value);
    
    // Process skills array
    const skillsArray = value
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill);
    setFormData({ ...formData, skills: skillsArray });
  };

  return (
    <>
      <Navbar />
      <div className="bg-blue-50 min-h-screen px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link 
                href="/candidate/profile"
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location"
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/profile-image.jpg"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleTextareaChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleTextareaChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your work experience..."
                />
              </div>

              {/* Skills - Fixed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={handleSkillsInputChange}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="React, Node.js, Python, AWS"
                />
              </div>

              {/* CV Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV/Resume Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="cvLink"
                    value={formData.cvLink}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CV/Resume URL"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your CV to Google Drive, Dropbox, or any cloud storage and paste the public link here.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
