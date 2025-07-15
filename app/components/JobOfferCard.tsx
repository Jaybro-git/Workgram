'use client';

import { useState } from 'react';
import {
  MapPin, Mail, User, Calendar, CheckCircle, XCircle, Clock,
  MessageSquare, Users, Link as LinkIcon, X, Eye, UserX, ExternalLink
} from 'lucide-react';

type OfferStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Interview' | 'Hired';

interface JobOfferCardProps {
  offer: {
    _id: string;
    candidate: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      location?: string;
      profileImage?: string;
    };
    job: {
      _id: string;
      title: string;
      company: string;
    };
    offeredAt: string;
    status: OfferStatus;
    interviewLink?: string;
    message?: string;
  };
  recruiterId: string;
}

export default function JobOfferCard({ offer, recruiterId }: JobOfferCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OfferStatus>(offer.status);
  const [interviewLink, setInterviewLink] = useState(offer.interviewLink || '');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const statusColor: Record<OfferStatus, string> = {
    Pending:    'bg-orange-100 text-orange-800',
    Accepted:   'bg-green-100 text-green-800',
    Rejected:   'bg-red-100 text-red-800',
    Interview:  'bg-purple-100 text-purple-800',
    Hired:      'bg-green-100 text-green-800'
  };

  const statusIcon: Record<OfferStatus, React.ReactElement> = {
    Pending:   <Clock className="w-4 h-4" />,
    Accepted:  <CheckCircle className="w-4 h-4" />,
    Rejected:  <XCircle className="w-4 h-4" />,
    Interview: <Calendar className="w-4 h-4" />,
    Hired:     <Users className="w-4 h-4" />
  };

  const updateStatus = async (newStatus: OfferStatus, link?: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const payload: any = {
        offeringId: offer._id,
        candidateId: offer.candidate._id,
        recruiterId,
        status: newStatus
      };
      if (newStatus === 'Interview' && link?.trim()) {
        payload.interviewLink = link.trim();
      }

      const res = await fetch('/api/job-offerings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message ?? 'Server error');
      }

      const data = await res.json();
      setStatus(data.status || newStatus);
      setInterviewLink(data.interviewLink || link || '');
      if (newStatus === 'Interview' && link) {
        offer.interviewLink = link;
      }
      alert(`Status updated to ${data.status || newStatus} successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setShowInterviewModal(false);
      setShowRejectModal(false);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 rounded-xl p-6 border border-orange-200 hover:shadow-md transition-shadow">
        {/* header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {offer.candidate.profileImage ? (
                <img
                  src={offer.candidate.profileImage}
                  alt={offer.candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{offer.candidate.name}</h3>
              <p className="text-orange-600 font-semibold">Offered: {offer.job.title}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mt-2">
                {offer.candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {offer.candidate.location}
                  </span>
                )}
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-4 h-4" /> {offer.candidate.email}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColor[status]}`}>
              {statusIcon[status]} {status}
            </span>
            <p className="text-sm text-gray-500 mt-1">Offered {formatDate(offer.offeredAt)}</p>
          </div>
        </div>
        {offer.message && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1 text-orange-900 font-medium text-sm">
              <MessageSquare className="w-4 h-4" /> Your Message
            </div>
            <p className="text-orange-800 text-sm">{offer.message}</p>
          </div>
        )}
        {status === 'Interview' && interviewLink && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
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
              <ExternalLink className="w-4 h-4" /> Join Interview
            </a>
          </div>
        )}
        {status === 'Hired' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Candidate Hired!</h4>
            </div>
            <p className="text-green-700 text-sm mt-1">This candidate has been successfully hired for the position.</p>
          </div>
        )}

        {/* Buttons for Accepted status */}
        {status === 'Accepted' && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowInterviewModal(true)}
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

        {/* Buttons for Interview status */}
        {status === 'Interview' && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => updateStatus('Hired')}
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
              <UserX className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}

        {status === 'Pending' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
            <p className="text-orange-800 text-sm font-medium">
              ⏳ Waiting for candidate response…
            </p>
          </div>
        )}

        {status === 'Rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-800 text-sm font-medium">
              ✗ Candidate declined this job offer.
            </p>
          </div>
        )}
      </div>

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              aria-label="Close modal"
              onClick={() => setShowInterviewModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Interview</h3>
            <p className="text-gray-600 text-sm mb-4">
              Provide an interview link for {offer.candidate.name}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Link (Google Meet, Zoom, etc.)
            </label>
            <input
              type="url"
              value={interviewLink}
              onChange={(e) => setInterviewLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mb-6 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus('Interview', interviewLink)}
                disabled={loading || !interviewLink.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Scheduling…' : 'Confirm Interview'}
              </button>
            </div>
          </div>
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
              Are you sure you want to reject {offer.candidate.name} for this position? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus('Rejected')}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
