import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json({ error: 'Title parameter is required' }, { status: 400 });
    }

    await connectDB();

    // Search jobs by title (case-insensitive)
    const jobs = await Job.find({
      isActive: true,
      title: { $regex: title, $options: 'i' }
    })
    .populate('postedBy', 'name recruiterProfile.company')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    // Convert MongoDB documents to plain objects
    const convertedJobs = jobs.map(job => ({
      _id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      salary: {
        min: job.salary?.min,
        max: job.salary?.max,
        currency: job.salary?.currency || 'USD'
      },
      description: job.description,
      requirements: job.requirements,
      skills: job.skills || [],
      experience: job.experience,
      postedBy: {
        _id: job.postedBy._id.toString(),
        name: job.postedBy.name,
        recruiterProfile: job.postedBy.recruiterProfile
      },
      applicants: job.applicants || [],
      isActive: job.isActive,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }));

    return NextResponse.json({ jobs: convertedJobs });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
