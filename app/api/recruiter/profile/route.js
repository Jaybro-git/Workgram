import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.accountType !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { company, position, industry } = body;

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update recruiter-specific fields
    if (company !== undefined) user.recruiterProfile.company = company;
    if (position !== undefined) user.recruiterProfile.position = position;
    if (industry !== undefined) user.recruiterProfile.industry = industry;

    // Update profile completion status
    user.profileComplete = user.isProfileComplete();
    
    await user.save();

    return NextResponse.json({ 
      message: 'Recruiter profile updated successfully',
      profileComplete: user.profileComplete,
      profileCompletionPercentage: user.profileCompletionPercentage
    });

  } catch (error) {
    console.error('Recruiter profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
