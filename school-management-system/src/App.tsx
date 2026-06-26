import { useState, useEffect } from "react";
import Login from "./components/Login";
import AdminPortal from "./components/AdminPortal";
import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const savedSession = localStorage.getItem("edura_session");
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem("edura_session");
      }
    }
    setSessionLoading(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("edura_session", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("edura_session");
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans text-slate-300 relative overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950 -z-10"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/15 blur-[120px] rounded-full -z-10"></div>
        
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-indigo-200">Synchronizing portal certificates...</p>
        </div>
      </div>
    );
  }

  // Render App content wrapped in standard Frosted Glass background
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 relative overflow-x-hidden">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950 -z-10"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/15 blur-[120px] rounded-full -z-10"></div>

      {/* Role-based view switching */}
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : user.role === "admin" ? (
        <AdminPortal user={user} onLogout={handleLogout} />
      ) : user.role === "teacher" ? (
        <TeacherPortal user={user} onLogout={handleLogout} />
      ) : user.role === "student" ? (
        <StudentPortal user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
