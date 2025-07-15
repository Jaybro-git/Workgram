import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Camera,
  Award,
  Globe,
  FileText,
  Download
} from 'lucide-react';
import Navbar from '@/app/components/Navbarlog';
import Footer from '@/app/components/Footer';
import ContactUs from '@/app/components/ContactUs';
import UserModel from '@/models/User';
import connectDB from '@/lib/mongodb';

export default async function CandidateProfile() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Ensure only candidates can access this page
  if (session.user?.accountType !== 'candidate') {
    redirect('/dashboard');
  }

  // Fetch user data from database
  await connectDB();
  const userData = await UserModel.findById(session.user.id).select('-password');
  
  if (!userData) {
    redirect('/login');
  }

  const profileData = {
    name: userData.name || 'Full Name',
    email: userData.email || 'ex@example.com',
    image: userData.profileImage || null,
    phone: userData.phone || 'Not provided',
    location: userData.location || 'Not provided',
    bio: userData.bio || 'No bio available',
    joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : 'Recently',
    experience: userData.candidateProfile?.experience || 'No experience provided',
    skills: userData.candidateProfile?.skills || [],
    cvLink: userData.candidateProfile?.cvLink || null,
    profileCompletionPercentage: userData.profileCompletionPercentage || 0,
  };

  const candidateActions = [
    {
      icon: <Edit className="w-6 h-6 text-blue-600" />,
      title: 'Edit Profile',
      description: 'Update your personal information and skills',
      href: '/candidate/profile/edit',
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: 'Update CV',
      description: 'Upload or update your resume link',
      href: '/candidate/profile/edit',
    },
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: 'View Applications',
      description: 'Check your job application status',
      href: '/candidate/applications',
    },
  ];

  return (
    <>
      <Navbar />

      {/* Main content with blue background */}
      <main className="bg-blue-50 min-h-screen px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Profile Header Section */}
          <div className="pt-20 pb-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              
              {/* Cover Photo */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 relative">
              </div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
                  
                  {/* Profile Picture and Basic Info */}
                  <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="relative">
                      {profileData.image ? (
                        <img 
                          src={profileData.image} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-blue-600 flex items-center justify-center">
                          <UserIcon className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="text-center md:text-left">
                      <h1 className="text-3xl font-bold text-white mb-3">{profileData.name}</h1>
                      <p className="text-lg text-blue-600 font-medium mb-2">Candidate</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profileData.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {profileData.joinDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Link
                    href="/candidate/profile/edit"
                    className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 justify-center"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid gap-8 lg:grid-cols-3 pb-20">
            
            {/* Left Column - Profile Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* About */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{profileData.location}</span>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
                <p className="text-gray-700 leading-relaxed">{profileData.experience}</p>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>

              {/* CV/Resume */}
              {profileData.cvLink && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">CV/Resume</h2>
                  <a 
                    href={profileData.cvLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition"
                  >
                    <Download className="w-5 h-5" />
                    View/Download CV
                  </a>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Stats */}
            <div className="space-y-8">
              
              {/* Profile Completion */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Completion</h2>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-blue-600">{profileData.profileCompletionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${profileData.profileCompletionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                {profileData.profileCompletionPercentage < 100 && (
                  <Link
                    href="/candidate/profile/edit"
                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                  >
                    Complete your profile to get better job matches →
                  </Link>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {candidateActions.map(({ icon, title, description, href }) => (
                    <Link
                      key={title}
                      href={href}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition group"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold text-blue-600">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Applications Sent</span>
                    <span className="font-semibold text-blue-600">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile Completeness</span>
                    <span className="font-semibold text-green-600">{profileData.profileCompletionPercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Saved Jobs</span>
                    <span className="font-semibold text-blue-600">18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ContactUs />
      <Footer />
    </>
  );
}
