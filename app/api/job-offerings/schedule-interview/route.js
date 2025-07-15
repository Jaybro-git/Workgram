import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { applicantId, candidateId, interviewLink } = await req.json();

    if (!applicantId || !candidateId || !interviewLink || !interviewLink.trim()) {
      return NextResponse.json({ message: 'Missing required fields or interview link' }, { status: 400 });
    }

    await connectDB();

    const candidate = await User.findById(candidateId);
    if (!candidate || !candidate.candidateProfile || !candidate.candidateProfile.jobOfferings) {
      return NextResponse.json({ message: 'Candidate not found or invalid profile' }, { status: 404 });
    }

    const offering = candidate.candidateProfile.jobOfferings.id(applicantId);
    if (!offering) {
      return NextResponse.json({ message: 'Offering not found' }, { status: 404 });
    }

    offering.status = 'Interview';
    offering.interviewLink = interviewLink.trim();
    await candidate.save();

    return NextResponse.json({ message: 'Interview scheduled', data: {
      applicantId,
      candidateId,
      status: 'Interview',
      interviewLink: offering.interviewLink
    }});
  } catch (e) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
