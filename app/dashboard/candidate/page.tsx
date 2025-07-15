import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  AlertCircle, 
  Search,
  BookmarkPlus,
  CheckCircle,
  Users,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import Navbar from '@/app/components/Navbarlog';
import Footer from '@/app/components/Footer';
import ContactUs from '@/app/components/ContactUs';
import User from '@/models/User';
import Job from '@/models/Job';
import connectDB from '@/lib/mongodb';
import JobCard from '@/app/components/JobCard';
import SmoothScrollLink from '@/app/components/SmoothScrollLink';
import JobSearchSection from '@/app/components/JobSearchSection';

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
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  profileComplete: boolean;
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

interface ActionItem {
  icon: React.ReactElement;
  title: string;
  description: string;
  href: string;
  scroll?: boolean;
}

interface StatItem {
  icon: React.ReactElement;
  title: string;
  value: string;
  description: string;
}

// Candidate-specific conversion functions
function convertToUserData(userResult: any): UserData {
  return {
    _id: userResult._id?.toString() || '',
    name: userResult.name || '',
    email: userResult.email || '',
    accountType: userResult.accountType || 'candidate',
    phone: userResult.phone ?? null,
    location: userResult.location ?? null,
    profileImage: userResult.profileImage ?? null,
    bio: userResult.bio ?? null,
    profileComplete: Boolean(userResult.profileComplete),
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

function calculateProfileCompletion(userData: UserData): { percentage: number; incomplete: boolean } {
  const basicFields: (keyof UserData)[] = ['name', 'phone', 'location', 'bio'];
  let completedFields = 0;
  
  basicFields.forEach(field => {
    const value = userData[field];
    if (value && String(value).trim() !== '') {
      completedFields++;
    }
  });
  
  let profileCompletionPercentage = 0;
  
  if (userData.candidateProfile) {
    if (userData.candidateProfile.experience && userData.candidateProfile.experience.trim() !== '') {
      completedFields++;
    }
    if (userData.candidateProfile.skills && userData.candidateProfile.skills.length > 0) {
      completedFields++;
    }
    const totalFields = basicFields.length + 2;
    profileCompletionPercentage = Math.round((completedFields / totalFields) * 100);
  } else {
    profileCompletionPercentage = Math.round((completedFields / basicFields.length) * 100);
  }
  
  return {
    percentage: profileCompletionPercentage,
    incomplete: profileCompletionPercentage < 100
  };
}

export default async function CandidateDashboard() {
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

    // Calculate profile completion
    const { percentage: profileCompletionPercentage, incomplete: profileIncomplete } = calculateProfileCompletion(userData);

    // Fetch LATEST 6 jobs for candidates
    const jobsResult = await Job.find({ isActive: true })
      .populate('postedBy', 'name recruiterProfile.company')
      .sort({ createdAt: -1 })
      .limit(6) // Limit to 6 jobs
      .lean()
      .exec();
    
    const jobs: JobData[] = jobsResult.map(convertToJobData);

    const appliedJobIds = userData.candidateProfile?.appliedJobs 
      ? userData.candidateProfile.appliedJobs.map(app => app.job)
      : [];

    const savedJobIds = userData.candidateProfile?.savedJobs || [];

    // Candidate action items
    const candidateActions: ActionItem[] = [
      {
        icon: <Search className="w-7 h-7 text-blue-600" />,
        title: 'Find Jobs',
        description: 'Discover opportunities that match your skills.',
        href: '#find-jobs',
        scroll: true,
      },
      {
        icon: <FileText className="w-7 h-7 text-blue-600" />,
        title: 'My Applications',
        description: 'Track your job applications and their status.',
        href: '/candidate/applications',
      },
      {
        icon: <BookmarkPlus className="w-7 h-7 text-blue-600" />,
        title: 'Saved Jobs',
        description: 'View jobs you\'ve bookmarked for later.',
        href: '/candidate/saved',
      },
    ];

 // In your candidate dashboard, update the candidateStats array:
const candidateStats: StatItem[] = [
  {
    icon: <FileText className="w-8 h-8 text-blue-600 mx-auto" />,
    title: 'Applications',
    value: (userData.candidateProfile?.appliedJobs?.length || 0).toString(),
    description: 'Total applications sent',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />,
    title: 'Accepted for Interview',
    value: (userData.candidateProfile?.appliedJobs?.filter(app => app.status === 'Interview').length || 0).toString(),
    description: 'Applications accepted',
  },
  {
    icon: <BookmarkPlus className="w-8 h-8 text-blue-600 mx-auto" />,
    title: 'Saved Jobs',
    value: (userData.candidateProfile?.savedJobs?.length || 0).toString(),
    description: 'Jobs in your wishlist',
  },
  {
    icon: <Users className="w-8 h-8 text-purple-600 mx-auto" />,
    title: 'Hired',
    value: (userData.candidateProfile?.appliedJobs?.filter(app => app.status === 'Hired').length || 0).toString(),
    description: 'Successfully hired',
  },
];


    return (
      <>
        <Navbar />

        <main className="bg-blue-50 min-h-screen px-6">
          <div className="max-w-7xl mx-auto">

            {/* Profile completion banner */}
            {profileIncomplete && (
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-7xl bg-yellow-100 border border-yellow-300 text-yellow-900 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm z-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm md:text-base font-medium">
                    Your profile is {profileCompletionPercentage}% complete. Complete it to get better job matches with full access.
                  </p>
                </div>
                <Link
                  href="/candidate/profile/edit"
                  className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-600 transition"
                >
                  Complete Profile
                </Link>
              </div>
            )}

            {/* Hero Section */}
            <section className="min-h-screen pt-15 flex flex-col justify-center bg-blue-50 text-left px-6 md:px-12 lg:px-5">
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 max-w-6xl">
                Welcome to <span className="text-blue-600">WorkGram<br />
                  </span> Career Center
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mb-8">
                Discover your next career opportunity. Find jobs that match your skills, connect with top employers, and advance your career.
              </p>
              
              <div className="flex flex-wrap justify-start gap-6 mb-20">
                {candidateActions.map((action) => (
                  action.scroll ? (
                    <SmoothScrollLink
                      key={action.title}
                      targetId="find-jobs"
                      className="w-[300px] bg-white border border-gray-200 rounded-2xl p-6 shadow hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </SmoothScrollLink>
                  ) : (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="w-[300px] bg-white border border-gray-200 rounded-2xl p-6 shadow hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </Link>
                  )
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Find Jobs Section with Search */}
        <JobSearchSection 
          initialJobs={jobs}
          appliedJobIds={appliedJobIds}
          savedJobIds={savedJobIds}
          userId={session.user.id}
        />

        {/* Career Overview Section */}
        <section className="py-20 px-6 bg-blue-50 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
                Career <span className="text-blue-700">Overview</span>
              </h2>
              <p className="mt-2 text-lg text-gray-700 max-w-2xl">
                Monitor your job search progress and career development metrics.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4 text-center">
              {candidateStats.map((stat) => (
                <div
                  key={stat.title}
                  className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                >
                  <div className="mb-3">{stat.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{stat.title}</h3>
                  <div className="text-3xl font-bold text-blue-700 my-2">{stat.value}</div>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContactUs />
        <Footer />
      </>
    );

  } catch (error) {
    console.error('Candidate dashboard error:', error);
    redirect('/login');
  }
}
