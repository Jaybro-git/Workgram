import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, userId } = await request.json();

    if (!jobId || !userId) {
      return NextResponse.json({ message: 'Job ID and User ID are required' }, { status: 400 });
    }

    await connectDB();

    // Check if user exists and is a candidate
    const user = await User.findById(userId);
    if (!user || user.accountType !== 'candidate') {
      return NextResponse.json({ message: 'Invalid candidate' }, { status: 400 });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return NextResponse.json({ message: 'Job not found or inactive' }, { status: 404 });
    }

    // Check if already saved
    const alreadySaved = user.candidateProfile?.savedJobs?.includes(jobId);
    if (alreadySaved) {
      return NextResponse.json({ message: 'Job already saved' }, { status: 400 });
    }

    // Add job to saved jobs
    if (!user.candidateProfile) {
      user.candidateProfile = { savedJobs: [], appliedJobs: [] };
    }
    if (!user.candidateProfile.savedJobs) {
      user.candidateProfile.savedJobs = [];
    }

    user.candidateProfile.savedJobs.push(jobId);
    await user.save();

    return NextResponse.json({ message: 'Job saved successfully' });

  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
