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
  Compass,
  BookmarkPlus,
  BookmarkCheck,
  Sliders,
  Calculator,
  ListPlus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  AlertCircle
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
  selectedCountry?: 'Germany' | 'Austria';
  onUpdateShortlist?: (shortlist: string[]) => void;
}

export const UniversityRanker: React.FC<UniversityRankerProps> = ({
  applicant,
  selectedCountry = 'Germany',
  onUpdateShortlist,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'universities' | 'courses'>('universities');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [onlyTuitionFree, setOnlyTuitionFree] = useState<boolean>(false);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<'ALL' | 'ENGLISH' | 'GERMAN'>('ALL');
  
  // Bavarian Formula Cutoff Limit Slider (1.0 to 3.5)
  const [maxCutoffFilter, setMaxCutoffFilter] = useState<number>(3.5);
  
  // Interactive Bavarian Formula Widget States
  const [indianCgpaInput, setIndianCgpaInput] = useState<number>(8.5);
  const [maxCgpaScale, setMaxCgpaScale] = useState<number>(10.0);
  const [minPassScale, setMinPassScale] = useState<number>(4.0);
  
  // Shortlist Drawer State
  const [shortlist, setShortlist] = useState<string[]>(applicant?.universityShortlist || []);
  const [isShortlistDrawerOpen, setIsShortlistDrawerOpen] = useState<boolean>(false);

  const [sortBy, setSortBy] = useState<'match' | 'rank' | 'name' | 'city'>('match');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Calculate live Bavarian Converted GPA
  const calculatedBavarianGpa = useMemo(() => {
    if (applicant?.education?.germanGrade) {
      return applicant.education.germanGrade;
    }
    // Bavarian Formula: 1 + 3 * ((Nmax - Nd) / (Nmax - Nmin))
    const p = Math.max(minPassScale, Math.min(maxCgpaScale, indianCgpaInput));
    const converted = 1 + 3 * ((maxCgpaScale - p) / (maxCgpaScale - minPassScale));
    return Math.round(converted * 100) / 100;
  }, [applicant?.education?.germanGrade, indianCgpaInput, maxCgpaScale, minPassScale]);

  const applicantGpa = calculatedBavarianGpa;

  // Toggle Shortlist
  const toggleShortlistUni = (uniId: string) => {
    let updated: string[];
    if (shortlist.includes(uniId)) {
      updated = shortlist.filter(id => id !== uniId);
    } else {
      updated = [...shortlist, uniId];
    }
    setShortlist(updated);
    if (onUpdateShortlist) onUpdateShortlist(updated);
  };

  // Filter and match universities
  const processedList = useMemo(() => {
    return ALL_GERMAN_UNIVERSITIES.map((uni) => {
      // Bavarian Match Calculation:
      // German grading: 1.0 (best) to 4.0 (passing). Lower number is better.
      // If applicant GPA is <= uni.minGermanGpa, applicant satisfies requirement easily.
      const diff = uni.minGermanGpa - applicantGpa;
      let matchStatus: 'HIGH ADMISSION ODDS' | 'COMPETITIVE MATCH' | 'AMBITIOUS / REACH' = 'COMPETITIVE MATCH';
      let matchScore = 75;

      if (diff >= 0.2) {
        matchStatus = 'HIGH ADMISSION ODDS';
        matchScore = 95;
      } else if (diff >= -0.2) {
        matchStatus = 'COMPETITIVE MATCH';
        matchScore = 80;
      } else {
        matchStatus = 'AMBITIOUS / REACH';
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

      // State Filter (All 16 German states)
      const matchesState = selectedState === 'All States' || uni.state === selectedState;

      // Type Filter
      const matchesType = selectedType === 'All Types' || uni.type === selectedType;

      // Tuition Filter
      const matchesTuition = onlyTuitionFree ? uni.tuitionFeeEuro === 0 : true;

      // GPA Cutoff Slider Filter
      const matchesCutoff = uni.minGermanGpa <= maxCutoffFilter;

      // Language Filter (heuristic)
      const matchesLang = selectedLanguageFilter === 'ALL'
        ? true
        : selectedLanguageFilter === 'ENGLISH'
        ? uni.popularFields.some(f => f.toLowerCase().includes('english') || f.toLowerCase().includes('informatics') || f.toLowerCase().includes('data'))
        : true;

      return matchesSearch && matchesState && matchesType && matchesTuition && matchesCutoff && matchesLang;
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
  }, [processedList, searchQuery, selectedState, selectedType, onlyTuitionFree, maxCutoffFilter, selectedLanguageFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const shortlistedUniversities = useMemo(() => {
    return ALL_GERMAN_UNIVERSITIES.filter(u => shortlist.includes(u.id));
  }, [shortlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              <Building2 className="w-3 h-3 text-sky-600" /> 420+ Accredited German Universities
            </span>
            <span className="text-xs text-slate-400 font-medium">Bavarian Formula Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            German Higher Education Explorer & Target Wishlist
          </h1>
          <p className="text-xs text-slate-500">
            Compare public €0-tuition universities and TU9 excellence clusters against your Bavarian GPA cutoff odds.
          </p>
        </div>

        {/* View Switcher & Shortlist Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsShortlistDrawerOpen(!isShortlistDrawerOpen)}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-600" />
            <span>My Target Shortlist</span>
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {shortlist.length}
            </span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveViewTab('universities')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeViewTab === 'universities'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Universities Directory
            </button>
            <button
              onClick={() => setActiveViewTab('courses')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeViewTab === 'courses'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Master's Degrees
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Bavarian Formula Cutoff Calculator & GPA Bar */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Interactive Bavarian GPA Conversion Calculator</h2>
          </div>
          <div className="text-[11px] text-sky-200 font-mono">
            Formula: 1 + 3 × [(Nmax - Nd) / (Nmax - Nmin)]
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 items-center text-xs">
          <div>
            <label className="text-slate-300 block text-[11px] font-semibold mb-1">
              Indian / Home CGPA:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="4.0"
                max="10.0"
                step="0.1"
                value={indianCgpaInput}
                onChange={(e) => setIndianCgpaInput(Number(e.target.value))}
                className="w-24 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-slate-400 font-mono">/ {maxCgpaScale}</span>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block text-[11px] font-semibold mb-1">
              Max Score Scale:
            </label>
            <input
              type="number"
              value={maxCgpaScale}
              onChange={(e) => setMaxCgpaScale(Number(e.target.value))}
              className="w-20 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block text-[11px] font-semibold mb-1">
              Minimum Passing Mark:
            </label>
            <input
              type="number"
              value={minPassScale}
              onChange={(e) => setMinPassScale(Number(e.target.value))}
              className="w-20 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none"
            />
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-300 uppercase font-bold block">German Converted GPA:</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {applicantGpa.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 block text-right font-medium">
              (1.0 Best • 4.0 Pass)
            </span>
          </div>
        </div>
      </div>

      {activeViewTab === 'courses' ? (
        <CourseDirectory applicant={applicant} />
      ) : (
        <>
          {/* Comprehensive Filters Bar (Req 6) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search university, city, or field..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* State (Bundesland) Filter: All 16 German States */}
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-700 focus:outline-none"
                >
                  {ALL_GERMAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state === 'All States' ? '🏛️ All 16 German States' : `🇩🇪 ${state}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <select
                  value={selectedLanguageFilter}
                  onChange={(e: any) => {
                    setSelectedLanguageFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">🌐 All Instruction Languages</option>
                  <option value="ENGLISH">🇬🇧 100% English-Taught</option>
                  <option value="GERMAN">🇩🇪 German-Taught (B2/C1)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-700 focus:outline-none"
                >
                  <option value="match">🎯 Sort: Highest Bavarian Match</option>
                  <option value="rank">🏆 Sort: Global QS / THE Rank</option>
                  <option value="name">🔤 Sort: Alphabetical (A-Z)</option>
                  <option value="city">📍 Sort: By City</option>
                </select>
              </div>
            </div>

            {/* Slider Row: Bavarian Cutoff Slider & Tuition Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  Max Required Cutoff Limit:
                </span>
                <input
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.1"
                  value={maxCutoffFilter}
                  onChange={(e) => {
                    setMaxCutoffFilter(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-32 accent-sky-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  ≤ {maxCutoffFilter.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOnlyTuitionFree(!onlyTuitionFree);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                    onlyTuitionFree
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Euro className="w-3.5 h-3.5" /> €0 Public Tuition-Free
                </button>

                <span className="text-slate-400 font-medium">
                  Showing <strong>{filteredList.length}</strong> of <strong>{ALL_GERMAN_UNIVERSITIES.length}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* University Cards Grid */}
          {paginatedList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-xs text-slate-500">
              No institutions found matching current filter criteria. Try expanding the Bavarian cutoff slider.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedList.map((uni) => {
                const isShortlisted = shortlist.includes(uni.id);

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
                            uni.matchStatus === 'HIGH ADMISSION ODDS'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : uni.matchStatus === 'COMPETITIVE MATCH'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {uni.matchStatus === 'HIGH ADMISSION ODDS' ? '🟢 ' : uni.matchStatus === 'COMPETITIVE MATCH' ? '🟡 ' : '🔴 '}
                          {uni.matchStatus}
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
                            {uni.tuitionFeeEuro === 0 ? '€0 (Tuition-Free)' : `€${uni.tuitionFeeEuro.toLocaleString()} / sem`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Required German GPA:</span>
                          <span className="font-semibold text-slate-800">
                            ≤ {uni.minGermanGpa.toFixed(1)}{' '}
                            <span className="text-[10px] text-slate-400">
                              (Your GPA: {applicantGpa.toFixed(2)})
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
                        <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Popular Disciplines:</span>
                        <div className="flex flex-wrap gap-1">
                          {uni.popularFields.map((field, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Card Actions: Add to Target List & Visit */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      <button
                        onClick={() => toggleShortlistUni(uni.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                          isShortlisted
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                        }`}
                      >
                        {isShortlisted ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Shortlisted</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>+ Add to Target List</span>
                          </>
                        )}
                      </button>

                      <a
                        href={uni.website}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
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

      {/* Persistent Shortlist Drawer Modal (Req 6.1) */}
      {isShortlistDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-amber-500" />
                    <span>My University Shortlist ({shortlistedUniversities.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">Selected target institutions & admission checklists</span>
                </div>
                <button
                  onClick={() => setIsShortlistDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Shortlist Items */}
              {shortlistedUniversities.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 border border-dashed rounded-xl p-6">
                  Your shortlist is empty. Click <strong>[ + Add to My Target List ]</strong> on any university card to save your favorites here.
                </div>
              ) : (
                <div className="space-y-3">
                  {shortlistedUniversities.map((uni) => (
                    <div key={uni.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900">{uni.name}</div>
                          <div className="text-[11px] text-slate-500">{uni.city}, {uni.state}</div>
                        </div>
                        <button
                          onClick={() => toggleShortlistUni(uni.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="Remove from shortlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="bg-white rounded-lg p-2 border border-slate-200 text-[11px] space-y-1 font-mono">
                        <div className="flex justify-between">
                          <span>Required German GPA:</span>
                          <strong>≤ {uni.minGermanGpa.toFixed(1)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Tuition:</span>
                          <strong className="text-emerald-700">
                            {uni.tuitionFeeEuro === 0 ? '€0 Free' : `€${uni.tuitionFeeEuro}/sem`}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-1 text-[10px] text-slate-500 space-y-0.5">
                        <div>• Indian APS Certificate Required</div>
                        <div>• Degree Transcript Equivalence (Anabin H+)</div>
                        <div>• English C1 (IELTS 7.0) or German B2 Certification</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsShortlistDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
