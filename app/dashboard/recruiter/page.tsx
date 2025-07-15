import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  FileText, 
  AlertCircle, 
  CalendarCheck, 
  CheckCircle
} from 'lucide-react';
import Navbar from '@/app/components/Navbarlog';
import Footer from '@/app/components/Footer';
import ContactUs from '@/app/components/ContactUs';
import User from '@/models/User';
import Job from '@/models/Job';
import connectDB from '@/lib/mongodb';

// Properly typed interfaces
interface Applicant {
  candidate: string;
  appliedAt: string;
  status: string;
  _id: string;
  interviewLink?: string;
}

interface PostedJob {
  _id: string;
  title: string;
  company: string;
  applicants?: Applicant[];
  isActive: boolean;
  postedBy: string;
  location?: string;
  jobType?: string;
  createdAt?: string;
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
  recruiterProfile?: {
    company?: string | null;
    position?: string | null;
    industry?: string | null;
    postedJobs: string[];
  };
}

interface ActionItem {
  icon: React.ReactElement;
  title: string;
  description: string;
  href: string;
}

interface StatItem {
  icon: React.ReactElement;
  title: string;
  value: string;
  description: string;
}

// Safe conversion functions
function convertToUserData(userResult: any): UserData {
  return {
    _id: userResult._id?.toString() || '',
    name: userResult.name || '',
    email: userResult.email || '',
    accountType: userResult.accountType || 'recruiter',
    phone: userResult.phone ?? null,
    location: userResult.location ?? null,
    profileImage: userResult.profileImage ?? null,
    bio: userResult.bio ?? null,
    profileComplete: Boolean(userResult.profileComplete),
    recruiterProfile: userResult.recruiterProfile ? {
      company: userResult.recruiterProfile.company ?? null,
      position: userResult.recruiterProfile.position ?? null,
      industry: userResult.recruiterProfile.industry ?? null,
      postedJobs: Array.isArray(userResult.recruiterProfile.postedJobs)
        ? userResult.recruiterProfile.postedJobs.map((job: any) => 
            job?.toString() || job
          )
        : []
    } : undefined
  };
}

function convertToPostedJobs(mongoJobs: any[]): PostedJob[] {
  return mongoJobs.map((job: any) => ({
    _id: job._id?.toString() || '',
    title: job.title || 'Untitled Job',
    company: job.company || 'Unknown Company',
    applicants: Array.isArray(job.applicants) 
      ? job.applicants.map((applicant: any) => ({
          candidate: applicant.candidate?.toString() || '',
          appliedAt: applicant.appliedAt 
            ? new Date(applicant.appliedAt).toISOString() 
            : new Date().toISOString(),
          status: applicant.status || 'Applied',
          _id: applicant._id?.toString() || '',
          interviewLink: applicant.interviewLink || undefined
        }))
      : [],
    isActive: Boolean(job.isActive),
    postedBy: job.postedBy?.toString() || '',
    location: job.location || undefined,
    jobType: job.jobType || undefined,
    createdAt: job.createdAt 
      ? new Date(job.createdAt).toISOString() 
      : new Date().toISOString()
  }));
}

