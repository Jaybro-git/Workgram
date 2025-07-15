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

    const { applicantId, candidateId, jobId, status, recruiterId, interviewLink } = await request.json();
    if (!applicantId || !candidateId || !jobId || !status) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Update in Job.applicants
    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 });

    const applicant = job.applicants.id(applicantId);
    if (!applicant) return NextResponse.json({ message: 'Applicant not found' }, { status: 404 });

    applicant.status = status;
    if (typeof interviewLink === 'string') {
      applicant.interviewLink = interviewLink;
    }
    await job.save();

    // Update in User.candidateProfile.appliedJobs
    const candidate = await User.findById(candidateId);
    if (candidate && candidate.candidateProfile?.appliedJobs) {
      const appliedJob = candidate.candidateProfile.appliedJobs.find(
        app => app.job.toString() === jobId
      );
      if (appliedJob) {
        appliedJob.status = status;
        if (typeof interviewLink === 'string') {
          appliedJob.interviewLink = interviewLink;
        }
        await candidate.save();
      }
    }

    // If hired, mark job as inactive
    if (status === 'Hired') {
      job.isActive = false;
      await job.save();
    }

    // Return updated status and interviewLink
    return NextResponse.json({
      message: 'Status and interview link updated successfully',
      status: applicant.status,
      interviewLink: applicant.interviewLink
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
