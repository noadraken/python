import React, { useState, useEffect } from "react";
import { User, AdminAnalytics, Class } from "../types";
import { 
  Users, Plus, Mail, ShieldAlert, Sparkles, LogOut, Loader2, 
  BarChart3, RefreshCw, FileText, CheckCircle, GraduationCap, Percent, TrendingUp,
  Trash2
} from "lucide-react";

interface AdminPortalProps {
  user: User;
  onLogout: () => void;
}

export default function AdminPortal({ user, onLogout }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "teachers" | "students">("dashboard");
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  
  // Form states
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Deletion helper states
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteConfirmRole, setDeleteConfirmRole] = useState("");
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchTeachersAndClasses = async () => {
    setLoadingTeachers(true);
    try {
      const resT = await fetch("/api/admin/teachers");
      const dataT = await resT.json();
      if (resT.ok && dataT.status === "success") {
        setTeachers(dataT.teachers);
      }
      
      const resC = await fetch("/api/classes/all");
      const dataC = await resC.json();
      if (resC.ok && dataC.status === "success") {
        setClasses(dataC.classes);
      }
    } catch (err) {
      console.error("Error fetching admin references:", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Error fetching admin students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Error fetching admin analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchTeachersAndClasses();
    fetchStudents();
    fetchAnalytics();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherEmail || !teacherPassword) {
      setFormError("Please fill out all fields.");
      return;
    }

    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail,
          password: teacherPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setFormSuccess(`Successfully registered teacher: ${teacherName}`);
        setTeacherName("");
        setTeacherEmail("");
        setTeacherPassword("");
        fetchTeachersAndClasses(); // Refresh list
      } else {
        setFormError(data.message || "Failed to add teacher.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Connection error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setDeletingLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setDeletingUserId(null);
        // Refresh directory lists and analytical metrics
        fetchTeachersAndClasses();
        fetchStudents();
        fetchAnalytics();
      } else {
        setDeleteError(data.message || "Failed to remove user account.");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Connection error. Please try again.");
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-slate-200">
      {/* Upper Navigation Bar */}
      <header className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-300 border border-indigo-500/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">Edura Academy</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Admin Control Center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-slate-400 capitalize">{user.role} Account</span>
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full z-10">
        {/* Tab Selection */}
        <div className="flex border-b border-white/10 mb-8 gap-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "dashboard"
                ? "border-indigo-500 text-indigo-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Performance & Analytics
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "teachers"
                ? "border-indigo-500 text-indigo-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Faculty Management
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "students"
                ? "border-indigo-500 text-indigo-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Student Management
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Header + Action */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Academic Grade Analytics</h2>
                <p className="text-sm text-slate-400 mt-1">Real-time educational metrics computed by Python & Pandas</p>
              </div>
              <button
                onClick={() => { fetchAnalytics(); fetchTeachersAndClasses(); fetchStudents(); }}
                disabled={loadingAnalytics}
                className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 py-2.5 px-4 rounded-xl cursor-pointer disabled:bg-indigo-50/10 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingAnalytics ? "animate-spin" : ""}`} />
                Recalculate Grades
              </button>
            </div>

            {loadingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mb-3" />
                <p className="text-sm font-medium">Processing grades via Pandas pipeline...</p>
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Widgets Portfolio */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Performance Indicators Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Average</span>
                      <span className="text-3xl font-extrabold text-white mt-2">{analytics.school_average}%</span>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2 font-bold">
                        <TrendingUp className="h-3 w-3" />
                        Target: 75%
                      </div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Median Score</span>
                      <span className="text-3xl font-extrabold text-white mt-2">{analytics.median_score}%</span>
                      <div className="text-[10px] text-slate-400 mt-2 font-semibold">
                        Midpoint indicator
                      </div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consistency</span>
                      <span className="text-3xl font-extrabold text-white mt-2">±{analytics.std_deviation}</span>
                      <div className="text-[10px] text-slate-400 mt-2 font-semibold">
                        Standard Deviation
                      </div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Graded Units</span>
                      <span className="text-3xl font-extrabold text-white mt-2">{analytics.total_grades_count}</span>
                      <div className="text-[10px] text-indigo-400 mt-2 font-semibold">
                        Active evaluations
                      </div>
                    </div>
                  </div>

                  {/* Class Averages Progress Indicators */}
                  <div className="glass-panel p-6 rounded-2xl shadow-lg">
                    <h3 className="text-md font-bold text-white mb-4">Curriculum average performance ranking</h3>
                    <div className="space-y-4">
                      {analytics.class_averages.map((cls, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">{cls.class_name}</span>
                            <span className="text-white">{cls.score.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-black/25 border border-white/5 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                cls.score >= 85 
                                  ? "bg-emerald-500" 
                                  : cls.score >= 75 
                                    ? "bg-indigo-500" 
                                    : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(100, cls.score)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grade Distribution Columns */}
                  <div className="glass-panel p-6 rounded-2xl shadow-lg">
                    <h3 className="text-md font-bold text-white mb-4">Grade Bell Curve distribution</h3>
                    <div className="flex items-end justify-between h-48 pt-6 border-b border-white/10 px-4">
                      {Object.entries(analytics.grade_distribution).map(([label, countVal]) => {
                        const count = countVal as number;
                        const total = Object.values(analytics.grade_distribution).reduce((a, b) => (a as number) + (b as number), 0) as number;
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={label} className="flex flex-col items-center flex-1 group">
                            <div className="relative w-full flex justify-center">
                              <span className="absolute -top-8 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white px-2 py-1 rounded border border-white/10 z-20">
                                {count} items ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div 
                              className="w-10 bg-indigo-500/20 hover:bg-indigo-500 rounded-t-lg transition-all duration-300 border border-indigo-500/30 cursor-pointer"
                              style={{ height: `${Math.max(4, percentage * 1.5)}px` }}
                            ></div>
                            <span className="text-[10px] md:text-xs font-semibold text-slate-400 mt-2 truncate max-w-[80px]">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Pandas Generated Written Report */}
                <div className="glass-panel p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                      <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Automated Report</h3>
                        <p className="text-[10px] text-slate-400">Continuous Integration Python Pipeline</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 font-mono space-y-4 max-h-[420px] overflow-y-auto whitespace-pre-wrap pr-1 leading-relaxed">
                      {analytics.report}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Engine: Pandas v2.x</span>
                    <span className="text-indigo-400 flex items-center gap-0.5 font-bold">
                      <CheckCircle className="h-3 w-3 text-indigo-400" /> System Verified
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-white/10">
                <ShieldAlert className="h-12 w-12 mx-auto text-amber-400 mb-3" />
                <h3 className="text-white font-bold mb-1">No Grade Analytics Available</h3>
                <p className="text-sm max-w-sm mx-auto">There are currently no active course grades to calculate averages on. Ask teachers to submit class grades.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "teachers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side form */}
            <div className="glass-panel p-6 rounded-2xl shadow-lg h-fit">
              <div className="mb-6">
                <h3 className="text-md font-bold text-white font-sans">Register New Teacher</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define faculty access credentials below</p>
              </div>

              {formError && (
                <div className="mb-4 bg-rose-500/10 border-l-4 border-rose-500 p-3 rounded-lg text-rose-300 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 bg-emerald-500/10 border-l-4 border-emerald-500 p-3 rounded-lg text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Teacher Full Name</label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Prof. Jane Foster"
                    className="w-full glass-input rounded-xl py-2 px-3 text-sm focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="foster@school.com"
                    className="w-full glass-input rounded-xl py-2 px-3 text-sm focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl py-2 px-3 text-sm focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:bg-indigo-400/50 shadow-indigo-600/15"
                >
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Faculty Member
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right side list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Faculty Directory</h3>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    {teachers.length} Active Teachers
                  </span>
                </div>

                {loadingTeachers ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">
                    No faculty members are currently registered in SQLite database.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-black/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Join Date</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-sm text-slate-300">
                        {teachers.map((t) => (
                          <tr key={t.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">{t.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{t.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                              {new Date(t.created_at || "").toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                              <button
                                onClick={() => {
                                  setDeletingUserId(t.id);
                                  setDeleteConfirmName(t.name);
                                  setDeleteConfirmRole("teacher");
                                  setDeleteError("");
                                }}
                                className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/15 cursor-pointer transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Connected courses status */}
              <div className="glass-panel rounded-2xl p-6 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Curriculum Inventory</h3>
                {classes.length === 0 ? (
                  <p className="text-xs text-slate-400">No classes defined. Teachers can create classes inside their portals.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls) => (
                      <div key={cls.id} className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-indigo-300 uppercase bg-indigo-500/15 border border-indigo-500/10 px-1.5 py-0.5 rounded">{cls.code}</span>
                            <span className="text-xs text-slate-400">{cls.student_count} Enrolled</span>
                          </div>
                          <h4 className="font-bold text-white text-sm mt-2">{cls.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cls.description}</p>
                        </div>
                        <div className="border-t border-white/10 pt-2.5 mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Instructor: <strong className="text-white">{cls.teacher_name}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20">
                <div>
                  <h3 className="text-md font-bold uppercase tracking-wider text-white">Student Directory</h3>
                  <p className="text-xs text-slate-400 mt-1">Manage and audit active student registrations</p>
                </div>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-bold">
                  {students.length} Registered Students
                </span>
              </div>

              {loadingStudents ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : students.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  <GraduationCap className="h-12 w-12 mx-auto text-slate-500 mb-3" />
                  <h3 className="text-white font-bold mb-1">No Students Registered</h3>
                  <p className="text-xs max-w-xs mx-auto text-slate-400">There are currently no students registered in the database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-black/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Registered On</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-sm text-slate-300">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 uppercase">
                                {s.name.charAt(0)}
                              </div>
                              {s.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{s.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                            {new Date(s.created_at || "").toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                            <button
                              onClick={() => {
                                setDeletingUserId(s.id);
                                setDeleteConfirmName(s.name);
                                setDeleteConfirmRole("student");
                                setDeleteError("");
                              }}
                              className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/15 cursor-pointer transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove Student
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Deletion Confirmation Modal Overlay */}
      {deletingUserId !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel-heavy rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Confirm Removal</h3>
                <p className="text-xs text-slate-400">
                  Are you absolutely sure you want to delete the {deleteConfirmRole}{" "}
                  <strong className="text-white">{deleteConfirmName}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/15 p-3 rounded-xl text-[11px] text-rose-300/90 leading-relaxed">
              <strong>Warning:</strong> This action cannot be undone. All classes, grades, course documents, and enrollments linked to this user will be deleted permanently from the SQLite database.
            </div>

            {deleteError && (
              <div className="bg-rose-500/10 border-l-4 border-rose-500 p-3 rounded text-xs text-rose-300 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingLoading}
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingLoading}
                onClick={() => handleDeleteUser(deletingUserId)}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer disabled:bg-rose-500/50 shadow-lg shadow-rose-600/10 transition-all"
              >
                {deletingLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
