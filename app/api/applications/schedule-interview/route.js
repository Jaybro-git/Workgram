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

    const { applicantId, candidateId, jobId, interviewLink, recruiterId } = await request.json();

    // Validate required fields
    if (!applicantId || !candidateId || !jobId || !interviewLink) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Update interview link and status in job's applicants array
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    const applicant = job.applicants.id(applicantId);
    if (!applicant) {
      return NextResponse.json({ message: 'Applicant not found' }, { status: 404 });
    }

    applicant.status = 'Interview';
    applicant.interviewLink = interviewLink;
    await job.save();

    // Update in candidate's applied jobs
    const candidate = await User.findById(candidateId);
    if (candidate && candidate.candidateProfile?.appliedJobs) {
      const appliedJob = candidate.candidateProfile.appliedJobs.find(
        app => app.job.toString() === jobId
      );
      if (appliedJob) {
        appliedJob.status = 'Interview';
        appliedJob.interviewLink = interviewLink;
        await candidate.save();
      }
    }

    // Return updated status and interviewLink
    return NextResponse.json({
      message: 'Interview scheduled successfully',
      status: applicant.status,
      interviewLink: applicant.interviewLink
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
