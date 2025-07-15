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

    const body = await request.json();
    const {
      title,
      company,
      location,
      jobType,
      salary,
      description,
      requirements,
      skills,
      experience
    } = body;

    // Validate required fields
    if (!title || !company || !location || !jobType || !description || !requirements || !experience) {
      return NextResponse.json({ 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    await connectDB();

    // Check if user exists and is a recruiter
    const user = await User.findById(session.user.id);
    if (!user || user.accountType !== 'recruiter') {
      return NextResponse.json({ 
        message: 'Only recruiters can post jobs' 
      }, { status: 403 });
    }

    // Create the job
    const job = await Job.create({
      title,
      company,
      location,
      jobType,
      salary: {
        min: salary?.min || undefined,
        max: salary?.max || undefined,
        currency: salary?.currency || 'USD'
      },
      description,
      requirements,
      skills: skills || [],
      experience,
      postedBy: session.user.id,
      isActive: true
    });

    // Add job to user's posted jobs
    if (!user.recruiterProfile) {
      user.recruiterProfile = { postedJobs: [] };
    }
    if (!user.recruiterProfile.postedJobs) {
      user.recruiterProfile.postedJobs = [];
    }
    
    user.recruiterProfile.postedJobs.push(job._id);
    await user.save();

    return NextResponse.json({ 
      message: 'Job posted successfully',
      jobId: job._id
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
