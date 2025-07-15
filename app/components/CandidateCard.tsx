'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink,
  Briefcase,
  Star,
  Gift,
  User
} from 'lucide-react';

interface CandidateCardProps {
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
  recruiterId: string;
}

export default function CandidateCard({ candidate, recruiterId }: CandidateCardProps) {
  const [offering, setOffering] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const handleOfferJob = () => {
    setShowOfferModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {candidate.profileImage ? (
              <img 
                src={candidate.profileImage} 
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{candidate.name}</h3>
            <p className="text-blue-600 font-medium mb-2">
              {candidate.candidateProfile.experience || 'Experience not specified'}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {candidate.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{candidate.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{candidate.phone}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {candidate.bio && (
          <p 
            className="text-gray-700 text-sm mb-4" 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {candidate.bio}
          </p>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {candidate.candidateProfile.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {candidate.candidateProfile.skills.length > 4 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{candidate.candidateProfile.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleOfferJob}
            disabled={offering}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4" />
            Offer Job
          </button>
          
          {candidate.candidateProfile.cvLink && (
            <a
              href={candidate.candidateProfile.cvLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition border border-gray-200 flex items-center justify-center"
              title="View CV/Resume"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Job Offer Modal */}
      {showOfferModal && (
        <JobOfferModal
          candidate={candidate}
          recruiterId={recruiterId}
          onClose={() => setShowOfferModal(false)}
          onSuccess={() => {
            setOffering(false);
            setShowOfferModal(false);
          }}
        />
      )}
    </>
  );
}

// Job Offer Modal Component
function JobOfferModal({ candidate, recruiterId, onClose, onSuccess }: {
  candidate: any;
  recruiterId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedJob, setSelectedJob] = useState('');
  const [message, setMessage] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Fetch recruiter's jobs
  useState(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`/api/recruiter/jobs`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setLoading(true);
    try {
      const response = await fetch('/api/job-offerings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate._id,
          jobId: selectedJob,
          message: message.trim() || undefined
        }),
      });

      if (response.ok) {
        alert('Job offer sent successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send job offer');
      }
    } catch (error) {
      console.error('Error sending job offer:', error);
      alert('Failed to send job offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Offer Job to {candidate.name}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Job Position
            </label>
            {loadingJobs ? (
              <div className="text-center py-4">Loading jobs...</div>
            ) : (
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a job position</option>
                {jobs.map((job: any) => (
                  <option key={job._id} value={job._id}>
                    {job.title} - {job.company}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a personal message to the candidate..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedJob}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
