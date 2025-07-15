'use client';

import { useState } from 'react';
import {
  User, MapPin, Phone, Mail, Clock, CheckCircle, XCircle, Calendar,
  ExternalLink, FileText, Briefcase, AlertCircle, Eye, UserX, X
} from 'lucide-react';

interface ApplicantCardProps {
  applicant: {
    _id: string;
    candidate: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      location?: string;
      profileImage?: string;
      bio?: string;
      candidateProfile: {
        experience?: string;
        skills: string[];
        cvLink?: string;
      };
    };
    job: {
      _id: string;
      title: string;
      company: string;
    };
    appliedAt?: string;
    offeredAt?: string;
    status: string;
    interviewLink?: string;
    message?: string;
  };
  type?: 'application' | 'offering';
  recruiterId: string;
}

export default function ApplicantCard({
  applicant,
  type = 'application',
  recruiterId
}: ApplicantCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(applicant.status);
  const [interviewLink, setInterviewLink] = useState(applicant.interviewLink || '');
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const statusColor = {
    Applied:    'bg-orange-100 text-orange-800',
    Pending:    'bg-orange-100 text-orange-800',
    Reviewing:  'bg-yellow-100 text-yellow-800',
    Interview:  'bg-purple-100 text-purple-800',
    Rejected:   'bg-red-100 text-red-800',
    Hired:      'bg-green-100 text-green-800',
    Accepted:   'bg-green-100 text-green-800',
  };

  const statusIcon = {
    Applied:    <Clock className="w-4 h-4" />,
    Pending:    <Clock className="w-4 h-4" />,
    Reviewing:  <AlertCircle className="w-4 h-4" />,
    Interview:  <Calendar className="w-4 h-4" />,
    Rejected:   <XCircle className="w-4 h-4" />,
    Hired:      <CheckCircle className="w-4 h-4" />,
    Accepted:   <CheckCircle className="w-4 h-4" />,
  };

  const handleStatusUpdate = async (newStatus: string, link?: string) => {
    setLoading(true);
    try {
      const endpoint = type === 'application'
        ? '/api/applications/update-status'
        : '/api/job-offerings/update-status';

      const payload: any = {
        recruiterId,
        status: newStatus
      };
      if (type === 'application') {
        payload.applicantId = applicant._id;
        payload.candidateId = applicant.candidate._id;
        payload.jobId = applicant.job._id;
      } else {
        payload.offeringId = applicant._id;
        payload.candidateId = applicant.candidate._id;
      }
      if (link) payload.interviewLink = link;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status || newStatus);
        setInterviewLink(data.interviewLink || link || '');
        setShowInterviewForm(false);
        setShowRejectModal(false);
        alert(`Status updated to ${data.status || newStatus} successfully!`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update status');
      }
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = () => {
    if (!interviewLink.trim()) {
      alert('Please enter a valid interview link');
      return;
    }
    handleStatusUpdate('Interview', interviewLink);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const getDateString = () => type === 'offering'
    ? applicant.offeredAt || applicant.appliedAt
    : applicant.appliedAt;

  const getDateLabel = () => type === 'offering' ? 'Offered' : 'Applied';

  return (
    <div className={`bg-blue-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {applicant.candidate.profileImage ? (
              <img
                src={applicant.candidate.profileImage}
                alt={applicant.candidate.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{applicant.candidate.name}</h3>
            <p className="text-blue-600 font-semibold">
              {type === 'offering' ? 'Offered: ' : 'Applied for: '}{applicant.job.title}
            </p>
            <p className="text-sm text-gray-600">
              {getDateLabel()} {formatDate(getDateString())}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColor[status as keyof typeof statusColor] || 'bg-gray-100 text-gray-800'}`}>
          {statusIcon[status as keyof typeof statusIcon] || <Clock className="w-4 h-4" />}
          {status}
        </span>
      </div>
      {type === 'offering' && applicant.message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900 text-sm">Your Message</span>
          </div>
          <p className="text-blue-800 text-sm">{applicant.message}</p>
        </div>
      )}
      {/* Candidate Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{applicant.candidate.email}</span>
          </div>
          {applicant.candidate.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{applicant.candidate.phone}</span>
            </div>
          )}
          {applicant.candidate.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{applicant.candidate.location}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {applicant.candidate.candidateProfile.experience && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>{applicant.candidate.candidateProfile.experience}</span>
            </div>
          )}
          {applicant.candidate.candidateProfile.cvLink && (
            <a
              href={applicant.candidate.candidateProfile.cvLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <FileText className="w-4 h-4" />
              View CV/Resume
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      {applicant.candidate.bio && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{applicant.candidate.bio}</p>
        </div>
      )}
      {applicant.candidate.candidateProfile.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {applicant.candidate.candidateProfile.skills.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
            {applicant.candidate.candidateProfile.skills.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{applicant.candidate.candidateProfile.skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
      {/* Interview Link */}
      {status === 'Interview' && interviewLink && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Interview Scheduled</h4>
          </div>
          <a
            href={interviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-700 text-sm hover:text-purple-900 inline-flex items-center gap-1 break-all"
          >
            <ExternalLink className="w-4 h-4" />
            Join Interview
          </a>
        </div>
      )}
      {/* Schedule Interview Form */}
      {showInterviewForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-purple-900 mb-3">Schedule Interview</h4>
          <div className="space-y-3">
            <input
              type="url"
              value={interviewLink}
              onChange={(e) => setInterviewLink(e.target.value)}
              placeholder="Enter Zoom/Meet link"
              className="w-full px-3 py-2 border text-gray-700 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              required
            />
            <div className="flex gap-2">
              <button
                onClick={handleScheduleInterview}
                disabled={loading || !interviewLink.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
              <button
                onClick={() => {
                  setShowInterviewForm(false);
                  setInterviewLink(applicant.interviewLink || '');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hired Status */}
      {status === 'Hired' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Candidate Hired!</h4>
          </div>
          <p className="text-green-700 text-sm mt-1">
            This candidate has been successfully hired for the position.
          </p>
        </div>
      )}
      {/* Rejected Status */}
      {status === 'Rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Application Rejected</h4>
          </div>
          <p className="text-red-700 text-sm mt-1">
            This {type === 'offering' ? 'job offer was declined' : 'application was not selected'}.
          </p>
        </div>
      )}
      {/* Action Buttons */}
      {!['Hired', 'Rejected'].includes(status) && (
        <div className="space-y-3">
          {(status === 'Applied' || status === 'Pending' || status === 'Reviewing' || status === 'Accepted') && (
            <div className="flex gap-3 mt-4">
              {status !== 'Reviewing' && (
                <button
                  onClick={() => handleStatusUpdate('Reviewing')}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Mark as Review
                </button>
              )}
              <button
                onClick={() => setShowInterviewForm(true)}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Interview
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
          {status === 'Interview' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('Hired')}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Hire Candidate'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              aria-label="Close modal"
              onClick={() => setShowRejectModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Candidate</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to reject {applicant.candidate.name} for this position? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate('Rejected')}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
