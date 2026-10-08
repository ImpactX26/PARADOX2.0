import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  MapPin, 
  Euro, 
  GraduationCap, 
  Award, 
  Filter, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Building,
  Info,
  X
} from 'lucide-react';
import { GermanCourse, ApplicantRecord } from '../types';
import { ACCREDITED_GERMAN_COURSES } from '../data/germanCoursesData';

interface CourseDirectoryProps {
  applicant: ApplicantRecord | null;
  onSelectCourse?: (course: GermanCourse) => void;
  isCompact?: boolean;
}

export const CourseDirectory: React.FC<CourseDirectoryProps> = ({
  applicant,
  onSelectCourse,
  isCompact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEnglishOnly, setFilterEnglishOnly] = useState<boolean>(false);
  const [filterTuitionFree, setFilterTuitionFree] = useState<boolean>(false);
  const [filterDegreeType, setFilterDegreeType] = useState<'ALL' | 'B.Sc.' | 'M.Sc.'>('ALL');
  const [filterTu9Only, setFilterTu9Only] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCourseModal, setSelectedCourseModal] = useState<(GermanCourse & { matchLabel: string; badgeColor: string; diff: number; matchStatus: string }) | null>(null);

  // Applicant Bavarian GPA (default to 2.2 if not set, allow interactive tuning)
  const defaultApplicantGpa = applicant?.education?.germanGrade || 2.2;
  const [customGpa, setCustomGpa] = useState<number>(defaultApplicantGpa);

  const categories = [
    'ALL',
    'Informatics & AI',
    'Automotive & Mechanical',
    'Data Science',
    'Biomedical & Healthcare',
    'Renewable Energy',
    'Business & Management',
  ];

  // Match calculations
  const processedCourses = useMemo(() => {
    return ACCREDITED_GERMAN_COURSES.map((course) => {
      // In German grading, 1.0 is highest and 4.0 is passing.
      // A course minAdmissionGpa of 2.0 means applicants with German GPA <= 2.0 meet cutoff.
      // diff = cutoff - applicantGpa. If diff > 0, applicant is better than cutoff.
      const diff = course.minAdmissionGpa - customGpa;
      let matchStatus: 'STRONG_MATCH' | 'COMPETITIVE' | 'REACH' = 'COMPETITIVE';
      let matchLabel = '🟡 Competitive / Match';
      let badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';

      if (diff >= 0.2) {
        matchStatus = 'STRONG_MATCH';
        matchLabel = '🟢 Strong Admission Chance';
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      } else if (diff < -0.2) {
        matchStatus = 'REACH';
        matchLabel = '🔴 High Competition / Reach';
        badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
      }

      return {
        ...course,
        diff,
        matchStatus,
        matchLabel,
        badgeColor,
      };
    });
  }, [customGpa]);

  // Filtered list
  const filteredList = useMemo(() => {
    return processedCourses.filter((course) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        course.courseName.toLowerCase().includes(q) ||
        course.university.toLowerCase().includes(q) ||
        course.city.toLowerCase().includes(q) ||
        course.fieldCategory.toLowerCase().includes(q);

      // Filters
      const matchesEnglish = filterEnglishOnly ? course.language.includes('English') : true;
      const matchesTuition = filterTuitionFree ? course.tuitionFeeEuro === 0 : true;
      const matchesDegree = filterDegreeType === 'ALL' || course.degreeType === filterDegreeType;
      const matchesTu9 = filterTu9Only ? course.tu9 : true;
      const matchesCat = selectedCategory === 'ALL' || course.fieldCategory === selectedCategory;

      return matchesSearch && matchesEnglish && matchesTuition && matchesDegree && matchesTu9 && matchesCat;
    });
  }, [processedCourses, searchQuery, filterEnglishOnly, filterTuitionFree, filterDegreeType, filterTu9Only, selectedCategory]);

  return (
    <div className={`space-y-6 ${isCompact ? 'p-2' : ''}`}>
      {/* Top Banner & Interactive Bavarian Formula Matcher */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide mb-2">
              <Sparkles className="w-3 h-3 text-slate-950" /> DAAD & Hochschulkompass Live Directory
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Accredited German Degree Programs & Universities
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Explore state-accredited Bachelor's & Master's curricula across TUM, RWTH Aachen, KIT, and Heidelberg with real-time German GPA cutoff matching.
            </p>
          </div>

          {/* Interactive Bavarian GPA Tuner */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-xs min-w-[240px]">
            <div className="flex items-center justify-between font-semibold mb-1 text-sky-200">
              <span>Your German GPA:</span>
              <strong className="text-lg text-amber-300 font-black">{customGpa.toFixed(2)}</strong>
            </div>
            <div className="text-[10px] text-slate-300 mb-2">
              (1.0 German Best • 4.0 Passing Cutoff)
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.05"
              value={customGpa}
              onChange={(e) => setCustomGpa(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
              <span>1.0 (Top)</span>
              <span>2.5 (Average)</span>
              <span>3.5 (Pass)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Chips */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course name, keyword (e.g. AI, Automotive, Nursing), university, or city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
          />
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-sky-600" /> Filters:
          </span>

          {/* 100% English Taught */}
          <button
            onClick={() => setFilterEnglishOnly(!filterEnglishOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterEnglishOnly
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🇬🇧 100% English Taught
          </button>

          {/* €0 Tuition Free */}
          <button
            onClick={() => setFilterTuitionFree(!filterTuitionFree)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterTuitionFree
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            💶 €0 Tuition Free (Public)
          </button>

          {/* Degree Filter */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setFilterDegreeType('ALL')}
              className={`px-2.5 py-1 rounded-lg ${filterDegreeType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
            >
              All Degrees
            </button>
            <button
              onClick={() => setFilterDegreeType('B.Sc.')}
              className={`px-2.5 py-1 rounded-lg ${filterDegreeType === 'B.Sc.' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
            >
              Bachelor (180 ECTS)
            </button>
            <button
              onClick={() => setFilterDegreeType('M.Sc.')}
              className={`px-2.5 py-1 rounded-lg ${filterDegreeType === 'M.Sc.' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
            >
              Master (120 ECTS)
            </button>
          </div>

          {/* TU9 Universities */}
          <button
            onClick={() => setFilterTu9Only(!filterTu9Only)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterTu9Only
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🏛️ TU9 German Tech Elite
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat === 'ALL' ? 'All Disciplines' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredList.length}</strong> accredited degree programs matching your criteria
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strong Match
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> Competitive
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" /> High Reach
        </span>
      </div>

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
          >
            <div>
              {/* Top Badges */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${course.badgeColor}`}>
                  {course.matchLabel}
                </span>

                {course.tu9 && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    TU9 Elite
                  </span>
                )}
              </div>

              {/* Course Title */}
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                {course.courseName}
              </h3>

              {/* University & City */}
              <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{course.university}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{course.city}, {course.state}</span>
              </div>

              {/* Description Snippet */}
              <p className="text-[11px] text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                {course.description}
              </p>

              {/* Attributes Strip */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Tuition Fee:</span>
                  <strong className="text-slate-800 truncate block">
                    {course.tuitionFeeEuro === 0 ? '€0 Tuition Free' : `€${course.tuitionFeeEuro}/semester`}
                  </strong>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Language:</span>
                  <strong className="text-slate-800 truncate block">{course.language}</strong>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Min. GPA Cutoff:</span>
                  <strong className="text-sky-700">{course.minAdmissionGpa.toFixed(1)}</strong>
                  <span className="text-slate-400 text-[10px]"> (Bavaria)</span>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Rankings:</span>
                  <strong className="text-indigo-700">CHE {course.officialRankings.cheRating}</strong>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> {course.applicationDeadlines.winter}
              </span>

              <button
                onClick={() => setSelectedCourseModal(course)}
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                Inspect Curriculum <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedCourseModal(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                  {selectedCourseModal.degreeType} • {selectedCourseModal.ectCredits} ECTS Credits
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${selectedCourseModal.badgeColor}`}>
                  {selectedCourseModal.matchLabel}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{selectedCourseModal.courseName}</h2>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                {selectedCourseModal.university} • {selectedCourseModal.city}, {selectedCourseModal.state}
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 mb-1">Academic Profile & Focus:</h4>
              {selectedCourseModal.description}
            </div>

            {/* Admission Requirements */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Official Admission Requirements & Verification Protocol:
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 pl-2">
                {selectedCourseModal.admissionRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sky-600 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deadlines & Rankings */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs bg-sky-50/50 p-3.5 rounded-xl border border-sky-100">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Application Windows:</span>
                <div className="mt-1 space-y-0.5 text-slate-800">
                  <div>• Winter Semester: <strong>{selectedCourseModal.applicationDeadlines.winter}</strong></div>
                  <div>• Summer Semester: <strong>{selectedCourseModal.applicationDeadlines.summer}</strong></div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Official Rankings:</span>
                <div className="mt-1 space-y-0.5 text-slate-800">
                  <div>• CHE Center for Higher Ed: <strong>{selectedCourseModal.officialRankings.cheRating}</strong></div>
                  <div>• QS Europe Ranking: <strong>#{selectedCourseModal.officialRankings.qsEuropeRank}</strong></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (onSelectCourse) onSelectCourse(selectedCourseModal);
                  setSelectedCourseModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <GraduationCap className="w-4 h-4" /> Add to Target University Shortlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
