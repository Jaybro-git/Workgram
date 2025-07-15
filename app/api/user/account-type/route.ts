import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// Define interface for the expected result
interface UserAccountType {
  _id: string;
  accountType: 'candidate' | 'recruiter';
}

export async function GET() {
  try {
    // Get the current session
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' }, 
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();
    
    // Query user with proper typing
    const userData = await User.findById(session.user.id)
      .select('accountType')
      .lean()
      .exec() as UserAccountType | null;
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Validate accountType exists
    if (!userData.accountType) {
      return NextResponse.json(
        { error: 'Account type not found' }, 
        { status: 400 }
      );
    }

    // Return the account type
    return NextResponse.json({ 
      accountType: userData.accountType,
      userId: userData._id 
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}
