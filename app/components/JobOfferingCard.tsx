'use client';

import { useState } from 'react';

interface JobOfferingCardProps {
  offering: {
    _id: string;
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
    };
    recruiter: {
      _id: string;
      name: string;
      recruiterProfile?: {
        company: string;
      };
    };
    offeredAt: string;
    status: string;
    interviewLink?: string;
    message?: string;
  };
  userId: string;
}

export default function JobOfferingCard({ offering, userId }: JobOfferingCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(offering.status);

  const handleResponse = async (response: 'Accepted' | 'Rejected') => {
    setLoading(true);
    try {
      const res = await fetch('/api/job-offerings/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offeringId: offering._id,
          userId: userId,
          response: response
        }),
      });

      if (res.ok) {
        setStatus(response);
        alert(`Job offering ${response.toLowerCase()} successfully!`);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to respond to job offering');
      }
    } catch (error) {
      console.error('Error responding to job offering:', error);
      alert('Failed to respond to job offering');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (salary: { min?: number; max?: number; currency: string }) => {
    if (!salary || (typeof salary.min !== 'number' && typeof salary.max !== 'number')) {
      return 'Salary not specified';
    }
    
    if (typeof salary.min === 'number' && typeof salary.max === 'number') {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    }
    
    if (typeof salary.min === 'number') {
      return `$${salary.min.toLocaleString()}+`;
    }
    
    if (typeof salary.max === 'number') {
      return `Up to $${salary.max.toLocaleString()}`;
    }
    
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently offered';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Interview':
        return 'bg-purple-100 text-purple-800';
      case 'Hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{offering.job.title}</h3>
          <p className="text-orange-600 font-semibold mb-2">
            {offering.recruiter.recruiterProfile?.company || offering.job.company}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Offered by {offering.recruiter.name}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
          <span className="text-sm text-gray-500">Offered {formatDate(offering.offeredAt)}</span>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{offering.job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{offering.job.jobType}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span>{formatSalary(offering.job.salary)}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{offering.job.experience}</span>
        </div>
      </div>

      {/* Recruiter Message */}
      {offering.message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium text-blue-900">Message from Recruiter</span>
          </div>
          <p className="text-blue-800 text-sm">{offering.message}</p>
        </div>
      )}

      {/* Job Description */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm mb-3" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {offering.job.description}
        </p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {offering.job.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {offering.job.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{offering.job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Interview Link */}
      {status === 'Interview' && offering.interviewLink && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h4 className="font-semibold text-purple-900">Interview Scheduled</h4>
          </div>
          <p className="text-purple-700 text-sm mb-3">
            Your interview has been scheduled. Join using the link below:
          </p>
          <a
            href={offering.interviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Join Interview
          </a>
        </div>
      )}

      {/* Action Buttons */}
      {status === 'Pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleResponse('Accepted')}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept Offer
          </button>
          <button
            onClick={() => handleResponse('Rejected')}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Decline Offer
          </button>
        </div>
      )}

      {/* Status Messages */}
      {status === 'Accepted' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm font-medium">
            ✓ You accepted this job offer. The recruiter will contact you soon with next steps.
          </p>
        </div>
      )}

      {status === 'Rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm font-medium">
            ✗ You declined this job offer.
          </p>
        </div>
      )}

      {status === 'Hired' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm font-medium">
            🎉 Congratulations! You've been hired for this position.
          </p>
        </div>
      )}
    </div>
  );
}
