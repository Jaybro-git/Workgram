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

    const { offeringId, userId, response } = await request.json();

    if (!offeringId || !userId || !response) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!['Accepted', 'Rejected'].includes(response)) {
      return NextResponse.json({ message: 'Invalid response' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user || user.accountType !== 'candidate') {
      return NextResponse.json({ message: 'Invalid candidate' }, { status: 400 });
    }

    const offering = user.candidateProfile.jobOfferings.id(offeringId);
    if (!offering) {
      return NextResponse.json({ message: 'Job offering not found' }, { status: 404 });
    }

    offering.status = response;
    await user.save();

    return NextResponse.json({
      message: `Job offering ${response.toLowerCase()} successfully`
    });

  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
