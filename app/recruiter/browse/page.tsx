import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  Search,
  Star,
  Briefcase
} from 'lucide-react';
import Navbar from '@/app/components/Navbarlog';
import Footer from '@/app/components/Footer';
import User from '@/models/User';
import Job from '@/models/Job';
import connectDB from '@/lib/mongodb';
import TalentSearchSection from '@/app/components/TalentSearchSection';

interface CandidateData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  bio?: string;
  candidateProfile: {
    experience?: string;
    skills: string[];
    cvLink?: string;
  };
}

function convertToCandidateData(userResult: any): CandidateData {
  return {
    _id: userResult._id?.toString() || '',
    name: userResult.name || '',
    email: userResult.email || '',
    phone: userResult.phone || undefined,
    location: userResult.location || undefined,
    profileImage: userResult.profileImage || undefined,
    bio: userResult.bio || undefined,
    candidateProfile: {
      experience: userResult.candidateProfile?.experience || undefined,
      skills: Array.isArray(userResult.candidateProfile?.skills) 
        ? userResult.candidateProfile.skills 
        : [],
      cvLink: userResult.candidateProfile?.cvLink || undefined
    }
  };
}

export default async function BrowseTalent() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  try {
    await connectDB();
    
    const userResult = await User.findById(session.user.id)
      .select('accountType recruiterProfile.postedJobs')
      .lean()
      .exec() as any;
    
    if (!userResult || userResult.accountType !== 'recruiter') {
      redirect('/dashboard/candidate');
    }

    // Fetch candidates with complete profiles
    const candidatesResult = await User.find({ 
      accountType: 'candidate',
      'candidateProfile.experience': { $ne: null },
      'candidateProfile.skills.0': { $exists: true }
    })
    .select('name email phone location profileImage bio candidateProfile')
    .sort({ createdAt: -1 })
    .limit(12)
    .lean()
    .exec();
    
    const candidates: CandidateData[] = candidatesResult.map(convertToCandidateData);

    return (
      <>
        <Navbar />
        
        <div className="bg-blue-50 min-h-screen px-6 py-20">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link 
                  href="/dashboard/recruiter"
                  className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Browse Talent</h1>
                    <p className="text-gray-600">Discover and connect with top candidates</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Candidates</p>
                      <p className="text-xl font-bold text-gray-900">{candidates.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Verified Profiles</p>
                      <p className="text-xl font-bold text-gray-900">{candidates.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Available Now</p>
                      <p className="text-xl font-bold text-gray-900">{candidates.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Talent Search Section */}
            <TalentSearchSection 
              initialCandidates={candidates}
              recruiterId={session.user.id}
            />
          </div>
        </div>

        <Footer />
      </>
    );

  } catch (error) {
    console.error('Browse talent page error:', error);
    redirect('/login');
  }
}
