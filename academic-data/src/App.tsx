import { useState, useRef, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import {
  initialSubjects,
  initialStudents,
  initialRawScores,
  processAcademicData,
  getGradeAndPoints
} from './data';
import { Subject, Student, RawScore } from './types';
import MetricCard from './components/MetricCard';
import DataTables from './components/DataTables';
import CodeViewer from './components/CodeViewer';
import StudentReportGenerator from './components/StudentReportGenerator';
import {
  Calculator,
  Users,
  BookOpen,
  Database,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  Award,
  ChevronRight,
  Code
} from 'lucide-react';

export default function App() {
  // Master Lists state (defaults loaded from data.ts)
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [rawScores, setRawScores] = useState<RawScore[]>(initialRawScores);

  // Sheet configuration selector
  const [activeSheet, setActiveSheet] = useState<'subjects' | 'students' | 'rawScores'>('subjects');

  // Main interactive workflow tab
  const [activeMainTab, setActiveMainTab] = useState<'raw' | 'merge' | 'report'>('raw');

  // Highlight step inside python code viewer
  const [highlightedStep, setHighlightedStep] = useState<string | null>(null);

  // File upload auxiliary states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // TS processed calculations
  const { mergedRecords, gpaReport, averageGPA } = processAcademicData(subjects, students, rawScores);

  // Master List Add & Delete Handlers
  const handleAddSubject = (newSub: Subject) => {
    setSubjects(prev => [...prev, newSub]);
    showBriefSuccess('Subject successfully added to df_subjects!');
  };

  const handleDeleteSubject = (code: string) => {
    setSubjects(prev => prev.filter(s => s.Code !== code));
    // Cleanly cascade delete rawScores for deleted subject code
    setRawScores(prev => prev.filter(s => s.SubjectCode !== code));
    showBriefSuccess('Subject deleted and cascaded raw scores!');
  };

  const handleAddStudent = (newStu: Student) => {
    setStudents(prev => [...prev, newStu]);
    showBriefSuccess('Student successfully added to df_students!');
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.StudentID !== id));
    // Cascade delete rawScores for student
    setRawScores(prev => prev.filter(s => s.StudentID !== id));
    showBriefSuccess('Student deleted and cascaded raw scores!');
  };

  const handleAddScore = (newScore: RawScore) => {
    setRawScores(prev => [...prev, newScore]);
    showBriefSuccess('Score successfully recorded in df_scores!');
  };

  const handleDeleteScore = (id: number) => {
    setRawScores(prev => prev.filter(s => s.ID !== id));
    showBriefSuccess('Raw score deleted!');
  };

  const showBriefSuccess = (message: string) => {
    setUploadSuccess(message);
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  // Import workbook using Reader API
  const handleExcelUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        let importedSubjects: Subject[] = [];
        let importedStudents: Student[] = [];
        let importedRawScores: RawScore[] = [];

        // Parse and resolve sheets
        if (workbook.SheetNames.includes('Subjects')) {
          const sheet = workbook.Sheets['Subjects'];
          importedSubjects = XLSX.utils.sheet_to_json<Subject>(sheet);
        }
        if (workbook.SheetNames.includes('Students')) {
          const sheet = workbook.Sheets['Students'];
          importedStudents = XLSX.utils.sheet_to_json<Student>(sheet);
        }
        if (workbook.SheetNames.includes('RawScores')) {
          const sheet = workbook.Sheets['RawScores'];
          importedRawScores = XLSX.utils.sheet_to_json<RawScore>(sheet);
        }

        // Validate structure requirements
        if (importedSubjects.length === 0 && importedStudents.length === 0 && importedRawScores.length === 0) {
          throw new Error('No matching sheets ("Subjects", "Students", "RawScores") found inside. Check upload file formats!');
        }

        if (importedSubjects.length > 0) {
          // Verify valid columns exist
          const hasKeys = importedSubjects.every(s => 'Code' in s && 'SubjectName' in s && 'SKS' in s);
          if (!hasKeys) throw new Error('Subjects sheet must contain columns: "Code", "SubjectName", "SKS"');
          setSubjects(importedSubjects);
        }

        if (importedStudents.length > 0) {
          const hasKeys = importedStudents.every(s => 'StudentID' in s && 'StudentName' in s && 'Group' in s);
          if (!hasKeys) throw new Error('Students sheet must contain columns: "StudentID", "StudentName", "Group"');
          setStudents(importedStudents);
        }

        if (importedRawScores.length > 0) {
          const hasKeys = importedRawScores.every(s => 'SubjectCode' in s && 'StudentID' in s && 'Score' in s);
          if (!hasKeys) throw new Error('RawScores sheet must contain columns: "SubjectCode", "StudentID", "Score"');
          // Add dummy IDs if they don't exist
          const withIDs = importedRawScores.map((s, idx) => ({
            ...s,
            ID: s.ID || idx + 1
          }));
          setRawScores(withIDs);
        }

        setUploadSuccess(`Spreadsheet uploaded! Successfully loaded ${importedSubjects.length} subjects, ${importedStudents.length} students, and ${importedRawScores.length} raw scores.`);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to read spreadsheet file.');
      }
    };

    reader.readAsArrayBuffer(file);
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset Workbook to defaults
  const handleResetToDefaults = () => {
    setSubjects(initialSubjects);
    setStudents(initialStudents);
    setRawScores(initialRawScores);
    setUploadSuccess('Reset to baseline dataset!');
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  // Download raw spreadsheet helper
  const handleDownloadInputBook = () => {
    const wb = XLSX.utils.book_new();

    const wsSubjects = XLSX.utils.json_to_sheet(subjects);
    const wsStudents = XLSX.utils.json_to_sheet(students);
    const wsScores = XLSX.utils.json_to_sheet(rawScores);

    XLSX.utils.book_append_sheet(wb, wsSubjects, 'Subjects');
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Students');
    XLSX.utils.book_append_sheet(wb, wsScores, 'RawScores');

    XLSX.writeFile(wb, 'academic_data.xlsx');
  };

  // Download GPA_Report aggregated workbook helper
  const handleDownloadProcessedBook = () => {
    const wb = XLSX.utils.book_new();

    const wsSubjects = XLSX.utils.json_to_sheet(subjects);
    const wsStudents = XLSX.utils.json_to_sheet(students);
    const wsScores = XLSX.utils.json_to_sheet(rawScores);

    const formattedReport = gpaReport.map(item => ({
      StudentID: item.StudentID,
      StudentName: item.StudentName,
      Group: item.Group,
      TotalSKS: item.TotalSKS,
      GPA: item.GPA,
      SubjectsTaken: item.SubjectsTaken
    }));

    const wsGPA = XLSX.utils.json_to_sheet(formattedReport);

    XLSX.utils.book_append_sheet(wb, wsSubjects, 'Subjects');
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Students');
    XLSX.utils.book_append_sheet(wb, wsScores, 'RawScores');
    XLSX.utils.book_append_sheet(wb, wsGPA, 'GPA_Report');

    XLSX.writeFile(wb, 'academic_data_processed.xlsx');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Professional Polish Top Header navigation bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex-shrink-0 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">Academic Analytics Pro</span>
              <span className="text-xs text-slate-400 font-medium">| Excel Processor</span>
              <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono font-bold tracking-wider uppercase">
                Pandas Engine
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Dataframe join operations &amp; weighted GPA aggregator indexer
            </p>
          </div>
        </div>

        {/* Dynamic header button actions & Status badges */}
        <div className="flex items-center gap-3">
          {/* Action Tools */}
          <div className="hidden sm:flex items-center bg-slate-850 p-1 rounded-lg border border-slate-800 gap-1 mr-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Import local spreadsheet containing Subjects, Students, RawScores"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={handleDownloadInputBook}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Download unmodified sheets template workbook"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download Template</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 hover:border-rose-900 text-slate-400 border border-slate-750 text-xs font-semibold rounded-md transition cursor-pointer"
              title="Reset workbook tables back to default mock records"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* System version and initials visual badge */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <span className="hidden md:inline-block text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono font-medium">
              v2.4.0-stable
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-600 text-blue-50 flex items-center justify-center text-xs font-bold shadow-md select-none border border-blue-500/20" title="Active Academic Session Admin">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main content container involving Left Sidebar + Body Viewport */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left Sidebar Navigator */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 justify-between flex-shrink-0 z-10 select-none">
          <div className="space-y-6">
            {/* Top segment for action items on mobile */}
            <div className="block sm:hidden space-y-2 border-b border-slate-100 pb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Actions</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Import Excel</span>
              </button>
              <button
                onClick={handleDownloadInputBook}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Template</span>
              </button>
              <button
                onClick={handleResetToDefaults}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Reset Baseline</span>
              </button>
            </div>

            {/* Workflow navigation block */}
            <nav className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-2">
                Pipeline Modules
              </div>
              
              <button
                onClick={() => setActiveMainTab('raw')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMainTab === 'raw'
                    ? 'text-blue-700 bg-blue-50/80 border-l-2 border-blue-600 pl-2.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className={`w-4 h-4 ${activeMainTab === 'raw' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>1. Input Data Sheets</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>

              <button
                onClick={() => setActiveMainTab('merge')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMainTab === 'merge'
                    ? 'text-blue-700 bg-blue-50/80 border-l-2 border-blue-600 pl-2.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${activeMainTab === 'merge' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>2. Merged DataFrame</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>

              <button
                onClick={() => setActiveMainTab('report')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMainTab === 'report'
                    ? 'text-blue-700 bg-blue-50/80 border-l-2 border-blue-600 pl-2.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className={`w-4 h-4 ${activeMainTab === 'report' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>3. GPA_Report Sheet</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>
            </nav>

            {/* Workbook Sheets sub-selector */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-2">
                Workbook Sheets
              </div>
              <button
                onClick={() => {
                  setActiveMainTab('raw');
                  setActiveSheet('subjects');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeMainTab === 'raw' && activeSheet === 'subjects'
                    ? 'bg-slate-100/80 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeMainTab === 'raw' && activeSheet === 'subjects' ? 'bg-violet-500' : 'bg-slate-300'}`}></div>
                <span>Subjects</span>
              </button>

              <button
                onClick={() => {
                  setActiveMainTab('raw');
                  setActiveSheet('students');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeMainTab === 'raw' && activeSheet === 'students'
                    ? 'bg-slate-100/80 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeMainTab === 'raw' && activeSheet === 'students' ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                <span>Students</span>
              </button>

              <button
                onClick={() => {
                  setActiveMainTab('raw');
                  setActiveSheet('rawScores');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeMainTab === 'raw' && activeSheet === 'rawScores'
                    ? 'bg-slate-100/80 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeMainTab === 'raw' && activeSheet === 'rawScores' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                <span>RawScores</span>
              </button>
            </div>
          </div>

          {/* Active stack indicator at the bottom matching professional theme */}
          <div className="pt-4 border-t border-slate-150">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[9.5px] text-slate-400 mb-1 font-bold leading-none uppercase tracking-wider">
                Active Environment
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
                <span className="text-xs font-mono text-slate-700 font-bold">Python 3.11 / Pandas</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Viewport Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top dynamic success or danger alert indicators */}
          {(uploadSuccess || uploadError) && (
            <div className="transition-all duration-300 animate-in fade-in-50 duration-200">
              {uploadSuccess && (
                <div className="p-3.5 px-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
              {uploadError && (
                <div className="p-3.5 px-5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                  <Info className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Academic Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              id="stat-gpa"
              title="Class Avg GPA"
              value={`${averageGPA.toFixed(2)}`}
              icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
              subtitle="Weighted on SKS load metrics"
              trend="+0.12 FROM INITIAL"
              color="green"
            />
            <MetricCard
              id="stat-students"
              title="Registered Cohorts"
              value={`${students.length}`}
              icon={<Users className="w-4 h-4 text-indigo-500" />}
              subtitle={`Counts df_students dataframe`}
              color="purple"
            />
            <MetricCard
              id="stat-subjects"
              title="Course Catalog"
              value={`${subjects.length}`}
              icon={<BookOpen className="w-4 h-4 text-amber-500" />}
              subtitle="Course credits (SKS) index"
              color="amber"
            />
            <MetricCard
              id="stat-scores"
              title="Export Status"
              value="Export Ready"
              icon={<Download className="w-4 h-4" />}
              subtitle="Target: GPA_Report.xlsx"
              onClick={handleDownloadProcessedBook}
              color="blue"
            />
          </div>

          {/* Central Workspace Division */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Excel Sheets Interface or Pandas Calculation Visuals */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                {/* Table Header Section */}
                <div className="flex bg-slate-50 border-b border-slate-200 p-4 justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold text-slate-950 tracking-tight flex items-center gap-2 uppercase">
                      {activeMainTab === 'raw' && 'Workbook Sheet Workspace'}
                      {activeMainTab === 'merge' && 'Relational DataFrame Join Result'}
                      {activeMainTab === 'report' && 'Sheet View: GPA_Report'}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activeMainTab === 'raw' && 'Modify records representing simulated source sheet structures.'}
                      {activeMainTab === 'merge' && 'Join output dynamically calculated by Pandas merge actions.'}
                      {activeMainTab === 'report' && 'Calculated weighted index target rows ready for export script.'}
                    </p>
                  </div>

                  {/* High visual correlation signature */}
                  <div className="text-[10px] text-slate-400 font-mono font-bold uppercase block pr-1 select-none">
                    {activeMainTab === 'raw' && `Sheet: ${activeSheet}`}
                    {activeMainTab === 'merge' && 'df_joined'}
                    {activeMainTab === 'report' && 'df_gpa_report'}
                  </div>
                </div>

                {/* Sub-panels inside the frame */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-5">
                  
                  {/* Dynamic render tab content */}
                  {activeMainTab === 'raw' && (
                    <div className="h-full flex flex-col justify-between">
                      <DataTables
                        subjects={subjects}
                        students={students}
                        rawScores={rawScores}
                        onAddSubject={handleAddSubject}
                        onDeleteSubject={handleDeleteSubject}
                        onAddStudent={handleAddStudent}
                        onDeleteStudent={handleDeleteStudent}
                        onAddScore={handleAddScore}
                        onDeleteScore={handleDeleteScore}
                        activeSheet={activeSheet}
                        setActiveSheet={setActiveSheet}
                      />
                    </div>
                  )}

                  {activeMainTab === 'merge' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[360px] bg-white">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                              <th className="py-2.5 px-4 font-mono font-medium text-slate-400">ID</th>
                              <th className="py-2.5 px-4">Student</th>
                              <th className="py-2.5 px-4">Subject</th>
                              <th className="py-2.5 px-4 text-center">Score</th>
                              <th className="py-2.5 px-4 text-center">Grade</th>
                              <th className="py-2.5 px-4 text-center font-mono">Points</th>
                              <th className="py-2.5 px-4 text-center font-mono animate-pulse">SKS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                            {mergedRecords.map((item) => (
                              <tr key={item.ID} className="hover:bg-slate-50/50 transition">
                                <td className="py-2.5 px-4 font-mono text-slate-400">{item.ID}</td>
                                <td className="py-2.5 px-4">
                                  <span className="font-bold text-slate-800 block text-xs">{item.StudentName}</span>
                                  <span className="text-[9.5px] text-slate-400 block font-mono font-medium">
                                    {item.StudentID} • Group {item.Group}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4">
                                  <span className="font-semibold block text-slate-700">{item.SubjectName}</span>
                                  <span className="text-[9.5px] text-blue-600 block font-mono font-bold">
                                    {item.SubjectCode}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                                  {item.Score}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`inline-block px-1.5 py-0.5 rounded font-extrabold text-[11px] text-center border font-mono ${
                                    item.Grade === 'A' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                    item.Grade === 'B' ? 'bg-blue-50 text-blue-800 border-blue-250' :
                                    item.Grade === 'C' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                    item.Grade === 'D' ? 'bg-orange-50 text-orange-850 border-orange-200' :
                                    'bg-rose-50 text-rose-800 border-rose-250'
                                  }`}>
                                    {item.Grade}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-600 bg-emerald-50/20">
                                  {item.GradePoints.toFixed(1)}
                                </td>
                                <td className="py-2.5 px-4 text-center font-mono text-slate-500">
                                  {item.SKS}
                                </td>
                              </tr>
                            ))}
                            {mergedRecords.length === 0 && (
                              <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-400">
                                  Could not generate analytical table. Complete registry lists to configure relational joins!
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Visual explanation drawer inline */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-bold text-slate-900 block mb-0.5">Relational Merger Sequence</span>
                          Pandas connects source sheets seamlessly using ID indices representing relation tables. In Python, this is executed under the hood via standard DataFrame mapping:
                          <code className="block mt-1.5 bg-slate-950 text-slate-350 p-2 rounded font-mono text-[10px]">
                            df_merged = pd.merge(df_scores, df_students, on=&quot;StudentID&quot;)
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeMainTab === 'report' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[360px] bg-white">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-5 font-mono">StudentID</th>
                              <th className="py-3 px-5">Student Name</th>
                              <th className="py-3 px-5 text-center">Group</th>
                              <th className="py-3 px-5 text-center font-mono">Total SKS</th>
                              <th className="py-3 px-5 text-center font-mono">Courses</th>
                              <th className="py-3 px-5 text-center font-mono">GPA (IPK)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                            {gpaReport.map((rep) => (
                              <tr key={rep.StudentID} className="hover:bg-slate-50/50 transition">
                                <td className="py-3 px-5 font-mono font-bold text-slate-900">{rep.StudentID}</td>
                                <td className="py-3 px-5 font-bold text-slate-800">{rep.StudentName}</td>
                                <td className="py-3 px-5 text-center">
                                  <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {rep.Group}
                                  </span>
                                </td>
                                <td className="py-3 px-5 text-center font-mono text-slate-500 font-bold">{rep.TotalSKS} Credits</td>
                                <td className="py-3 px-5 text-center font-mono text-slate-500">{rep.SubjectsTaken}</td>
                                <td className="py-3 px-5 text-center font-mono">
                                  <span className={`px-2.5 py-1 rounded font-extrabold text-[11px] text-center border ${
                                    rep.GPA >= 3.5 ? 'bg-emerald-50 text-emerald-800 border-emerald-250/70' :
                                    rep.GPA >= 3.0 ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                    rep.GPA >= 2.0 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                    rep.GPA > 0.0 ? 'bg-orange-50 text-orange-850 border-orange-200' :
                                    'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}>
                                    {rep.GPA.toFixed(2)} / 4.00
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Math/Pandas explain formula */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex gap-3">
                        <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest font-mono">Weighted GPA (IPK) Group Strategy</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Pandas multiplies GradePoints with credits hours (SKS) index factors to evaluate accurate academic weights, avoiding basic division anomalies:
                            <span className="block my-2 font-bold bg-white border border-slate-200 p-2 rounded font-mono text-center text-slate-800 text-xs">
                              GPA (IPK) = ∑(GradePoints × SKS) ÷ ∑(SKS)
                            </span>
                            Click the **Export Status** button inside the top statistics panel at any time to generated a finalized output sheet!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Right Column: PDF Transcript Generator & Pandas Code Guide */}
            <div className="lg:col-span-5 flex flex-col space-y-5 h-full overflow-y-auto pr-1">
              <StudentReportGenerator
                students={students}
                mergedRecords={mergedRecords}
                gpaReport={gpaReport}
              />
              <CodeViewer
                highlightedStep={highlightedStep}
                onHighlightStep={(stepId) => setHighlightedStep(stepId)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* 4. Bottom Professional Polish Status Bar Grid */}
      <footer className="bg-slate-900 border-t border-slate-800/80 px-6 py-2 flex-shrink-0 text-[11px] text-slate-400 font-mono flex items-center justify-between z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse"></span>
            <span>Workbook: academic_data.xlsx</span>
          </div>
          <span className="hidden md:inline-block text-slate-600">|</span>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500">Pandas.Merge:</span>
            <span className="text-slate-300 font-bold">SUCCESS</span>
          </div>
          <span className="hidden md:inline-block text-slate-600">|</span>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500">Method:</span>
            <span className="text-slate-300 font-bold">calc_weighted_average</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">Ready to Export</div>
          <span className="text-slate-600">|</span>
          <div className="font-bold text-slate-300">RAM: 142MB</div>
        </div>
      </footer>
    </div>
  );
}

