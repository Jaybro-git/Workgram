import mongoose from 'mongoose';

// Subdocument for applied jobs (candidate)
const AppliedJobSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'Reviewing', 'Interview', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  interviewLink: { type: String, default: null }
}, { _id: true });

// Subdocument for job offerings (candidate)
const JobOfferingSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  offeredAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Interview', 'Hired'],
    default: 'Pending'
  },
  interviewLink: { type: String, default: null },
  message: { type: String, default: null }
}, { _id: true });

// Candidate profile subdocument
const CandidateProfileSchema = new mongoose.Schema({
  experience: { type: String, default: null },
  skills: { type: [String], default: [] },
  cvLink: { type: String, default: null },
  appliedJobs: [AppliedJobSchema],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  jobOfferings: [JobOfferingSchema]
}, { _id: false });

// Recruiter profile subdocument
const RecruiterProfileSchema = new mongoose.Schema({
  company: { type: String, default: null },
  position: { type: String, default: null },
  industry: { type: String, default: null },
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, { _id: false });

// Main User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [1, 'Name cannot be empty'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'] },
  accountType: {
    type: String,
    enum: ['candidate', 'recruiter'],
    required: [true, 'Account type is required']
  },
  phone: { type: String, default: null, trim: true },
  location: { type: String, default: null, trim: true },
  profileImage: { type: String, default: null, trim: true },
  bio: { type: String, default: null, trim: true },
  profileComplete: { type: Boolean, default: false },
  candidateProfile: { type: CandidateProfileSchema, default: undefined },
  recruiterProfile: { type: RecruiterProfileSchema, default: undefined }
}, { timestamps: true });

// Virtual for profile completion percentage
UserSchema.virtual('profileCompletionPercentage').get(function() {
  const basicFields = ['name', 'phone', 'location', 'bio'];
  let completedFields = 0;
  basicFields.forEach(field => {
    if (this[field] && this[field].trim() !== '') completedFields++;
  });
  if (this.accountType === 'candidate') {
    const candidateFields = ['experience'];
    candidateFields.forEach(field => {
      if (this.candidateProfile && this.candidateProfile[field] && this.candidateProfile[field].trim() !== '') {
        completedFields++;
      }
    });
    if (this.candidateProfile && this.candidateProfile.skills && this.candidateProfile.skills.length > 0) {
      completedFields++;
    }
    const totalFields = basicFields.length + candidateFields.length + 1;
    return Math.round((completedFields / totalFields) * 100);
  } else if (this.accountType === 'recruiter') {
    const recruiterFields = ['company', 'position'];
    recruiterFields.forEach(field => {
      if (this.recruiterProfile && this.recruiterProfile[field] && this.recruiterProfile[field].trim() !== '') {
        completedFields++;
      }
    });
    const totalFields = basicFields.length + recruiterFields.length;
    return Math.round((completedFields / totalFields) * 100);
  }
  return Math.round((completedFields / basicFields.length) * 100);
});

// Method to check if profile is complete
UserSchema.methods.isProfileComplete = function() {
  try {
    const basicComplete = !!(this.name &&
      this.phone &&
      this.location &&
      this.bio &&
      this.name.trim() !== '' &&
      this.phone.trim() !== '' &&
      this.location.trim() !== '' &&
      this.bio.trim() !== '');
    if (this.accountType === 'candidate') {
      const candidateComplete = !!(this.candidateProfile &&
        this.candidateProfile.experience &&
        this.candidateProfile.skills &&
        this.candidateProfile.experience.trim() !== '' &&
        this.candidateProfile.skills.length > 0);
      return basicComplete && candidateComplete;
    } else if (this.accountType === 'recruiter') {
      const recruiterComplete = !!(this.recruiterProfile &&
        this.recruiterProfile.company &&
        this.recruiterProfile.position &&
        this.recruiterProfile.company.trim() !== '' &&
        this.recruiterProfile.position.trim() !== '');
      return basicComplete && recruiterComplete;
    }
    return basicComplete;
  } catch (error) {
    return false;
  }
};

// Pre-save middleware to initialize profile subdocuments
UserSchema.pre('save', function(next) {
  if (this.accountType === 'candidate' && !this.candidateProfile) {
    this.candidateProfile = {
      experience: null,
      skills: [],
      cvLink: null,
      appliedJobs: [],
      savedJobs: [],
      jobOfferings: []
    };
  }
  if (this.accountType === 'recruiter' && !this.recruiterProfile) {
    this.recruiterProfile = {
      company: null,
      position: null,
      industry: null,
      postedJobs: []
    };
  }
  next();
});

// Indexes for better performance
UserSchema.index({ accountType: 1 });
UserSchema.index({ 'candidateProfile.appliedJobs.job': 1 });
UserSchema.index({ 'recruiterProfile.postedJobs': 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
