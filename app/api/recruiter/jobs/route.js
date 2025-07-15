import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get recruiter's posted jobs
    const user = await User.findById(session.user.id).select('recruiterProfile.postedJobs');
    if (!user || !user.recruiterProfile?.postedJobs) {
      return NextResponse.json({ jobs: [] });
    }

    const jobs = await Job.find({
      _id: { $in: user.recruiterProfile.postedJobs },
      isActive: true
    })
    .select('title company location jobType')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    const convertedJobs = jobs.map(job => ({
      _id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType
    }));

    return NextResponse.json({ jobs: convertedJobs });

  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
