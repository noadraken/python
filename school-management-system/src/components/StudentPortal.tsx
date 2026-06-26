import React, { useState, useEffect } from "react";
import { User, Class, Grade, Document, StudentAnalytics } from "../types";
import { 
  GraduationCap, LogOut, PlusCircle, Search, FileText, Download, 
  BarChart3, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Loader2, BookOpen, Star 
} from "lucide-react";

interface StudentPortalProps {
  user: User;
  onLogout: () => void;
}

export default function StudentPortal({ user, onLogout }: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<"classes" | "grades">("classes");
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  
  // Join Class Form
  const [joinCode, setJoinCode] = useState("");
  
  // Loading & Feedback States
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStudentData = async () => {
    setLoadingCourses(true);
    setFeedback(null);
    try {
      // Enrolled classes
      const resC = await fetch(`/api/student/classes/${user.id}`);
      const dataC = await resC.json();
      if (resC.ok && dataC.status === "success") {
        setEnrolledClasses(dataC.classes);
        if (dataC.classes.length > 0 && !selectedClass) {
          setSelectedClass(dataC.classes[0]);
        }
      }

      // Grades
      const resG = await fetch(`/api/student/grades/${user.id}`);
      const dataG = await resG.json();
      if (resG.ok && dataG.status === "success") {
        setGrades(dataG.grades);
      }

      // Analytics (Pandas comparative analytics)
      const resA = await fetch(`/api/student/analytics/${user.id}`);
      const dataA = await resA.json();
      if (resA.ok && dataA.status === "success") {
        setAnalytics(dataA.analytics);
      }
    } catch (err) {
      console.error("Error fetching student profile data:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchClassDocuments = async (cls: Class) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/documents/list/${cls.id}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Error fetching class files:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassDocuments(selectedClass);
    }
  }, [selectedClass]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/student/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.id,
          code: joinCode.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setFeedback({ type: "success", text: data.message });
        setJoinCode("");
        fetchStudentData(); // Reload student classes and stats
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to join class." });
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
        alert(data.message || "Access denied: You must be enrolled in this class to access materials.");
      }
    } catch (err) {
      console.error(err);
      alert("Error downloading study material.");
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
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">Edura Academy</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Student Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-slate-400">Academic Portfolio</span>
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
        
        {/* Left column: Join course, GPA, and course lists */}
        <div className="space-y-6">
          {/* GPA representation card */}
          {analytics && analytics.has_data && (
            <div className="bg-gradient-to-br from-indigo-600/50 via-indigo-700/40 to-slate-900/60 rounded-2xl p-6 text-white border border-indigo-500/30 shadow-lg shadow-indigo-950/20 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute right-0 bottom-0 opacity-10">
                <GraduationCap className="h-32 w-32 text-indigo-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Grade Point Average
              </span>
              <h3 className="text-4xl font-extrabold mt-3">{analytics.student_average}%</h3>
              <p className="text-xs text-indigo-200 mt-2">Aggregate performance score computed school-wide</p>
              
              <div className="flex items-center gap-1.5 text-[10px] font-bold mt-4 text-emerald-400">
                <Star className="h-3.5 w-3.5 fill-emerald-400/20 text-emerald-400" />
                Sustaining good academic standing
              </div>
            </div>
          )}

          {/* Join Course code Widget */}
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Join Class by Code</h3>
            <form onSubmit={handleJoinClass} className="space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. MATH101"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="pl-9 w-full glass-input rounded-xl py-2 px-3 text-xs uppercase font-bold focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full flex justify-center items-center py-2.5 px-3 border border-transparent rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:bg-indigo-400/50 shadow-md shadow-indigo-600/15 transition-all"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll in Course"}
              </button>
            </form>
          </div>

          {/* Registered Course list */}
          <div className="glass-panel rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Enrolled Classes</h3>
            {loadingCourses ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            ) : enrolledClasses.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">You are not enrolled in any classes yet. Join using a class code above!</p>
            ) : (
              <div className="space-y-2">
                {enrolledClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setSelectedClass(cls);
                      setActiveTab("classes");
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all block cursor-pointer ${
                      selectedClass?.id === cls.id && activeTab === "classes"
                        ? "bg-white/10 text-white border-l-4 border-indigo-500 pl-2.5"
                        : "bg-white/5 text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span className="block text-[10px] uppercase text-indigo-300 font-extrabold mb-0.5">{cls.code}</span>
                    <span className="block truncate">{cls.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Main workbench */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Workstation Header and Switch tabs */}
          <div className="glass-panel rounded-2xl p-5 shadow-lg flex justify-between items-center">
            <div>
              <h2 className="text-md font-bold text-white">Academic Workspace</h2>
              <p className="text-xs text-slate-400 mt-0.5">Check documents and evaluations</p>
            </div>

            <div className="flex p-1 bg-black/20 border border-white/5 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab("classes");
                  setFeedback(null);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-4 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  activeTab === "classes"
                    ? "bg-white/10 text-white border border-white/10 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Classroom Materials
              </button>
              <button
                onClick={() => {
                  setActiveTab("grades");
                  setFeedback(null);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-4 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  activeTab === "grades"
                    ? "bg-white/10 text-white border border-white/10 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Grades & Progress
              </button>
            </div>
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl text-xs border flex items-start gap-2.5 ${
              feedback.type === "success" 
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-300 border-rose-500/20"
            }`}>
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* VIEWPORTS */}

          {activeTab === "classes" && (
            <div className="space-y-6">
              {selectedClass ? (
                <div className="glass-panel rounded-2xl p-6 shadow-lg">
                  <div className="border-b border-white/10 pb-4 mb-5">
                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 py-0.5 px-2 rounded uppercase tracking-wider">{selectedClass.code}</span>
                    <h3 className="text-lg font-extrabold text-white mt-1.5">{selectedClass.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedClass.description}</p>
                    <div className="text-[11px] text-slate-400 mt-3">
                      Course Instructor: <strong className="text-slate-300">{selectedClass.teacher_name}</strong> (<span className="text-slate-400">{selectedClass.teacher_email}</span>)
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      Shared Learning Materials
                    </h4>

                    {loadingDetails ? (
                      <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="p-8 bg-white/5 rounded-xl text-center text-slate-400 text-xs border border-dashed border-white/10">
                        No resources or learning materials have been shared in this class yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="p-4 bg-white/5 hover:bg-white/8 rounded-xl border border-white/5 flex justify-between items-center transition-all group">
                            <div className="flex items-start gap-2.5 truncate">
                              <FileText className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                              <div className="truncate">
                                <h5 className="text-xs font-bold text-white truncate">{doc.title}</h5>
                                <p className="text-[9px] text-slate-400 mt-0.5">File: {doc.filename}</p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => downloadDoc(doc)}
                              className="ml-3 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-[9px] cursor-pointer transition-all shrink-0 shadow-md shadow-indigo-600/10"
                            >
                              <Download className="h-3 w-3" />
                              Fetch
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-white/10">
                  <BookOpen className="h-12 w-12 mx-auto text-indigo-400 mb-3" />
                  <h3 className="text-white font-bold mb-1">Establish Course Connection</h3>
                  <p className="text-xs max-w-sm mx-auto">You are currently not enrolled in any courses or haven't selected one. Enter a code in the sidebar to enroll.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "grades" && (
            <div className="space-y-6">
              
              {/* Pandas Comparative Analysis Dashboard */}
              {analytics && analytics.has_data && analytics.comparison && analytics.comparison.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 shadow-lg space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-3">
                    <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                    Comparative Performance (Your Score vs. Class Mean)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.comparison.map((comp, idx) => {
                      const aboveAverage = comp.difference >= 0;
                      return (
                        <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Course Department</span>
                            <h4 className="font-bold text-white text-xs mt-0.5 truncate">{comp.class_name}</h4>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-center mt-3 border-t border-white/10 pt-3">
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-semibold">Your Score</span>
                              <span className="block text-sm font-extrabold text-indigo-400 mt-0.5">{comp.your_score}%</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-semibold">Class Mean</span>
                              <span className="block text-sm font-bold text-slate-300 mt-0.5">{comp.class_average}%</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-semibold">Variance</span>
                              <span className={`block text-xs font-extrabold mt-1 px-1 py-0.5 rounded ${aboveAverage ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                                {comp.difference > 0 ? `+${comp.difference}` : comp.difference}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono text-right">*Computed dynamically against the collective population using Pandas aggregation</div>
                </div>
              )}

              {/* Evaluation History list */}
              <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Evaluation Grades Log</h4>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 py-0.5 px-2.5 rounded-full font-bold">
                    {grades.length} Grades Recorded
                  </span>
                </div>

                {grades.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No grades have been submitted for your portfolio yet. Evaluations appear here once instructors publish them.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10 text-xs">
                      <thead className="bg-black/10">
                        <tr>
                          <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Course Curriculum</th>
                          <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Assignment Title</th>
                          <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Score</th>
                          <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Graded Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-slate-300">
                        {grades.map((g) => (
                          <tr key={g.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-white">{g.class_name}</td>
                            <td className="px-5 py-3.5">{g.title}</td>
                            <td className="px-5 py-3.5 font-extrabold text-indigo-300">{g.score}%</td>
                            <td className="px-5 py-3.5 text-slate-400">{new Date(g.graded_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </main>
    </div>
  );
}
