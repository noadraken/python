import React, { useState, useEffect } from "react";
import { User, Class, Grade, Document, TeacherAnalytics } from "../types";
import { 
  GraduationCap, LogOut, Plus, Users, Mail, BookOpen, Upload, Download, 
  Trash2, RefreshCw, BarChart3, List, CheckCircle, FileText, Loader2, Sparkles, AlertTriangle 
} from "lucide-react";

interface TeacherPortalProps {
  user: User;
  onLogout: () => void;
}

export default function TeacherPortal({ user, onLogout }: TeacherPortalProps) {
  const [activeTab, setActiveTab] = useState<"classes" | "grading" | "documents">("classes");
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  
  // Create Class Form
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [classDesc, setClassDesc] = useState("");
  
  // Enroll Student Form
  const [studentEmail, setStudentEmail] = useState("");
  
  // Submit Grade Form
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [gradeTitle, setGradeTitle] = useState("");
  const [gradeScore, setGradeScore] = useState<number | "">("");
  
  // Document Upload Form
  const [docTitle, setDocTitle] = useState("");
  const [docFileBase64, setDocFileBase64] = useState("");
  const [docFileName, setDocFileName] = useState("");
  
  // Loading & Feedback States
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await fetch(`/api/teacher/classes/${user.id}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setClasses(data.classes);
        if (data.classes.length > 0 && !selectedClass) {
          // Auto select first class
          setSelectedClass(data.classes[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchClassDetails = async (cls: Class) => {
    setLoadingDetails(true);
    setFeedback(null);
    try {
      // Fetch students
      const resS = await fetch(`/api/teacher/class-students/${cls.id}`);
      const dataS = await resS.json();
      if (resS.ok && dataS.status === "success") {
        setStudents(dataS.students);
      }
      
      // Fetch grades
      const resG = await fetch(`/api/teacher/grades/${cls.id}`);
      const dataG = await resG.json();
      if (resG.ok && dataG.status === "success") {
        setGrades(dataG.grades);
      }

      // Fetch documents
      const resD = await fetch(`/api/documents/list/${cls.id}`);
      const dataD = await resD.json();
      if (resD.ok && dataD.status === "success") {
        setDocuments(dataD.documents);
      }
    } catch (err) {
      console.error("Error fetching class details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/teacher/analytics/${user.id}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Error fetching teacher analytics:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassDetails(selectedClass);
    }
  }, [selectedClass]);

  // Form submission: Create Class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !classCode) {
      setFeedback({ type: "error", text: "Name and Code are required." });
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          code: classCode,
          description: classDesc,
          teacher_id: user.id
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setFeedback({ type: "success", text: `Class ${className} created successfully!` });
        setClassName("");
        setClassCode("");
        setClassDesc("");
        fetchClasses();
        fetchAnalytics();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to create class." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Connection error." });
    } finally {
      setActionLoading(false);
    }
  };

  // Form submission: Enroll Student by Email
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !studentEmail) return;

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/teacher/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: selectedClass.id,
          email: studentEmail.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setFeedback({ type: "success", text: `Student ${studentEmail} enrolled successfully!` });
        setStudentEmail("");
        fetchClassDetails(selectedClass);
        fetchClasses(); // Refresh counts
      } else {
        setFeedback({ type: "error", text: data.message || "Enrollment failed." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Connection error." });
    } finally {
      setActionLoading(false);
    }
  };

  // Form submission: Submit Grade
  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudentId || !gradeTitle || gradeScore === "") return;

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/teacher/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudentId,
          class_id: selectedClass.id,
          title: gradeTitle,
          score: gradeScore,
          graded_by: user.id
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setFeedback({ type: "success", text: "Grade recorded successfully!" });
        setGradeTitle("");
        setGradeScore("");
        setSelectedStudentId("");
        fetchClassDetails(selectedClass);
        fetchAnalytics();
      } else {
        setFeedback({ type: "error", text: "Failed to record grade." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Connection error." });
    } finally {
      setActionLoading(false);
    }
  };

  // Read upload file base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocFileBase64(reader.result as string);
      setDocFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Form submission: Upload Document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !docTitle || !docFileBase64) {
      setFeedback({ type: "error", text: "Title and file select are required." });
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle,
          filename: docFileName,
          file_data_base64: docFileBase64,
          class_id: selectedClass.id,
          uploaded_by: user.id
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setFeedback({ type: "success", text: `Shared document "${docTitle}" successfully!` });
        setDocTitle("");
        setDocFileName("");
        setDocFileBase64("");
        // Reset file input if needed (handled simply)
        fetchClassDetails(selectedClass);
      } else {
        setFeedback({ type: "error", text: "Upload registering failed." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Connection error." });
    } finally {
      setActionLoading(false);
    }
  };

  const downloadDoc = async (doc: Document) => {
    try {
      const res = await fetch(`/api/documents/download/${doc.id}?student_id=${user.id}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        const linkSource = data.document.file_data_base64;
        const downloadLink = window.document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = data.document.filename;
        downloadLink.click();
      } else {
        alert(data.message || "Failed to download document.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred downloading document.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-slate-200">
      {/* Header bar */}
      <header className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-300 border border-indigo-500/30">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">Edura Academy</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Faculty workstation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-slate-400">Instructor Portfolio</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-2 px-3.5 rounded-xl cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8 z-10">
        
        {/* Left column: Classroom selection pane */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Instructed Curriculums</h3>
            
            {loadingClasses ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            ) : classes.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No active classes under your portfolio.</p>
            ) : (
              <div className="space-y-2">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-150 cursor-pointer text-sm font-semibold block ${
                      selectedClass?.id === cls.id
                        ? "bg-indigo-600/60 text-white border border-indigo-500/30 shadow-md shadow-indigo-950/20"
                        : "bg-white/5 text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {cls.code}
                      </span>
                      <span className="text-[10px] opacity-85">{cls.student_count || 0} enrolled</span>
                    </div>
                    <span className="block truncate">{cls.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Python-Pandas Dynamic Stats panel */}
          {analytics && analytics.has_data && (
            <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                Portfolio Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">High Score</span>
                  <span className="block text-md font-extrabold text-indigo-400 mt-1">{analytics.highest_score}%</span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Low Score</span>
                  <span className="block text-md font-extrabold text-slate-300 mt-1">{analytics.lowest_score}%</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">Class Grade Averages</span>
                <div className="space-y-2">
                  {Object.entries(analytics.class_averages || {}).map(([name, avg]) => (
                    <div key={name} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium truncate max-w-[130px]">{name}</span>
                      <strong className="text-white">{avg}%</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[9px] text-slate-400 font-mono text-right mt-1">*Compiled via Pandas Core</div>
            </div>
          )}

          {/* Create New Classroom widget */}
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Add New Course</h3>
            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Class Name (e.g. Chemistry)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full glass-input rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Unique Code (e.g. CHEM202)"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full glass-input rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <div>
                <textarea
                  placeholder="Course Description"
                  rows={2}
                  value={classDesc}
                  onChange={(e) => setClassDesc(e.target.value)}
                  className="w-full glass-input rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full flex justify-center items-center py-2.5 px-3 border border-transparent rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:bg-indigo-400/50 shadow-md shadow-indigo-600/15 transition-all"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Establish Course"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Tab workstation */}
        <div className="lg:col-span-3 space-y-6">
          
          {selectedClass ? (
            <div className="space-y-6">
              
              {/* Active Classroom Title Banner */}
              <div className="glass-panel border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                      {selectedClass.code}
                    </span>
                    <span className="text-xs text-slate-400">Class Ref: #{selectedClass.id}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">{selectedClass.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedClass.description || "No description provided."}</p>
                </div>

                {/* Sub tab navigation row */}
                <div className="flex p-1 bg-black/20 border border-white/5 rounded-xl shrink-0">
                  {[
                    { id: "classes", label: "Students Portal", icon: Users },
                    { id: "grading", label: "Grading Desk", icon: BarChart3 },
                    { id: "documents", label: "Study Materials", icon: FileText }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setFeedback(null);
                      }}
                      className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        activeTab === tab.id
                          ? "bg-white/10 text-white border border-white/10 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {feedback && (
                <div className={`p-4 rounded-xl text-sm border flex items-start gap-2.5 ${
                  feedback.type === "success" 
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                }`}>
                  <CheckCircle className={`h-4.5 w-4.5 shrink-0 ${feedback.type === "success" ? "text-emerald-400" : "text-rose-400"}`} />
                  <span>{feedback.text}</span>
                </div>
              )}

              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-2" />
                  <p className="text-sm font-medium">Synchronizing classroom matrix...</p>
                </div>
              ) : (
                <>
                  {/* WORKSTATION TABS VIEWPORT */}
                  
                  {activeTab === "classes" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left side: Enroll Student form */}
                      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg h-fit">
                        <div className="mb-4">
                          <h4 className="font-bold text-white text-sm">Enroll Student</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Invite student to course directory</p>
                        </div>
                        <form onSubmit={handleEnrollStudent} className="space-y-3.5">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Student Email Address
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="student@school.com"
                              value={studentEmail}
                              onChange={(e) => setStudentEmail(e.target.value)}
                              className="w-full glass-input rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full flex justify-center items-center py-2.5 px-3 border border-transparent rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/15"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll Student"}
                          </button>
                        </form>
                      </div>

                      {/* Right side: Student List Directory */}
                      <div className="glass-panel rounded-2xl shadow-lg overflow-hidden md:col-span-2">
                        <div className="px-5 py-3 border-b border-white/10 bg-black/20 flex justify-between items-center">
                          <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Class Enrolled Directory</h4>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 py-0.5 px-2 rounded-full font-bold">
                            {students.length} Students
                          </span>
                        </div>

                        {students.length === 0 ? (
                          <div className="p-12 text-center text-slate-400 text-xs">
                            No students enrolled in this classroom directory. Use the enrollment panel to add students.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10 text-xs">
                              <thead className="bg-black/10">
                                <tr>
                                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10 text-slate-300">
                                {students.map((stu) => (
                                  <tr key={stu.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-3.5 font-semibold text-white">{stu.name}</td>
                                    <td className="px-5 py-3.5">{stu.email}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "grading" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left side: Submit Grade input */}
                      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg h-fit">
                        <div className="mb-4">
                          <h4 className="font-bold text-white text-sm">Grading Ledger Input</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Submit student grade record</p>
                        </div>
                        <form onSubmit={handleAddGrade} className="space-y-3.5">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Target Student
                            </label>
                            <select
                              required
                              value={selectedStudentId}
                              onChange={(e) => setSelectedStudentId(e.target.value ? parseInt(e.target.value) : "")}
                              className="w-full bg-slate-900/80 border border-white/10 text-white rounded-xl py-2 px-3 text-xs focus:outline-none transition-all cursor-pointer"
                            >
                              <option value="">-- Choose Enrolled Student --</option>
                              {students.map((s) => (
                                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                  {s.name} ({s.email})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Evaluation Title
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Midterm, Final Quiz"
                              value={gradeTitle}
                              onChange={(e) => setGradeTitle(e.target.value)}
                              className="w-full glass-input rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Numeric Score (0 - 100)
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="85.5"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(e.target.value ? parseFloat(e.target.value) : "")}
                              className="w-full glass-input rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full flex justify-center items-center py-2.5 px-3 border border-transparent rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:bg-indigo-400/50 shadow-md shadow-indigo-600/15"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Grade"}
                          </button>
                        </form>
                      </div>

                      {/* Right side: Grade Records Table */}
                      <div className="glass-panel rounded-2xl shadow-lg overflow-hidden md:col-span-2">
                        <div className="px-5 py-3 border-b border-white/10 bg-black/20">
                          <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Evaluation Grades Log</h4>
                        </div>

                        {grades.length === 0 ? (
                          <div className="p-12 text-center text-slate-400 text-xs">
                            No evaluations have been graded in this class yet. Fill the grading input on the left to submit grades.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10 text-xs">
                              <thead className="bg-black/10">
                                <tr>
                                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Assignment Title</th>
                                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Graded Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10 text-slate-300">
                                {grades.map((g) => (
                                  <tr key={g.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-white">{g.student_name}</td>
                                    <td className="px-5 py-3">{g.title}</td>
                                    <td className="px-5 py-3 font-bold text-indigo-300">{g.score}%</td>
                                    <td className="px-5 py-3 text-slate-400">{new Date(g.graded_at).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "documents" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left side: Upload file form */}
                      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg h-fit">
                        <div className="mb-4">
                          <h4 className="font-bold text-white text-sm">Upload Study Material</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Share lectures or notes with enrolled students</p>
                        </div>
                        <form onSubmit={handleUploadDocument} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Document Title
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Unit 1 Calculus Syllabus"
                              value={docTitle}
                              onChange={(e) => setDocTitle(e.target.value)}
                              className="w-full glass-input rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Choose File
                            </label>
                            <input
                              type="file"
                              required
                              onChange={handleFileChange}
                              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border border-white/10 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/15 cursor-pointer"
                            />
                            {docFileName && (
                              <p className="text-[10px] text-slate-400 mt-1 truncate">Selected: {docFileName}</p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading || !docFileBase64}
                            className="w-full flex justify-center items-center py-2.5 px-3 border border-transparent rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:bg-indigo-400/50 shadow-md shadow-indigo-600/15"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share Document"}
                          </button>
                        </form>
                      </div>

                      {/* Right side: Shared Documents list */}
                      <div className="glass-panel rounded-2xl shadow-lg overflow-hidden md:col-span-2">
                        <div className="px-5 py-3 border-b border-white/10 bg-black/20">
                          <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Class Study Materials Library</h4>
                        </div>

                        {documents.length === 0 ? (
                          <div className="p-12 text-center text-slate-400 text-xs">
                            No files or study documents have been shared yet. Use the upload card to share learning documents.
                          </div>
                        ) : (
                          <div className="divide-y divide-white/10">
                            {documents.map((doc) => (
                              <div key={doc.id} className="p-4 hover:bg-white/5 flex justify-between items-center transition-colors">
                                <div className="flex items-start gap-2.5">
                                  <FileText className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="text-xs font-bold text-white">{doc.title}</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      File: {doc.filename} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => downloadDoc(doc)}
                                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition-all shadow-md shadow-indigo-600/10"
                                >
                                  <Download className="h-3 w-3" />
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </>
              )}

            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-white/10">
              <Sparkles className="h-12 w-12 mx-auto text-indigo-400 mb-3" />
              <h3 className="text-white font-bold mb-1">Select or Establish a Class</h3>
              <p className="text-xs max-w-sm mx-auto">Welcome! Select one of your classes from the left column, or fill the Establishment form to create a new curriculum portfolio.</p>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
