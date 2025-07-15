import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.accountType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { experience, skills, cvLink } = body;

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update candidate-specific fields
    if (experience !== undefined) user.candidateProfile.experience = experience;
    if (skills !== undefined) user.candidateProfile.skills = skills;
    if (cvLink !== undefined) user.candidateProfile.cvLink = cvLink;

    // Update profile completion status
    user.profileComplete = user.isProfileComplete();
    
    await user.save();

    return NextResponse.json({ 
      message: 'Candidate profile updated successfully',
      profileComplete: user.profileComplete,
      profileCompletionPercentage: user.profileCompletionPercentage
    });

  } catch (error) {
    console.error('Candidate profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