function calculateProfileCompletion(userData: UserData): { percentage: number; incomplete: boolean } {
  const basicFields: (keyof UserData)[] = ['name', 'phone', 'location', 'bio'];
  let completedFields = 0;
  
  basicFields.forEach((field: keyof UserData) => {
    const value = userData[field];
    if (value && String(value).trim() !== '') {
      completedFields++;
    }
  });
  
  let profileCompletionPercentage = 0;
  
  if (userData.recruiterProfile) {
    if (userData.recruiterProfile.company && userData.recruiterProfile.company.trim() !== '') {
      completedFields++;
    }
    if (userData.recruiterProfile.position && userData.recruiterProfile.position.trim() !== '') {
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

export default async function RecruiterDashboard() {
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
    
    // Redirect if not a recruiter
    if (userData.accountType !== 'recruiter') {
      redirect('/dashboard/candidate');
    }

    // Calculate profile completion
    const { percentage: profileCompletionPercentage, incomplete: profileIncomplete } = calculateProfileCompletion(userData);

    // Fetch posted jobs with proper type conversion
    const jobsResult = await Job.find({ 
      postedBy: session.user.id, 
      isActive: true 
    })
    .lean()
    .exec();

    const postedJobs: PostedJob[] = convertToPostedJobs(jobsResult);

    // Calculate real statistics with proper typing
    const totalApplicants = postedJobs.reduce(
      (sum: number, job: PostedJob) => sum + (job.applicants?.length ?? 0),
      0
    );
    
    const interviewCount = postedJobs.reduce(
      (sum: number, job: PostedJob) =>
        sum + (job.applicants?.filter((app: Applicant) => app.status === 'Interview').length ?? 0),
      0
    );
    
    const hiredCount = postedJobs.reduce(
      (sum: number, job: PostedJob) =>
        sum + (job.applicants?.filter((app: Applicant) => app.status === 'Hired').length ?? 0),
      0
    );

    const reviewingCount = postedJobs.reduce(
      (sum: number, job: PostedJob) =>
        sum + (job.applicants?.filter((app: Applicant) => app.status === 'Reviewing').length ?? 0),
      0
    );

    // Recruiter action items
    const recruiterActions: ActionItem[] = [
      {
        icon: <Briefcase className="w-7 h-7 text-blue-600" />,
        title: 'Post a Job',
        description: 'Attract top candidates with detailed job listings.',
        href: '/recruiter/post-job',
      },
      {
        icon: <Users className="w-7 h-7 text-blue-600" />,
        title: 'Browse Talent',
        description: 'Explore verified profiles and reach out instantly.',
        href: '/recruiter/browse',
      },
      {
        icon: <FileText className="w-7 h-7 text-blue-600" />,
        title: 'Manage Applicants',
        description: 'Track progress, schedule interviews, and shortlist.',
        href: '/recruiter/applicants',
      },
    ];

    // Recruiter statistics with real data
    const recruiterStats: StatItem[] = [
      {
        icon: <FileText className="w-8 h-8 text-blue-600 mx-auto" />,
        title: 'Jobs Posted',
        value: postedJobs.length.toString(),
        description: 'Total active listings',
      },
      {
        icon: <Users className="w-8 h-8 text-blue-600 mx-auto" />,
        title: 'Total Applicants',
        value: totalApplicants.toString(),
        description: 'Applications received',
      },
      {
        icon: <CalendarCheck className="w-8 h-8 text-blue-600 mx-auto" />,
        title: 'Interviews Scheduled',
        value: interviewCount.toString(),
        description: 'Candidates in interview stage',
      },
      {
        icon: <CheckCircle className="w-8 h-8 text-blue-600 mx-auto" />,
        title: 'Hired',
        value: hiredCount.toString(),
        description: 'Successfully hired candidates',
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
                    Your profile is {profileCompletionPercentage}% complete. Complete it to start hiring with full access.
                  </p>
                </div>
                <Link
                  href="/recruiter/profile/edit"
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
                  </span> Recruiter Hub
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mb-8">
                Find, connect, and hire exceptional talent with ease. Discover top talent, manage applications, and streamline your hiring process.
              </p>
              
              <div className="flex flex-wrap justify-start gap-6 mb-20">
                {recruiterActions.map((action: ActionItem) => (
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
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Hiring Overview Section */}
        <section className="py-20 px-6 bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
                Hiring <span className="text-blue-700">Overview</span>
              </h2>
              <p className="mt-2 text-lg text-gray-700 max-w-2xl">
                Track your current progress and stay updated with key recruitment metrics.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4 text-center">
              {recruiterStats.map((stat: StatItem) => (
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

            {/* Quick Actions Section */}
            {postedJobs.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Recent Jobs */}
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Recent Jobs</h4>
                    </div>
                    <div className="space-y-3">
                      {postedJobs.slice(0, postedJobs.length).map((job: PostedJob) => (
                        <div key={job._id} className="bg-white rounded-lg p-3 border border-blue-200">
                          <h5 className="font-medium text-gray-900 text-sm">{job.title}</h5>
                          <p className="text-xs text-gray-600">{job.applicants?.length || 0} applicants</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/recruiter/applicants"
                      className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                      View All Applications
                    </Link>
                  </div>

                  {/* Pending Reviews */}
                  <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-900">Pending Reviews</h4>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-700 mb-2">
                        {postedJobs.reduce((sum, job) => 
                          sum + (job.applicants?.filter(app => app.status === 'Applied').length || 0), 0
                        )}
                      </div>
                      <p className="text-yellow-700 text-sm mb-4">Applications need review</p>
                      <Link
                        href="/recruiter/applicants"
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition"
                      >
                        Review Now
                      </Link>
                    </div>
                  </div>

                  {/* Upcoming Interviews */}
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <CalendarCheck className="w-6 h-6 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">Upcoming Interviews</h4>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-700 mb-2">{interviewCount}</div>
                      <p className="text-purple-700 text-sm mb-4">Interviews scheduled</p>
                      <Link
                        href="/recruiter/applicants"
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
                      >
                        Manage Interviews
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Empty State for New Recruiters */}
            {postedJobs.length === 0 && (
              <div className="mt-16 text-center">
                <div className="bg-gray-50 rounded-2xl p-12 border border-gray-200">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start Hiring?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Post your first job listing to start attracting top talent and building your team.
                  </p>
                  <Link
                    href="/recruiter/post-job"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition inline-flex items-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    Post Your First Job
                  </Link>
                </div>
              </div>
            )}

          </div>
        </section>

        <ContactUs />
        <Footer />
      </>
    );

  } catch (error) {
    console.error('Recruiter dashboard error:', error);
    redirect('/login');
  }
}