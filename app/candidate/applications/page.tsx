import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Briefcase,
  Gift
} from 'lucide-react';
import Navbar from '@/app/components/Navbarlog';
import Footer from '@/app/components/Footer';
import User from '@/models/User';
import Job from '@/models/Job';
import connectDB from '@/lib/mongodb';
import ApplicationCard from '@/app/components/ApplicationCard';
import JobOfferingCard from '@/app/components/JobOfferingCard';

interface ApplicationData {
  _id: string;
  job: {
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
    postedBy: {
      _id: string;
      name: string;
      recruiterProfile?: {
        company: string;
      };
    };
  };
  appliedAt: string;
  status: string;
  interviewLink?: string;
}

interface JobOfferingData {
  _id: string;
  job: {
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
  };
  recruiter: {
    _id: string;
    name: string;
    recruiterProfile?: {
      company: string;
    };
  };
  offeredAt: string;
  status: string;
  interviewLink?: string;
  message?: string;
}

// Add interface for user result to fix TypeScript error
interface UserResult {
  _id: string;
  accountType: 'candidate' | 'recruiter';
  candidateProfile?: {
    appliedJobs?: any[];
    jobOfferings?: any[];
  };
}

function convertToApplicationData(userResult: any): ApplicationData[] {
  if (!userResult.candidateProfile?.appliedJobs) return [];
  
  return userResult.candidateProfile.appliedJobs.map((app: any) => ({
    _id: app._id?.toString() || '',
    job: {
      _id: app.job._id?.toString() || '',
      title: app.job.title || '',
      company: app.job.company || '',
      location: app.job.location || '',
      jobType: app.job.jobType || '',
      salary: {
        min: app.job.salary?.min,
        max: app.job.salary?.max,
        currency: app.job.salary?.currency || 'USD'
      },
      postedBy: {
        _id: app.job.postedBy._id?.toString() || '',
        name: app.job.postedBy.name || '',
        recruiterProfile: app.job.postedBy.recruiterProfile
      }
    },
    appliedAt: app.appliedAt ? new Date(app.appliedAt).toISOString() : new Date().toISOString(),
    status: app.status || 'Applied',
    interviewLink: app.interviewLink || undefined
  }));
}

function convertToJobOfferingData(userResult: any): JobOfferingData[] {
  if (!userResult.candidateProfile?.jobOfferings) return [];
  
  return userResult.candidateProfile.jobOfferings.map((offering: any) => ({
    _id: offering._id?.toString() || '',
    job: {
      _id: offering.job._id?.toString() || '',
      title: offering.job.title || '',
      company: offering.job.company || '',
      location: offering.job.location || '',
      jobType: offering.job.jobType || '',
      salary: {
        min: offering.job.salary?.min,
        max: offering.job.salary?.max,
        currency: offering.job.salary?.currency || 'USD'
      },
      description: offering.job.description || '',
      requirements: offering.job.requirements || '',
      skills: offering.job.skills || [],
      experience: offering.job.experience || ''
    },
    recruiter: {
      _id: offering.recruiter._id?.toString() || '',
      name: offering.recruiter.name || '',
      recruiterProfile: offering.recruiter.recruiterProfile
    },
    offeredAt: offering.offeredAt ? new Date(offering.offeredAt).toISOString() : new Date().toISOString(),
    status: offering.status || 'Pending',
    interviewLink: offering.interviewLink || undefined,
    message: offering.message || undefined
  }));
}

export default async function CandidateApplications() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  try {
    await connectDB();
    
    // Fixed: Use proper type assertion for the user result
    const userResult = await User.findById(session.user.id)
      .populate({
        path: 'candidateProfile.appliedJobs.job',
        populate: {
          path: 'postedBy',
          select: 'name recruiterProfile.company'
        }
      })
      .populate({
        path: 'candidateProfile.jobOfferings.job',
        select: 'title company location jobType salary description requirements skills experience'
      })
      .populate({
        path: 'candidateProfile.jobOfferings.recruiter',
        select: 'name recruiterProfile.company'
      })
      .lean()
      .exec() as UserResult | null;
    
    if (!userResult) {
      redirect('/login');
    }

    // Fixed: Safe access to accountType with proper type checking
    const accountType = userResult.accountType;
    
    // Redirect if not a candidate
    if (accountType !== 'candidate') {
      redirect('/dashboard/recruiter');
    }

    const applications = convertToApplicationData(userResult);
    const jobOfferings = convertToJobOfferingData(userResult);

    // Calculate statistics
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(app => app.status === 'Interview' || app.status === 'Hired').length;
    const hiredCount = applications.filter(app => app.status === 'Hired').length;
    const pendingOfferings = jobOfferings.filter(offer => offer.status === 'Pending').length;

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
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                    <p className="text-gray-600">Track your job applications and company offerings</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Applications</p>
                      <p className="text-xl font-bold text-gray-900">{totalApplications}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Accepted for Interview</p>
                      <p className="text-xl font-bold text-gray-900">{acceptedApplications}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hired</p>
                      <p className="text-xl font-bold text-gray-900">{hiredCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Job Offerings</p>
                      <p className="text-xl font-bold text-gray-900">{pendingOfferings}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Offerings Section */}
            {jobOfferings.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Gift className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900">Job Offerings from Companies</h2>
                    <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                      {pendingOfferings} Pending
                    </span>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {jobOfferings.map((offering) => (
                      <JobOfferingCard 
                        key={offering._id} 
                        offering={offering}
                        userId={session.user.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Applications Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">My Job Applications</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {totalApplications} Total
                </span>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <ApplicationCard 
                      key={application._id} 
                      application={application}
                      userId={session.user.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start applying to jobs to track your application progress here.
                  </p>
                  <Link
                    href="/dashboard/candidate#find-jobs"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
                  >
                    Find Jobs to Apply
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </>
    );

  } catch (error) {
    console.error('Applications page error:', error);
    redirect('/login');
  }
}
