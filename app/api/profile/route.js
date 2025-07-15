import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import UserModel from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, phone, location, bio, profileImage } = body;

    const user = await UserModel.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Current user data:', {
      name: user.name,
      email: user.email,
      accountType: user.accountType
    });

    // Update basic profile fields - handle empty strings properly
    if (name !== undefined && name.trim() !== '') user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim() || null;
    if (location !== undefined) user.location = location.trim() || null;
    if (bio !== undefined) user.bio = bio.trim() || null;
    if (profileImage !== undefined) user.profileImage = profileImage.trim() || null;

    // Initialize profile subdocuments if they don't exist
    if (user.accountType === 'candidate' && !user.candidateProfile) {
      user.candidateProfile = {
        experience: null,
        skills: [],
        cvLink: null,
      };
    }

    if (user.accountType === 'recruiter' && !user.recruiterProfile) {
      user.recruiterProfile = {
        company: null,
        position: null,
        industry: null,
      };
    }

    // Safely update profile completion status
    try {
      const isComplete = user.isProfileComplete();
      console.log('Profile completion result:', isComplete, typeof isComplete);
      
      // Ensure we're setting a boolean value
      user.profileComplete = Boolean(isComplete);
    } catch (completionError) {
      console.error('Error checking profile completion:', completionError);
      user.profileComplete = false; // Safe fallback
    }
    
    console.log('About to save user:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      profileComplete: user.profileComplete,
      profileCompleteType: typeof user.profileComplete
    });

    await user.save();

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profileComplete: user.profileComplete,
      profileCompletionPercentage: user.profileCompletionPercentage || 0
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Enhanced error logging for validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value,
        type: typeof error.errors[key].value
      }));
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await UserModel.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user.toObject(),
        profileCompletionPercentage: user.profileCompletionPercentage || 0
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
