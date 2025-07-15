import mongoose from 'mongoose';

// Subdocument for each applicant (with interviewLink)
const ApplicantSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'Reviewing', 'Interview', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  interviewLink: { type: String, default: null }
}, { _id: true });

const JobSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Job title is required'], trim: true },
  company: { type: String, required: [true, 'Company name is required'], trim: true },
  location: { type: String, required: [true, 'Location is required'], trim: true },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    required: [true, 'Job type is required']
  },
  salary: {
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    currency: { type: String, default: 'USD' }
  },
  description: { type: String, required: [true, 'Job description is required'], trim: true },
  requirements: { type: String, required: [true, 'Job requirements are required'], trim: true },
  skills: [{ type: String, trim: true }],
  experience: {
    type: String,
    enum: ['Entry Level', '1-3 years', '3-5 years', '5+ years'],
    required: [true, 'Experience level is required']
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [ApplicantSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for better search performance
JobSchema.index({ title: 'text', company: 'text', skills: 'text' });
JobSchema.index({ postedBy: 1 });
JobSchema.index({ isActive: 1 });

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
