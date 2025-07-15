'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';

interface ApplicationCardProps {
  application: {
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
      postedBy: {
        _id: string;
        name: string;
        recruiterProfile?: {
          company: string;
        };
      };
    };
    appliedAt: string;
    status: string;
    interviewLink?: string;
  };
  userId: string;
}

export default function ApplicationCard({ application, userId }: ApplicationCardProps) {
  // State for dynamic fields
  const [status, setStatus] = useState(application.status);
  const [interviewLink, setInterviewLink] = useState(application.interviewLink || '');

  // Salary formatting
  const formatSalary = (salary: { min?: number; max?: number; currency: string }) => {
    if (!salary || (typeof salary.min !== 'number' && typeof salary.max !== 'number')) {
      return 'Salary not specified';
    }
    const currency = salary.currency || '$';
    if (typeof salary.min === 'number' && typeof salary.max === 'number') {
      return `${currency}${salary.min.toLocaleString()} - ${currency}${salary.max.toLocaleString()}`;
    }
    if (typeof salary.min === 'number') {
      return `${currency}${salary.min.toLocaleString()}+`;
    }
    if (typeof salary.max === 'number') {
      return `Up to ${currency}${salary.max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  // Date formatting
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently applied';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently applied';
    }
  };

  // Status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';
      case 'Reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Interview':
        return 'bg-purple-100 text-purple-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied':
        return <Clock className="w-4 h-4" />;
      case 'Reviewing':
        return <AlertCircle className="w-4 h-4" />;
      case 'Interview':
        return <Calendar className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      case 'Hired':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Prefer recruiterProfile.company if available, else fallback to job.company
  const companyName = application.job.postedBy?.recruiterProfile?.company || application.job.company;

  // If you want to support live update after interview scheduled from backend:
  // Use an effect or a prop update (not shown here, but your backend must always return the latest interviewLink!)

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{application.job.title}</h3>
          <p className="text-blue-600 font-semibold mb-2">{companyName}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{application.job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{application.job.jobType}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{formatSalary(application.job.salary)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            {status}
          </span>
          <span className="text-sm text-gray-500">Applied {formatDate(application.appliedAt)}</span>
        </div>
      </div>

      {/* Interview Link - always use state */}
      {status === 'Interview' && interviewLink && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Interview Scheduled</h4>
          </div>
          <p className="text-purple-700 text-sm mb-3">
            Your interview has been scheduled. Join using the link below:
          </p>
          <a
            href={interviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Join Interview
          </a>
        </div>
      )}

      {/* Hired Status */}
      {status === 'Hired' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Congratulations! You're Hired!</h4>
          </div>
          <p className="text-green-700 text-sm">
            You have been selected for this position. The recruiter will contact you soon with next steps.
          </p>
        </div>
      )}

      {/* Rejected Status */}
      {status === 'Rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Application Not Selected</h4>
          </div>
          <p className="text-red-700 text-sm">
            Unfortunately, you were not selected for this position. Keep applying to other opportunities!
          </p>
        </div>
      )}
    </div>
  );
}
