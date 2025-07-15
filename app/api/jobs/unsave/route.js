import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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

    // Remove job from saved jobs
    if (user.candidateProfile?.savedJobs) {
      user.candidateProfile.savedJobs = user.candidateProfile.savedJobs.filter(
        savedJobId => savedJobId.toString() !== jobId
      );
      await user.save();
    }

    return NextResponse.json({ message: 'Job removed from saved jobs' });

  } catch (error) {
    console.error('Error unsaving job:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
