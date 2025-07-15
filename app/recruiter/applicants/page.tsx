import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  Clock,
  CheckCircle,
  Calendar,
  FileText,
  Gift,
} from 'lucide-react';
import Navbar from '@/app/components/Navbarlog';
import Footer from '@/app/components/Footer';
import User from '@/models/User';
import Job from '@/models/Job';
import connectDB from '@/lib/mongodb';
import ApplicantCard from '@/app/components/ApplicantCard';
import JobOfferCard from '@/app/components/JobOfferCard';

// --- Types ---
export type OfferStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Interview' | 'Hired';

interface ApplicantData {
  _id: string;
  candidate: {
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
  };
  job: {
    _id: string;
    title: string;
    company: string;
  };
  appliedAt: string;
  status: string;
  interviewLink?: string;
}

interface JobOfferingData {
  _id: string;
  candidate: {
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
  };
  job: {
    _id: string;
    title: string;
    company: string;
  };
  offeredAt: string;
  status: OfferStatus;
  interviewLink?: string;
  message?: string;
}

interface UserAccountData {
  _id: string;
  accountType: 'candidate' | 'recruiter';
  recruiterProfile?: {
    company?: string;
    position?: string;
    industry?: string;
    postedJobs: string[];
  };
}

// --- Utility Functions ---
const validOfferStatuses: OfferStatus[] = [
  'Pending', 'Accepted', 'Rejected', 'Interview', 'Hired'
];

function toOfferStatus(status: string): OfferStatus {
  return validOfferStatuses.includes(status as OfferStatus)
    ? (status as OfferStatus)
    : 'Pending';
}

function convertToApplicantData(jobsData: any[]): ApplicantData[] {
  const applicants: ApplicantData[] = [];
  jobsData.forEach(job => {
    if (job.applicants && Array.isArray(job.applicants)) {
      job.applicants.forEach((applicant: any) => {
        applicants.push({
          _id: applicant._id?.toString() || '',
          candidate: {
            _id: applicant.candidate._id?.toString() || '',
            name: applicant.candidate.name || '',
            email: applicant.candidate.email || '',
            phone: applicant.candidate.phone || undefined,
            location: applicant.candidate.location || undefined,
            profileImage: applicant.candidate.profileImage || undefined,
            bio: applicant.candidate.bio || undefined,
            candidateProfile: {
              experience: applicant.candidate.candidateProfile?.experience || undefined,
              skills: applicant.candidate.candidateProfile?.skills || [],
              cvLink: applicant.candidate.candidateProfile?.cvLink || undefined
            }
          },
          job: {
            _id: job._id?.toString() || '',
            title: job.title || '',
            company: job.company || ''
          },
          appliedAt: applicant.appliedAt ? new Date(applicant.appliedAt).toISOString() : new Date().toISOString(),
          status: applicant.status || 'Applied',
          interviewLink: applicant.interviewLink || undefined
        });
      });
    }
  });
  return applicants;
}

function convertToJobOfferingData(candidatesData: any[]): JobOfferingData[] {
  const offerings: JobOfferingData[] = [];
  candidatesData.forEach(candidate => {
    if (candidate.candidateProfile?.jobOfferings && Array.isArray(candidate.candidateProfile.jobOfferings)) {
      candidate.candidateProfile.jobOfferings.forEach((offering: any) => {
        offerings.push({
          _id: offering._id?.toString() || '',
          candidate: {
            _id: candidate._id?.toString() || '',
            name: candidate.name || '',
            email: candidate.email || '',
            phone: candidate.phone || undefined,
            location: candidate.location || undefined,
            profileImage: candidate.profileImage || undefined,
            bio: candidate.bio || undefined,
            candidateProfile: {
              experience: candidate.candidateProfile?.experience || undefined,
              skills: candidate.candidateProfile?.skills || [],
              cvLink: candidate.candidateProfile?.cvLink || undefined
            }
          },
          job: {
            _id: offering.job._id?.toString() || '',
            title: offering.job.title || '',
            company: offering.job.company || ''
          },
          offeredAt: offering.offeredAt ? new Date(offering.offeredAt).toISOString() : new Date().toISOString(),
          status: toOfferStatus(offering.status),
          interviewLink: offering.interviewLink || undefined,
          message: offering.message || undefined
        });
      });
    }
  });
  return offerings;
}

// --- Main Page Component ---
export default async function RecruiterApplicants() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  try {
    await connectDB();

    const userResult = await User.findById(session.user.id)
      .select('accountType recruiterProfile')
      .lean()
      .exec() as UserAccountData | null;

    if (!userResult) {
      redirect('/login');
    }

    const accountType = userResult.accountType;
    if (!accountType || accountType !== 'recruiter') {
      redirect('/dashboard/candidate');
    }

    // Fetch jobs posted by this recruiter with applicants
    const jobsData = await Job.find({ postedBy: session.user.id })
      .populate({
        path: 'applicants.candidate',
        select: 'name email phone location profileImage bio candidateProfile'
      })
      .lean()
      .exec();

    // Fetch candidates who received job offerings from this recruiter
    const candidatesData = await User.find({
      accountType: 'candidate',
      'candidateProfile.jobOfferings.recruiter': session.user.id
    })
      .populate({
        path: 'candidateProfile.jobOfferings.job',
        select: 'title company'
      })
      .select('name email phone location profileImage bio candidateProfile')
      .lean()
      .exec();

    const applicants = convertToApplicantData(jobsData);
    const jobOfferings = convertToJobOfferingData(candidatesData);

    // Calculate statistics
    const totalApplicants = applicants.length;
    const pendingApplications = applicants.filter(app => app.status === 'Applied' || app.status === 'Reviewing').length;
    const scheduledInterviews = applicants.filter(app => app.status === 'Interview').length;
    const hiredCandidates = applicants.filter(app => app.status === 'Hired').length;
    const acceptedOfferings = jobOfferings.filter(offer => offer.status === 'Accepted').length;

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
                    <h1 className="text-2xl font-bold text-gray-900">Manage Applicants</h1>
                    <p className="text-gray-600">Review applications and manage your hiring pipeline</p>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Applicants</p>
                      <p className="text-xl font-bold text-gray-900">{totalApplicants}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="text-xl font-bold text-gray-900">{pendingApplications}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Interviews</p>
                      <p className="text-xl font-bold text-gray-900">{scheduledInterviews}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hired</p>
                      <p className="text-xl font-bold text-gray-900">{hiredCandidates}</p>
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
                    <h2 className="text-xl font-bold text-gray-900">Job Offerings Sent</h2>
                    <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                      {acceptedOfferings} Accepted
                    </span>
                  </div>
                  <div className="space-y-4">
                    {jobOfferings.map((offering) => (
                      <JobOfferCard
                        key={`offering-${offering._id}`}
                        offer={offering}
                        recruiterId={session.user.id}
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
                <h2 className="text-xl font-bold text-gray-900">Job Applications</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {totalApplicants} Total
                </span>
              </div>
              {applicants.length > 0 ? (
                <div className="space-y-4">
                  {applicants.map((applicant) => (
                    <ApplicantCard
                      key={`application-${applicant._id}`}
                      applicant={applicant}
                      type="application"
                      recruiterId={session.user.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Once candidates apply to your job postings, they'll appear here for you to review.
                  </p>
                  <Link
                    href="/recruiter/post-job"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
                  >
                    Post a Job
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
    console.error('Recruiter applicants page error:', error);
    redirect('/login');
  }
}
