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

    const { candidateId, jobId, message } = await request.json();

    if (!candidateId || !jobId) {
      return NextResponse.json({ message: 'Candidate ID and Job ID are required' }, { status: 400 });
    }

    await connectDB();

    // Verify recruiter
    const recruiter = await User.findById(session.user.id);
    if (!recruiter || recruiter.accountType !== 'recruiter') {
      return NextResponse.json({ message: 'Only recruiters can offer jobs' }, { status: 403 });
    }

    // Verify candidate
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.accountType !== 'candidate') {
      return NextResponse.json({ message: 'Invalid candidate' }, { status: 400 });
    }

    // Verify job
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return NextResponse.json({ message: 'Job not found or inactive' }, { status: 404 });
    }

    // Check if offering already exists
    const existingOffering = candidate.candidateProfile?.jobOfferings?.find(
      offering => offering.job.toString() === jobId && offering.recruiter.toString() === session.user.id
    );

    if (existingOffering) {
      return NextResponse.json({ message: 'Job already offered to this candidate' }, { status: 400 });
    }

    // Add job offering to candidate
    if (!candidate.candidateProfile) {
      candidate.candidateProfile = { jobOfferings: [], appliedJobs: [], savedJobs: [] };
    }
    if (!candidate.candidateProfile.jobOfferings) {
      candidate.candidateProfile.jobOfferings = [];
    }

    candidate.candidateProfile.jobOfferings.push({
      job: jobId,
      recruiter: session.user.id,
      offeredAt: new Date(),
      status: 'Pending',
      message: message || null
    });

    await candidate.save();

    return NextResponse.json({ 
      message: 'Job offering sent successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating job offering:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
