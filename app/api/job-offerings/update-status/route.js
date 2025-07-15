import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import JobModel from '@/models/Job';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { offeringId, candidateId, recruiterId, status, interviewLink } = await request.json();

    if (!offeringId || !candidateId || !status) {
      return NextResponse.json({
        message: 'Missing required fields: offeringId, candidateId, and status are required'
      }, { status: 400 });
    }

    if (recruiterId && recruiterId !== session.user.id) {
      return NextResponse.json({
        message: 'Recruiter ID mismatch'
      }, { status: 403 });
    }

    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Interview', 'Hired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    if (status === 'Interview' && (!interviewLink || !interviewLink.trim())) {
      return NextResponse.json({
        message: 'Interview link is required when setting status to Interview'
      }, { status: 400 });
    }

    await connectDB();

    const recruiter = await User.findById(session.user.id);
    if (!recruiter || recruiter.accountType !== 'recruiter') {
      return NextResponse.json({
        message: 'Only recruiters can update job offerings'
      }, { status: 403 });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.accountType !== 'candidate' || !candidate.candidateProfile || !candidate.candidateProfile.jobOfferings) {
      return NextResponse.json({
        message: 'Candidate not found or invalid profile'
      }, { status: 404 });
    }

    const offering = candidate.candidateProfile.jobOfferings.id(offeringId);
    if (!offering) {
      return NextResponse.json({
        message: 'Job offering not found'
      }, { status: 404 });
    }

    if (offering.recruiter.toString() !== session.user.id) {
      return NextResponse.json({
        message: 'Unauthorized to update this offering'
      }, { status: 403 });
    }

    offering.status = status;
    if (status === 'Interview' && interviewLink && interviewLink.trim()) {
      offering.interviewLink = interviewLink.trim();
    } else if (status !== 'Interview') {
      offering.interviewLink = undefined;
    }

    await candidate.save();

    if (status === 'Hired') {
      await JobModel.findByIdAndUpdate(offering.job, { isActive: false });
    }

    return NextResponse.json({
      message: `Job offering status updated to ${status}`,
      data: {
        offeringId,
        candidateId,
        status,
        interviewLink: offering.interviewLink
      }
    });

  } catch (error) {
    return NextResponse.json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
