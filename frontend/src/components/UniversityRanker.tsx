import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  MapPin, 
  Euro, 
  ExternalLink, 
  Sparkles,
  Building2,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  BookOpen,
  Compass
} from 'lucide-react';
import { ApplicantRecord } from '../types';
import { 
  ALL_GERMAN_UNIVERSITIES, 
  ALL_GERMAN_STATES, 
  ALL_INSTITUTION_TYPES, 
  GermanUniversity 
} from '../data/allGermanUniversities';
import { CourseDirectory } from './CourseDirectory';

interface UniversityRankerProps {
  applicant: ApplicantRecord | null;
  selectedCountry: 'Germany' | 'Austria';
}

export const UniversityRanker: React.FC<UniversityRankerProps> = ({
  applicant,
  selectedCountry,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'courses' | 'universities'>('courses');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [onlyTuitionFree, setOnlyTuitionFree] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'match' | 'rank' | 'name' | 'city'>('match');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const applicantGpa = applicant?.education?.germanGrade || 2.4;

  // Filter and match universities
  const processedList = useMemo(() => {
    return ALL_GERMAN_UNIVERSITIES.map((uni) => {
      // Bavarian Match Calculation:
      // In German grading, 1.0 is highest and 4.0 is passing.
      // If applicant GPA is <= uni.minGermanGpa, applicant easily satisfies requirement.
      const diff = uni.minGermanGpa - applicantGpa;
      let matchStatus: 'High Match' | 'Moderate Match' | 'Reach' = 'Moderate Match';
      let matchScore = 75;

      if (diff >= 0.2) {
        matchStatus = 'High Match';
        matchScore = 95;
      } else if (diff >= -0.2) {
        matchStatus = 'Moderate Match';
        matchScore = 80;
      } else {
        matchStatus = 'Reach';
        matchScore = 55;
      }

      return {
        ...uni,
        matchStatus,
        matchScore,
        diff,
      };
    });
  }, [applicantGpa]);

  const filteredList = useMemo(() => {
    return processedList.filter((uni) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        uni.name.toLowerCase().includes(q) ||
        uni.originalGermanName.toLowerCase().includes(q) ||
        uni.city.toLowerCase().includes(q) ||
        uni.state.toLowerCase().includes(q) ||
        uni.popularFields.some(f => f.toLowerCase().includes(q));

      // State Filter
      const matchesState = selectedState === 'All States' || uni.state === selectedState;

      // Type Filter
      const matchesType = selectedType === 'All Types' || uni.type === selectedType;

      // Tuition Filter
      const matchesTuition = onlyTuitionFree ? uni.tuitionFeeEuro === 0 : true;

      return matchesSearch && matchesState && matchesType && matchesTuition;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore;
      } else if (sortBy === 'rank') {
        const rankA = a.qsRank || a.theRank || 9999;
        const rankB = b.qsRank || b.theRank || 9999;
        return rankA - rankB;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.city.localeCompare(b.city);
      }
    });
  }, [processedList, searchQuery, selectedState, selectedType, onlyTuitionFree, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const highMatchCount = useMemo(() => {
    return filteredList.filter(u => u.matchStatus === 'High Match').length;
  }, [filteredList]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Official Hochschulkompass & DAAD Dataset
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">
              All 16 Bundesländer • 420+ Accredited Institutions
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Comprehensive German Higher Education Directory & AI Matcher
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Directory of all 420+ accredited German Universities, TU9 Technical Universities, Fachhochschulen (HAWs), and Art & Music Colleges matched with Bavarian Formula GPA.
          </p>
        </div>

        {/* Applicant GPA Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-right">
          <div className="text-[11px] text-slate-500 font-semibold">Applicant Bavarian GPA</div>
          <div className="text-2xl font-black text-sky-700">{applicantGpa.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
            ✓ {highMatchCount} High Matches in Filter
          </div>
        </div>
      </div>

      {/* View Switcher: Courses vs Universities */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl max-w-fit border border-slate-200">
        <button
          onClick={() => setActiveViewTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeViewTab === 'courses'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-600" />
          📚 Accredited Degree Programs & Cutoffs (DAAD)
        </button>
        <button
          onClick={() => setActiveViewTab('universities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeViewTab === 'universities'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          🏛️ 420+ Accredited German Universities Explorer
        </button>
      </div>

      {activeViewTab === 'courses' ? (
        <CourseDirectory applicant={applicant} />
      ) : (
        <>
          {/* Filter & Search Toolbar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by university, city, or study field (e.g. Informatics, Munich, HAW)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 text-xs"
            />
          </div>

          {/* State (Bundesland) Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {ALL_GERMAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state === 'All States' ? '🏛️ All 16 German States' : `🇩🇪 ${state}`}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="match">🎯 Sort: Highest Match Score</option>
              <option value="rank">🏆 Sort: Global QS / THE Rank</option>
              <option value="name">🔤 Sort: Alphabetical (A-Z)</option>
              <option value="city">📍 Sort: By City</option>
            </select>
          </div>
        </div>

        {/* Second Row: Institution Type Tabs & Tuition Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_INSTITUTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedType === type
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setOnlyTuitionFree(!onlyTuitionFree);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
                onlyTuitionFree
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Euro className="w-3.5 h-3.5" /> €0 Tuition Free Only
            </button>

            <span className="text-slate-400 font-medium">
              Showing <strong>{filteredList.length}</strong> of <strong>{ALL_GERMAN_UNIVERSITIES.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* University Grid */}
      {paginatedList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-xs text-slate-500">
          No institutions found matching current filter criteria.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedList.map((uni) => {
            const isHigh = uni.matchStatus === 'High Match';
            const isModerate = uni.matchStatus === 'Moderate Match';

            return (
              <div
                key={uni.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isHigh
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isModerate
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {uni.matchStatus} ({uni.matchScore}%)
                    </span>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {uni.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-0.5">{uni.name}</h3>
                  <div className="text-[11px] text-slate-400 italic mb-2 line-clamp-1">
                    {uni.originalGermanName}
                  </div>

                  {/* Location & State */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{uni.city}, {uni.state}</span>
                  </div>

                  {/* Program & Fee Details */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] space-y-1.5 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tuition Fee:</span>
                      <span className="font-bold text-emerald-700">
                        {uni.tuitionFeeEuro === 0 ? '€0 (Tuition-Free)' : `€${uni.tuitionFeeEuro.toLocaleString()} / sem (Non-EU)`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Min German GPA:</span>
                      <span className="font-semibold text-slate-800">
                        {uni.minGermanGpa.toFixed(1)}{' '}
                        <span className="text-[10px] text-slate-400">
                          (Applicant: {applicantGpa.toFixed(2)})
                        </span>
                      </span>
                    </div>

                    {uni.qsRank && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Global Rank:</span>
                        <span className="font-semibold text-slate-800">QS #{uni.qsRank}</span>
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="mb-4">
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Popular Majors:</span>
                    <div className="flex flex-wrap gap-1">
                      {uni.popularFields.map((field, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    CHE: <strong className="text-indigo-700">{uni.cheRating}</strong>
                  </span>

                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

          {totalPages > 1 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
