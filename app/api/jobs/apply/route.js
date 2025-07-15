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

    // Check if already applied
    const alreadyApplied = user.candidateProfile?.appliedJobs?.some(
      app => app.job.toString() === jobId
    );

    if (alreadyApplied) {
      return NextResponse.json({ message: 'Already applied to this job' }, { status: 400 });
    }

    // Add application to user's applied jobs
    if (!user.candidateProfile) {
      user.candidateProfile = { appliedJobs: [], savedJobs: [] };
    }
    if (!user.candidateProfile.appliedJobs) {
      user.candidateProfile.appliedJobs = [];
    }

    user.candidateProfile.appliedJobs.push({
      job: jobId,
      appliedAt: new Date(),
      status: 'Applied'
    });

    // Add applicant to job's applicants list
    if (!job.applicants) {
      job.applicants = [];
    }

    job.applicants.push({
      candidate: userId,
      appliedAt: new Date(),
      status: 'Applied'
    });

    // Save both documents
    await Promise.all([user.save(), job.save()]);

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      applicationId: user.candidateProfile.appliedJobs[user.candidateProfile.appliedJobs.length - 1]._id
    });

  } catch (error) {
    console.error('Error applying for job:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
