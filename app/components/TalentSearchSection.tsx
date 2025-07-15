'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import CandidateCard from './CandidateCard';

interface CandidateData {
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
}

interface TalentSearchSectionProps {
  initialCandidates: CandidateData[];
  recruiterId: string;
}

export default function TalentSearchSection({ 
  initialCandidates, 
  recruiterId 
}: TalentSearchSectionProps) {
  const [candidates, setCandidates] = useState<CandidateData[]>(initialCandidates);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCandidates(initialCandidates);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/candidates/search?skills=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const searchResults = await response.json();
        setCandidates(searchResults.candidates || []);
      } else {
        console.error('Search failed');
        setCandidates([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setCandidates([]);
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
    setCandidates(initialCandidates);
  };

  return (
    <section id="browse-talent" className="py-20 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
            Discover Top <span className="text-blue-700">Talent</span>
          </h2>
          <p className="mt-2 text-lg text-gray-700 max-w-2xl mb-8">
            Find qualified candidates with the skills and experience you need.
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
                placeholder="Search candidates by skills (e.g., React, Python, Marketing)"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search Candidates'}
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
              {isSearching ? 'Searching...' : `Found ${candidates.length} candidate(s) for "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <CandidateCard 
              key={candidate._id} 
              candidate={candidate}
              recruiterId={recruiterId}
            />
          ))}
        </div>

        {/* No Candidates Found */}
        {candidates.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No candidates found' : 'No Candidates Available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `Try searching with different keywords or clear your search to see all candidates.`
                : 'Check back later for new talent!'
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
