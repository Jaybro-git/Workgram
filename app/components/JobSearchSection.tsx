'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import JobCard from './JobCard';

interface JobData {
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
}

interface JobSearchSectionProps {
  initialJobs: JobData[];
  appliedJobIds: string[];
  savedJobIds: string[];
  userId: string;
}

export default function JobSearchSection({ 
  initialJobs, 
  appliedJobIds, 
  savedJobIds, 
  userId 
}: JobSearchSectionProps) {
  const [jobs, setJobs] = useState<JobData[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentAppliedJobs, setCurrentAppliedJobs] = useState(appliedJobIds);
  const [currentSavedJobs, setCurrentSavedJobs] = useState(savedJobIds);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setJobs(initialJobs);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/jobs/search?title=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const searchResults = await response.json();
        setJobs(searchResults.jobs || []);
      } else {
        console.error('Search failed');
        setJobs([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setJobs([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setJobs(initialJobs);
  };

  const handleJobApplied = (jobId: string) => {
    setCurrentAppliedJobs(prev => [...prev, jobId]);
  };

  const handleJobSaved = (jobId: string) => {
    setCurrentSavedJobs(prev => [...prev, jobId]);
  };

  const handleJobUnsaved = (jobId: string) => {
    setCurrentSavedJobs(prev => prev.filter(id => id !== jobId));
  };

  return (
    <section id="find-jobs" className="py-20 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
            Find Your Next <span className="text-blue-700">Opportunity</span>
          </h2>
          <p className="mt-2 text-lg text-gray-700 max-w-2xl mb-8">
            Discover jobs that match your skills and career goals from top employers.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search jobs by title (e.g., Software Engineer)"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search Jobs'}
              </button>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-medium transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              {isSearching ? 'Searching...' : `Found ${jobs.length} job(s) for "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job} 
              isApplied={currentAppliedJobs.includes(job._id)}
              isSaved={currentSavedJobs.includes(job._id)}
              userId={userId}
              onJobApplied={handleJobApplied}
              onJobSaved={handleJobSaved}
              onJobUnsaved={handleJobUnsaved}
            />
          ))}
        </div>

        {/* No Jobs Found */}
        {jobs.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No jobs found' : 'No Jobs Available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `Try searching with different keywords or clear your search to see all jobs.`
                : 'Check back later for new opportunities!'
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
