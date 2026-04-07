import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAdminStats, getQuestionResults } from "@/store/progress";
import { getStoredCompetitions, saveCompetitions, getStoredModules, saveModules, getStoredUsers, saveUsers, User, getStoredCompetitionLogs, CompetitionLog, getStoredCompetitionResults, saveCompetitionResults, CompetitionResult } from "@/store/dataStore";
import { Competition, Module } from "@/store/mockData";
import { Users, BookOpen, AlertCircle, Settings, PlusCircle, PlayCircle, Edit, Trash2, X, Activity, Trophy, RotateCcw, Lock, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ avgAccuracy: 0, avgHints: 0 });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [competitionLogs, setCompetitionLogs] = useState<CompetitionLog[]>([]);
  const [competitionResults, setCompetitionResults] = useState<CompetitionResult[]>([]);
  
  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'student' as 'student'|'admin' });
  
  // Result Details Modal State
  const [selectedResult, setSelectedResult] = useState<CompetitionResult | null>(null);

  // Clear Cache Modal State
  const [isClearCacheModalOpen, setIsClearCacheModalOpen] = useState(false);

  useEffect(() => {
    setStats(getAdminStats());
    setCompetitions(getStoredCompetitions());
    setModules(getStoredModules());
    setUsers(getStoredUsers());
    setCompetitionLogs(getStoredCompetitionLogs());
    setCompetitionResults(getStoredCompetitionResults());
    
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      setCompetitionLogs(getStoredCompetitionLogs());
      setCompetitionResults(getStoredCompetitionResults());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlockCompetition = (id: string) => {
    const updated = competitions.map(c => {
      if (c.id === id) {
        return { ...c, startTime: new Date().toISOString() };
      }
      return c;
    });
    setCompetitions(updated);
    saveCompetitions(updated);
  };

  const handleLockCompetition = (id: string) => {
    const updated = competitions.map(c => {
      if (c.id === id) {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 10);
        return { ...c, startTime: futureDate.toISOString() };
      }
      return c;
    });
    setCompetitions(updated);
    saveCompetitions(updated);
  };

  const handleReopen = (resultId: string) => {
    const updatedResults = competitionResults.filter(r => r.id !== resultId);
    setCompetitionResults(updatedResults);
    saveCompetitionResults(updatedResults);
  };

  const handleToggleModule = (id: string) => {
    const updated = modules.map(m => {
      if (m.id === id) {
        return { ...m, isUnlocked: !m.isUnlocked };
      }
      return m;
    });
    setModules(updated);
    saveModules(updated);
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'student' });
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: user.password || '', role: user.role });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    let updatedUsers;
    if (editingUser) {
      updatedUsers = users.map(u => {
        if (u.id === editingUser.id) {
          const updatedUser = { ...u, name: userForm.name, email: userForm.email, role: userForm.role };
          if (userForm.password) {
            updatedUser.password = userForm.password;
          }
          return updatedUser;
        }
        return u;
      });
    } else {
      const newUser: User = {
        id: `u${Date.now()}`,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        password: userForm.password || 'password123' // default password if none provided
      };
      updatedUsers = [...users, newUser];
    }
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500">Manage competitions, modules, and users</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/admin/conversations")} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Tutor Conversations
            </Button>
            <Button variant="destructive" onClick={() => setIsClearCacheModalOpen(true)}>Clear Cache</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Logout</Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-slate-500">Registered accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.filter(m => m.isUnlocked).length}</div>
              <p className="text-xs text-slate-500">Out of {modules.length} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
              <AlertCircle className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgAccuracy}%</div>
              <p className="text-xs text-slate-500">First attempt correct rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hint Usage</CardTitle>
              <Settings className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgHints}</div>
              <p className="text-xs text-slate-500">hints per question avg</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Competitions Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-yellow-500" />
                  Competition Management
                </CardTitle>
                <CardDescription>Unlock exams for students</CardDescription>
              </div>
              <Button onClick={() => navigate("/admin/competition/new")} className="gap-2" size="sm">
                <PlusCircle className="h-4 w-4" />
                Create Competition
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitions.map((comp) => {
                  const isLive = new Date(comp.startTime).getTime() <= currentTime;
                  return (
                    <div key={comp.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{comp.title}</p>
                        <p className="text-sm text-slate-500">
                          Starts: {new Date(comp.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isLive ? "default" : "secondary"} className={isLive ? "bg-green-500" : ""}>
                          {isLive ? "Live" : "Locked"}
                        </Badge>
                        {isLive ? (
                          <Button size="sm" variant="outline" onClick={() => handleLockCompetition(comp.id)}>
                            <Lock className="h-4 w-4 mr-1" /> Lock
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleUnlockCompetition(comp.id)}>
                            Unlock Now
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/competition/${comp.id}`)}>
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Module Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Module Management
                </CardTitle>
                <CardDescription>Configure unlock dates and content</CardDescription>
              </div>
              <Button onClick={() => navigate("/admin/module/new")} className="gap-2" size="sm">
                <PlusCircle className="h-4 w-4" />
                Create Module
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{module.title}</p>
                      <p className="text-sm text-slate-500">
                        {module.practiceSets.length} Sets
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={module.isUnlocked ? "default" : "secondary"} className={module.isUnlocked ? "bg-green-500" : ""}>
                        {module.isUnlocked ? "Unlocked" : "Locked"}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleToggleModule(module.id)}>
                        {module.isUnlocked ? "Lock" : "Unlock"}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/module/${module.id}`)}>
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competition Logs */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-500" />
                Competition Access Logs
              </CardTitle>
              <CardDescription>Real-time log of students entering competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Competition</th>
                      <th className="px-4 py-3 font-medium">Login Time</th>
                      <th className="px-4 py-3 font-medium">Device Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitionLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No logs available yet.</td>
                      </tr>
                    ) : (
                      competitionLogs.map((log) => {
                        const comp = competitions.find(c => c.id === log.competitionId);
                        return (
                          <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-900">{log.userName}</td>
                            <td className="px-4 py-3 text-slate-500">{comp?.title || log.competitionId}</td>
                            <td className="px-4 py-3 text-slate-500">{new Date(log.loginTime).toLocaleString()}</td>
                            <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={log.deviceName}>{log.deviceName}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Competition Results */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Competition Results
              </CardTitle>
              <CardDescription>Scores and completion times for students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Competition</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                      <th className="px-4 py-3 font-medium">Completed At</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitionResults.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No results available yet.</td>
                      </tr>
                    ) : (
                      competitionResults.map((result) => {
                        const comp = competitions.find(c => c.id === result.competitionId);
                        return (
                          <tr key={result.id} className="border-b last:border-0 hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-900">{result.userName}</td>
                            <td className="px-4 py-3 text-slate-500">{comp?.title || result.competitionId}</td>
                            <td className="px-4 py-3 font-bold text-green-600">{result.score}</td>
                            <td className="px-4 py-3 text-slate-500">{new Date(result.completedAt).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)} className="text-slate-600 hover:text-slate-900">
                                  View Details
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleReopen(result.id)} className="text-blue-600 hover:text-blue-700">
                                  <RotateCcw className="h-4 w-4 mr-1" /> Reopen
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  User Management
                </CardTitle>
                <CardDescription>Add, edit, or remove users</CardDescription>
              </div>
              <Button onClick={openAddUser} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Password</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                        <td className="px-4 py-3 text-slate-500">{user.email}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{user.password || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditUser(user)}>
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simple User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>{editingUser ? 'Edit User' : 'Add New User'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsUserModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input 
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input 
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value as 'student'|'admin'})}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveUser} disabled={!userForm.name || !userForm.email}>
                  {editingUser ? 'Save Changes' : 'Add User'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4 shrink-0">
              <div>
                <CardTitle>Result Details</CardTitle>
                <CardDescription>{selectedResult.userName} - {competitions.find(c => c.id === selectedResult.competitionId)?.title || selectedResult.competitionId}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedResult(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto p-0">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Final Score</p>
                    <p className="text-3xl font-bold text-green-600">{selectedResult.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 font-medium">Completed At</p>
                    <p className="text-lg font-semibold text-slate-700">{new Date(selectedResult.completedAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedResult.details && selectedResult.details.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Question Breakdown</h3>
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                          <tr>
                            <th className="px-4 py-3 font-medium w-12">#</th>
                            <th className="px-4 py-3 font-medium">Question</th>
                            <th className="px-4 py-3 font-medium">Given Answer</th>
                            <th className="px-4 py-3 font-medium">Correct Answer</th>
                            <th className="px-4 py-3 font-medium text-center">Time Spent</th>
                            <th className="px-4 py-3 font-medium text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedResult.details.map((detail, idx) => (
                            <tr key={detail.questionId} className="border-b last:border-0 hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}</td>
                              <td className="px-4 py-3 text-slate-900 max-w-[200px] truncate" title={detail.questionText}>{detail.questionText}</td>
                              <td className="px-4 py-3 text-slate-700">{detail.answerGiven || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">{detail.correctAnswer}</td>
                              <td className="px-4 py-3 text-slate-500 text-center">{detail.timeSpentSeconds}s</td>
                              <td className="px-4 py-3 text-center">
                                {detail.isCorrect ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Correct</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Incorrect</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No detailed question breakdown available for this result.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Clear Cache Modal */}
      {isClearCacheModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Clear All Data
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsClearCacheModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-slate-600">
                Are you sure you want to clear all data? This will reset the app to its initial state, deleting all users, competition results, and custom modules.
              </p>
              <p className="text-slate-600 font-semibold">
                This action cannot be undone.
              </p>
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsClearCacheModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleClearCache}>
                  Yes, Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
