'use client';

import { useState } from 'react';
import { MapPin, Clock, DollarSign, Briefcase, Bookmark, BookmarkCheck } from 'lucide-react';

export default function JobCard({ 
  job, 
  isApplied, 
  isSaved, 
  userId, 
  onJobApplied, 
  onJobSaved, 
  onJobUnsaved 
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(isApplied);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

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
        onJobApplied && onJobApplied(job._id);
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

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const endpoint = saved ? '/api/jobs/unsave' : '/api/jobs/save';
      const response = await fetch(endpoint, {
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
        setSaved(!saved);
        if (saved) {
          onJobUnsaved && onJobUnsaved(job._id);
        } else {
          onJobSaved && onJobSaved(job._id);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    }
    return salary.min ? `$${salary.min.toLocaleString()}+` : `Up to $${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently posted';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-blue-600 font-semibold mb-1">
            {job.postedBy?.recruiterProfile?.company || job.company}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDate(job.createdAt)}</span>
          </div>
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`p-2 rounded-lg transition-colors ${
              saved
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={saved ? 'Remove from saved jobs' : 'Save job for later'}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

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

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {job.experience} experience
        </span>
        <button
          onClick={handleApply}
          disabled={applied || applying}
          className={`px-6 py-2 rounded-xl font-medium transition ${
            applied
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : applying
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {applied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
}
