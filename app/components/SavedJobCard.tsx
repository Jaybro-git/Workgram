'use client';

import { useState } from 'react';
import { MapPin, Clock, DollarSign, Briefcase, BookmarkX, ExternalLink } from 'lucide-react';

interface SavedJobCardProps {
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    jobType: string;
    salary: {
      min?: number;
      max?: number;
      currency: string;
    };
    description: string;
    requirements: string;
    skills: string[];
    experience: string;
    postedBy: {
      _id: string;
      name: string;
      recruiterProfile?: {
        company: string;
      };
    };
    applicants: Array<{
      candidate: string;
      appliedAt: string;
      status: string;
      _id: string;
    }>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  isApplied: boolean;
  userId: string;
}

export default function SavedJobCard({ job, isApplied, userId }: SavedJobCardProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(isApplied);
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState(false);

  const handleApply = async () => {
    if (applied || applying) return;

    setApplying(true);
    try {
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          userId: userId,
        }),
      });

      if (response.ok) {
        setApplied(true);
        alert('Application submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to apply for job');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to apply for job');
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = async () => {
    if (removing) return;

    const confirmRemove = confirm('Are you sure you want to remove this job from your saved list?');
    if (!confirmRemove) return;

    setRemoving(true);
    try {
      const response = await fetch('/api/jobs/unsave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          userId: userId,
        }),
      });

      if (response.ok) {
        setRemoved(true);
        // Add a delay before hiding the card to show the removal animation
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to remove job');
      }
    } catch (error) {
      console.error('Error removing job:', error);
      alert('Failed to remove job');
    } finally {
      setRemoving(false);
    }
  };

const formatSalary = (salary: { min?: number; max?: number; currency: string }) => {
  // Check if salary object exists
  if (!salary) return 'Salary not specified';
  
  // Check if both min and max exist and are not undefined
  if (typeof salary.min === 'number' && typeof salary.max === 'number') {
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
  }
  
  // Check if only min exists
  if (typeof salary.min === 'number') {
    return `$${salary.min.toLocaleString()}+`;
  }
  
  // Check if only max exists
  if (typeof salary.max === 'number') {
    return `Up to $${salary.max.toLocaleString()}`;
  }
  
  // Fallback when neither min nor max is specified
  return 'Salary not specified';
};


  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently posted';
    }
  };

  const calculateDaysAgo = (dateString: string) => {
    try {
      const jobDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - jobDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  if (removed) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <BookmarkX className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium">Job removed from saved list</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 relative">
      
      {/* Job Status Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {applied && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
            Applied
          </span>
        )}
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
          Saved {calculateDaysAgo(job.createdAt)} days ago
        </span>
      </div>

      {/* Job Header */}
      <div className="mb-4 pr-20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
        <p className="text-blue-600 font-semibold mb-1">
          {job.postedBy?.recruiterProfile?.company || job.company}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Posted {formatDate(job.createdAt)}</span>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span className="text-sm">{job.jobType}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm">{formatSalary(job.salary)}</span>
        </div>
      </div>

      {/* Job Description */}
      <p 
        className="text-gray-700 text-sm mb-4" 
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills && job.skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
        {job.skills && job.skills.length > 3 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{job.skills.length - 3} more
          </span>
        )}
      </div>

      {/* Experience Level */}
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          {job.experience} experience required
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApply}
          disabled={applied || applying}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
            applied
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : applying
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {applied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
        </button>
        
        <button
          onClick={handleRemove}
          disabled={removing}
          className={`px-4 py-2 rounded-xl font-medium transition border ${
            removing
              ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
              : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
          }`}
          title="Remove from saved jobs"
        >
          {removing ? (
            <div className="w-4 h-4 animate-spin border-2 border-gray-400 border-t-transparent rounded-full"></div>
          ) : (
            <BookmarkX className="w-4 h-4" />
          )}
        </button>
        
      </div>
    </div>
  );
}
