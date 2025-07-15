import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skills = searchParams.get('skills');

    if (!skills) {
      return NextResponse.json({ error: 'Skills parameter is required' }, { status: 400 });
    }

    await connectDB();

    // Search candidates by skills (case-insensitive)
    const candidates = await User.find({
      accountType: 'candidate',
      'candidateProfile.skills': { $regex: skills, $options: 'i' },
      'candidateProfile.experience': { $ne: null },
      'candidateProfile.skills.0': { $exists: true }
    })
    .select('name email phone location profileImage bio candidateProfile')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    // Convert MongoDB documents to plain objects
    const convertedCandidates = candidates.map(candidate => ({
      _id: candidate._id.toString(),
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location,
      profileImage: candidate.profileImage,
      bio: candidate.bio,
      candidateProfile: {
        experience: candidate.candidateProfile?.experience,
        skills: candidate.candidateProfile?.skills || [],
        cvLink: candidate.candidateProfile?.cvLink
      }
    }));

    return NextResponse.json({ candidates: convertedCandidates });

  } catch (error) {
    console.error('Candidate search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
