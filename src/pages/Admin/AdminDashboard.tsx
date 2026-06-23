import  { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../lib/api";
import { Note } from "../../types";
import { 
  Trash2, Star, RefreshCw, ShieldAlert, Award, GraduationCap, 
  FileText, Download, Users, UserCheck, Mail, Calendar, UserX, Shield 
} from "lucide-react";
import toast from "react-hot-toast";

// Explicit Interface defining User Profile data structures
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "student" | "expert" | "admin";
  department?: string;
  createdAt?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dashboard Data Accumulation States
  const [notes, setNotes] = useState<Note[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalExperts, setTotalExperts] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state tab view automatically based on current URL pathing parameters
  const currentTab = location.pathname === "/admin/users" ? "users" : "documents";

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      
      // Concurrently fetch document nodes, aggregate counters, and user account matrices
      const [notesRes, usersCountRes, expertsCountRes, profilesRes] = await Promise.all([
        API.get("/notes"),
        API.get("/users/count-students").catch(() => ({ data: { count: 0 } })), 
        API.get("/users/count-experts").catch(() => ({ data: { count: 0 } })),
        API.get("/users").catch(() => API.get("/auth/users")).catch(() => ({ data: [] })) // Resilient fallback for multi-tenant route variations
      ]);

      setNotes(notesRes.data || []);
      setTotalUsers(usersCountRes.data?.count || 0);
      setTotalExperts(expertsCountRes.data?.count || 0);
      setProfiles(profilesRes.data || []);

      const total = (notesRes.data || []).reduce((sum: number, note: Note) => sum + note.downloads, 0);
      setTotalDownloads(total);
    } catch (error) {
      toast.error("Failed to load dashboard statistics logs");
    } finally {
      setLoading(false);
    }
  };

  // Document Purging Execution Handler
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("⚠️ Global Overwrite Action: Delete this note permanently from cloud system?")) return;

    try {
      await API.delete(`/notes/${noteId}`);
      toast.success("Note purged successfully from system database");
      fetchAllDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Purge execution failed");
    }
  };

  // User Identity Card Revocation and Deletion Handler
  const handleDeleteUserProfile = async (userId: string, userEmail: string) => {
    const targetEmail = userEmail.toLowerCase();
    
    // Safety check against deleting the system root administrator accounts
    if (targetEmail === "admin@glowcare.ai" || targetEmail === "admin@notevault.com") {
      return toast.error("Security Halt: Root admin profile configuration lines cannot be removed.");
    }

    if (!window.confirm(`🚨 CRITICAL REVOVATION ACTION: Permanently wipe user identity profile [${userEmail}] from core databases?`)) return;

    try {
      await API.delete(`/users/${userId}`);
      toast.success("User identity data cluster successfully wiped");
      
      // Instantly clear local UI state matrices for responsive layout updates
      setProfiles((prev) => prev.filter((u) => u._id !== userId));
      
      // Sync remaining analytic counts
      const [uCount, eCount] = await Promise.all([
        API.get("/users/count-students").catch(() => ({ data: { count: totalUsers } })),
        API.get("/users/count-experts").catch(() => ({ data: { count: totalExperts } }))
      ]);
      setTotalUsers(uCount.data?.count || 0);
      setTotalExperts(eCount.data?.count || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Revocation sequence processing failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-zinc-950 text-zinc-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <div className="text-zinc-400 font-medium tracking-wide">Loading System Admin Terminal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-10 selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="text-amber-500" size={36} />
              Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-2 text-sm font-medium">
              Global Content Moderation & Access Operations Control Center
            </p>
          </div>
          <button
            onClick={fetchAllDashboardData}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500 text-zinc-200 hover:text-amber-500 transition-all duration-200 rounded-xl font-semibold text-sm shadow-md cursor-pointer group"
          >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 
            Refresh System Log
          </button>
        </div>

        {/* Analytics Command Matrix Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <div 
            onClick={() => navigate("/admin/users")}
            className={`p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden group transition-all cursor-pointer ${
              currentTab === "users" ? "bg-amber-950/20 border-amber-500/50" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div>
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Total Students</p>
              <p className="text-3xl font-black text-white mt-1 group-hover:text-amber-500 transition-colors">{totalUsers}</p>
            </div>
            <Users className={currentTab === "users" ? "text-amber-500/50" : "text-zinc-800 group-hover:text-zinc-700/80"} size={36} />
          </div>

          <div 
            onClick={() => navigate("/admin/users")}
            className={`p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden group transition-all cursor-pointer ${
              currentTab === "users" ? "bg-amber-950/20 border-amber-500/50" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div>
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Total Experts</p>
              <p className="text-3xl font-black text-white mt-1 group-hover:text-amber-500 transition-colors">{totalExperts}</p>
            </div>
            <UserCheck className={currentTab === "users" ? "text-amber-500/50" : "text-zinc-800 group-hover:text-zinc-700/80"} size={36} />
          </div>

          <div 
            onClick={() => navigate("/admin")}
            className={`p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden group transition-all cursor-pointer ${
              currentTab === "documents" ? "bg-amber-950/20 border-amber-500/50" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div>
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Files Stored</p>
              <p className="text-3xl font-black text-white mt-1 group-hover:text-amber-500 transition-colors">{notes.length}</p>
            </div>
            <FileText className={currentTab === "documents" ? "text-amber-500/50" : "text-zinc-800 group-hover:text-zinc-700/80"} size={36} />
          </div>

          <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 flex items-center justify-between relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div>
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Downloads</p>
              <p className="text-3xl font-black text-white mt-1 group-hover:text-amber-500 transition-colors">{totalDownloads}</p>
            </div>
            <Download className="text-zinc-800 group-hover:text-zinc-700/80 transition-colors shrink-0" size={36} />
          </div>

          <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 flex items-center justify-between relative overflow-hidden group hover:border-zinc-700 transition-all sm:col-span-2 lg:col-span-1">
            <div>
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Clearance Status</p>
              <p className="text-sm font-black text-amber-500 mt-2 bg-amber-500/10 border border-amber-500/20 inline-block px-2.5 py-0.5 rounded-lg uppercase tracking-wide">
                👑 Super Admin
              </p>
            </div>
            <ShieldAlert className="text-zinc-800 group-hover:text-amber-500/10 transition-colors shrink-0" size={36} />
          </div>
        </div>

        {/* Component Path Segment Matrix Switches */}
        <div className="flex border-b border-zinc-800 mb-8 gap-6">
          <button
            onClick={() => navigate("/admin")}
            className={`pb-4 font-bold text-sm tracking-wide border-b-2 uppercase transition-all duration-200 cursor-pointer ${
              currentTab === "documents" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            📋 Shared Document Records ({notes.length})
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className={`pb-4 font-bold text-sm tracking-wide border-b-2 uppercase transition-all duration-200 cursor-pointer ${
              currentTab === "users" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            👥 User Profiles Directory ({profiles.length})
          </button>
        </div>

        {/* RENDER VIEW 1: SHARED DOCUMENTS WORKSPACE CONTAINER */}
        {currentTab === "documents" && (
          <>
            <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
              All Shared Workspace Documents
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => {
                const isAdminOwner = 
                  note.uploadedBy?.email?.toLowerCase() === 'admin@notevault.com' || 
                  note.uploadedBy?.role === 'admin';

                return (
                  <div 
                    key={note._id} 
                    className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-amber-500/40 hover:shadow-[0_4px_20px_rgba(245,158,11,0.05)] transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-amber-500 transition-colors duration-200">
                            {note.title}
                          </h3>
                          <span className="inline-block bg-zinc-800 text-amber-500 font-bold text-[10px] px-2 py-0.5 rounded-md mt-2 uppercase tracking-wider">
                            {note.subject} • Sem {note.semester}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-all duration-200 shrink-0 cursor-pointer"
                          title="Purge Document"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Star className="text-amber-500" fill="currentColor" size={14} />
                        <span className="font-bold text-zinc-200">
                          {note.averageRating ? note.averageRating.toFixed(1) : "0.0"}
                        </span>
                      </div>
                      <div className="font-medium tracking-wide bg-zinc-800/40 px-2 py-1 rounded-md text-zinc-300">
                        {note.downloads} downloads
                      </div>
                    </div>

                    <div className="mt-4 bg-zinc-950/60 -mx-6 -mb-6 p-4 flex items-center justify-between border-t border-zinc-800/80 rounded-b-2xl">
                      <div className="flex items-center gap-2 truncate max-w-[70%]">
                        {isAdminOwner || note.uploadedBy?.role === 'expert' ? (
                          <Award size={15} className={isAdminOwner ? "text-amber-500" : "text-emerald-500"} />
                        ) : (
                          <GraduationCap size={15} className="text-zinc-400" />
                        )}
                        <span className="text-xs text-zinc-400 truncate">
                          Owner: <span className="font-semibold text-zinc-200">{note.uploadedBy?.name || 'System'}</span>
                        </span>
                      </div>

                      <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md ${
                        isAdminOwner 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                          : note.uploadedBy?.role === 'expert' 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}>
                        {isAdminOwner ? "admin" : (note.uploadedBy?.role || 'student')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {notes.length === 0 && (
              <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                <FileText className="mx-auto text-zinc-700 mb-4 animate-pulse" size={40} />
                <p className="text-sm font-medium">No system document records cataloged on the network.</p>
              </div>
            )}
          </>
        )}

        {/* RENDER VIEW 2: SYSTEM USER PROFILE CARDS GRID CONTAINER */}
        {currentTab === "users" && (
          <>
            <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
              Secure User Profiles Grid Directory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((user) => {
                const isRootSystemAdmin = 
                  user.email?.toLowerCase() === "admin@glowcare.ai" || 
                  user.email?.toLowerCase() === "admin@notevault.com" || 
                  user.role === "admin";

                return (
                  <div 
                    key={user._id} 
                    className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-amber-500/40 hover:shadow-[0_4px_20px_rgba(245,158,11,0.05)] transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3 truncate">
                          <div className={`p-2.5 rounded-xl border ${
                            isRootSystemAdmin 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                              : user.role === "expert" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : "bg-zinc-800 border-zinc-700 text-zinc-300"
                          }`}>
                            {isRootSystemAdmin ? <Shield size={18} /> : user.role === "expert" ? <Award size={18} /> : <GraduationCap size={18} />}
                          </div>
                          
                          <div className="truncate">
                            <h3 className="font-bold text-white text-base group-hover:text-amber-500 transition-colors duration-200 truncate">
                              {user.name}
                            </h3>
                            <span className={`inline-block text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md mt-1 ${
                              isRootSystemAdmin 
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                : user.role === "expert" 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}>
                              {user.role || 'student'}
                            </span>
                          </div>
                        </div>

                        {/* Revocation Controls visible explicitly to super admin and forbidden on root accounts */}
                        {!isRootSystemAdmin && (
                          <button
                            onClick={() => handleDeleteUserProfile(user._id, user.email)}
                            className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-all duration-200 shrink-0 cursor-pointer"
                            title="Purge User Profile"
                          >
                            <UserX size={18} />
                          </button>
                        )}
                      </div>

                      {/* Profile Metadata Lines Stack */}
                      <div className="mt-6 pt-4 border-t border-zinc-800/60 space-y-2.5 text-xs text-zinc-400">
                        <div className="flex items-center gap-2 text-zinc-300 truncate">
                          <Mail size={14} className="text-zinc-500 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.department && (
                          <div className="flex items-center gap-2 text-zinc-300">
                            <span className="font-semibold text-zinc-500">Department:</span>
                            <span>{user.department}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Timestamp Account Card Footer */}
                    <div className="mt-6 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Registration Date</span>
                      </div>
                      <span className="font-medium text-zinc-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "System Account"}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {profiles.length === 0 && (
              <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                <Users className="mx-auto text-zinc-700 mb-4 animate-pulse" size={40} />
                <p className="text-sm font-medium">No registered system users discovered on this instance container.</p>
              </div>
            )}
          </>
        )}
        
      </div>

    </div>
  );
}