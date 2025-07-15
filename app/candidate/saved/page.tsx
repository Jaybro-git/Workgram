import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Bookmark, 
  Search,
  Calendar,
  MapPin,
  Building
} from 'lucide-react';
import Navbar from '@/app/components/Navbarlog';
import Footer from '@/app/components/Footer';
import User from '@/models/User';
import Job from '@/models/Job';
import connectDB from '@/lib/mongodb';
import SavedJobCard from '@/app/components/SavedJobCard';

interface JobData {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: {
    min?: number;
    max?: number;
    currency: string;
  };
  description: string;
  requirements: string;
  skills: string[];
  experience: string;
  postedBy: {
    _id: string;
    name: string;
    recruiterProfile?: {
      company: string;
    };
  };
  applicants: Array<{
    candidate: string;
    appliedAt: string;
    status: string;
    _id: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  accountType: 'candidate' | 'recruiter';
  candidateProfile?: {
    experience?: string | null;
    skills: string[];
    cvLink?: string | null;
    appliedJobs: Array<{
      job: string;
      appliedAt: string;
      status: string;
      _id: string;
    }>;
    savedJobs: string[];
  };
}

function convertToUserData(userResult: any): UserData {
  return {
    _id: userResult._id?.toString() || '',
    name: userResult.name || '',
    email: userResult.email || '',
    accountType: userResult.accountType || 'candidate',
    candidateProfile: userResult.candidateProfile ? {
      experience: userResult.candidateProfile.experience ?? null,
      skills: Array.isArray(userResult.candidateProfile.skills) 
        ? userResult.candidateProfile.skills 
        : [],
      cvLink: userResult.candidateProfile.cvLink ?? null,
      appliedJobs: Array.isArray(userResult.candidateProfile.appliedJobs)
        ? userResult.candidateProfile.appliedJobs.map((job: any) => ({
            job: job.job?.toString() || job.toString(),
            appliedAt: job.appliedAt ? new Date(job.appliedAt).toISOString() : new Date().toISOString(),
            status: job.status || 'Applied',
            _id: job._id?.toString() || ''
          }))
        : [],
      savedJobs: Array.isArray(userResult.candidateProfile.savedJobs)
        ? userResult.candidateProfile.savedJobs.map((job: any) => 
            job?.toString() || job
          )
        : []
    } : undefined
  };
}

function convertToJobData(jobResult: any): JobData {
  return {
    _id: jobResult._id?.toString() || '',
    title: jobResult.title || '',
    company: jobResult.company || '',
    location: jobResult.location || '',
    jobType: jobResult.jobType || '',
    salary: {
      min: jobResult.salary?.min || undefined,
      max: jobResult.salary?.max || undefined,
      currency: jobResult.salary?.currency || 'USD'
    },
    description: jobResult.description || '',
    requirements: jobResult.requirements || '',
    skills: Array.isArray(jobResult.skills) ? jobResult.skills : [],
    experience: jobResult.experience || '',
    postedBy: {
      _id: jobResult.postedBy?._id?.toString() || '',
      name: jobResult.postedBy?.name || '',
      recruiterProfile: jobResult.postedBy?.recruiterProfile ? {
        company: jobResult.postedBy.recruiterProfile.company || ''
      } : undefined
    },
    applicants: Array.isArray(jobResult.applicants) 
      ? jobResult.applicants.map((applicant: any) => ({
          candidate: applicant.candidate?.toString() || applicant.toString(),
          appliedAt: applicant.appliedAt ? new Date(applicant.appliedAt).toISOString() : new Date().toISOString(),
          status: applicant.status || 'Applied',
          _id: applicant._id?.toString() || ''
        }))
      : [],
    isActive: Boolean(jobResult.isActive),
    createdAt: jobResult.createdAt ? new Date(jobResult.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: jobResult.updatedAt ? new Date(jobResult.updatedAt).toISOString() : new Date().toISOString()
  };
}

export default async function SavedJobs() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  try {
    await connectDB();
    
    const userResult = await User.findById(session.user.id)
      .select('-password')
      .lean()
      .exec();
    
    if (!userResult) {
      redirect('/login');
    }

    const userData: UserData = convertToUserData(userResult);
    
    // Redirect if not a candidate
    if (userData.accountType !== 'candidate') {
      redirect('/dashboard/recruiter');
    }

    // Get saved job IDs
    const savedJobIds = userData.candidateProfile?.savedJobs || [];
    
    // Fetch saved jobs
    let savedJobs: JobData[] = [];
    if (savedJobIds.length > 0) {
      const jobsResult = await Job.find({ 
        _id: { $in: savedJobIds },
        isActive: true 
      })
      .populate('postedBy', 'name recruiterProfile.company')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
      
      savedJobs = jobsResult.map(convertToJobData);
    }

    // Get applied job IDs for checking application status
    const appliedJobIds = userData.candidateProfile?.appliedJobs 
      ? userData.candidateProfile.appliedJobs.map(app => app.job)
      : [];

    return (
      <>
        <Navbar />
        
        <div className="bg-blue-50 min-h-screen px-6 py-20">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link 
                  href="/dashboard/candidate"
                  className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Bookmark className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
                    <p className="text-gray-600">Jobs you've bookmarked for later review</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Saved</p>
                      <p className="text-xl font-bold text-gray-900">{savedJobs.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Applied From Saved</p>
                      <p className="text-xl font-bold text-gray-900">
                        {savedJobs.filter(job => appliedJobIds.includes(job._id)).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Companies</p>
                      <p className="text-xl font-bold text-gray-900">
                        {new Set(savedJobs.map(job => job.company)).size}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Jobs List */}
            {savedJobs.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Saved Jobs ({savedJobs.length})
                  </h2>
                  <Link
                    href="/dashboard/candidate#find-jobs"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition inline-flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Find More Jobs
                  </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {savedJobs.map((job) => (
                    <SavedJobCard 
                      key={job._id} 
                      job={job} 
                      isApplied={appliedJobIds.includes(job._id)}
                      userId={session.user.id}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bookmark className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Saved Jobs Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start building your job wishlist by saving interesting opportunities. 
                    You can save jobs while browsing and come back to them later.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/dashboard/candidate#find-jobs"
                      className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
                    >
                      Browse Available Jobs
                    </Link>
                    <Link
                      href="/dashboard/candidate"
                      className="block bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </>
    );

  } catch (error) {
    console.error('Saved jobs page error:', error);
    redirect('/login');
  }
}
