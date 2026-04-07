import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_LEADERBOARD } from "@/store/mockData";
import { getAdminStats } from "@/store/progress";
import { getStoredCompetitions, getStoredModules, getCurrentUser, getStoredCompetitionResults } from "@/store/dataStore";
import { Trophy, Clock, BookOpen, Target, PlayCircle, Lock } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ avgAccuracy: 0, avgHints: 0 });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [competitions, setCompetitions] = useState(getStoredCompetitions());
  const [modules, setModules] = useState(getStoredModules());
  const [results, setResults] = useState(getStoredCompetitionResults());
  const currentUser = getCurrentUser();

  useEffect(() => {
    setStats(getAdminStats());
    setCompetitions(getStoredCompetitions());
    setModules(getStoredModules());
    setResults(getStoredCompetitionResults());
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      // Optionally refresh data periodically if needed
      setCompetitions(getStoredCompetitions());
      setModules(getStoredModules());
      setResults(getStoredCompetitionResults());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hintUsageText = stats.avgHints === 0 ? "None" : stats.avgHints < 1 ? "Low" : stats.avgHints < 2 ? "Medium" : "High";
  const hintUsageProgress = Math.min((stats.avgHints / 3) * 100, 100);

  const formatCountdown = (targetTime: number) => {
    const diff = targetTime - currentTime;
    if (diff <= 0) return "00:00:00";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 p-6 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {currentUser.name}!</h1>
            <p className="text-slate-500 font-medium mt-1">Day 1 of the Spring Math Challenge</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 rounded-full bg-white px-5 py-2.5 shadow-sm border border-yellow-100">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-green-600">950 XP</span>
            </div>
            <div className="flex items-center space-x-2 rounded-full bg-white px-5 py-2.5 shadow-sm border border-green-100">
              <Target className="h-5 w-5 text-green-500" />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Rank #4</span>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>Logout</Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            
            {/* Live Competitions Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <PlayCircle className="h-6 w-6 text-yellow-500" />
                Competitions
              </h2>
              <div className="grid gap-4">
                {competitions.map((comp) => {
                  const startTime = new Date(comp.startTime).getTime();
                  const isLive = currentTime >= startTime;
                  const hasCompleted = results.some(r => r.competitionId === comp.id && r.userId === currentUser.id);

                  return (
                    <Card key={comp.id} className={`border-0 shadow-lg text-white overflow-hidden rounded-3xl relative ${isLive && !hasCompleted ? 'bg-gradient-to-r from-yellow-400 to-green-500' : 'bg-slate-800'}`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                      <CardHeader className="relative z-10 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-2xl font-bold">{comp.title}</CardTitle>
                            <p className={`${isLive && !hasCompleted ? 'text-yellow-50' : 'text-slate-300'} font-medium mt-1`}>{comp.durationMinutes} Minutes • {comp.questions.length} Questions</p>
                          </div>
                          {isLive && !hasCompleted ? (
                            <Badge className="bg-white text-green-700 hover:bg-white/90 font-bold px-3 py-1">
                              <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              LIVE NOW
                            </Badge>
                          ) : hasCompleted ? (
                            <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600 font-bold px-3 py-1 flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600 font-bold px-3 py-1 flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Starts in {formatCountdown(startTime)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10 pt-4">
                        <Button 
                          disabled={!isLive || hasCompleted}
                          onClick={() => navigate(`/student/competition/${comp.id}`)}
                          className={`${isLive && !hasCompleted ? 'bg-white text-green-700 hover:bg-green-50' : 'bg-slate-700 text-slate-300'} font-bold rounded-xl px-8 shadow-md`}
                        >
                          {hasCompleted ? "Completed" : isLive ? "Enter Competition" : "Locked"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Practice Modules Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-green-500" />
                Practice Modules
              </h2>
              <div className="grid gap-4">
                {modules.map((module) => (
                  <Card key={module.id} className={`border-0 shadow-md rounded-3xl overflow-hidden transition-all ${module.isUnlocked ? "bg-white hover:shadow-lg" : "bg-slate-50/50 opacity-75"}`}>
                    <div className={`h-1.5 w-full ${module.isUnlocked ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-200'}`}></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl font-bold text-slate-800">
                        {module.title}
                      </CardTitle>
                      {module.isUnlocked ? (
                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-0 font-bold">Unlocked</Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-500 border-0 font-medium">
                          <Clock className="h-3 w-3" /> Unlocks Day {module.unlockDay}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between pt-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-600">
                            {module.practiceSets.length} Practice Sets
                          </p>
                          {module.isUnlocked && (
                            <div className="flex items-center pt-2 text-sm font-medium text-slate-500">
                              <Progress value={33} className="w-[100px] mr-3 h-2 [&>div]:bg-green-500" />
                              33% Complete
                            </div>
                          )}
                        </div>
                        <Button 
                          disabled={!module.isUnlocked}
                          onClick={() => navigate(`/student/module/${module.id}`)}
                          className={module.isUnlocked ? "bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm font-semibold" : "rounded-xl font-semibold"}
                          variant={module.isUnlocked ? "default" : "secondary"}
                        >
                          {module.isUnlocked ? "Enter Module" : "Locked"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden sticky top-6">
              <div className="h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 w-full"></div>
              <CardHeader className="bg-yellow-50/50 border-b border-yellow-100/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Leaderboard
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Top performers in your school</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {MOCK_LEADERBOARD.map((student, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-sm transition-transform group-hover:scale-110 ${
                          i === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white" :
                          i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                          i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {student.rank}
                        </span>
                        <span className="font-bold text-slate-700">{student.name}</span>
                      </div>
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{student.points}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 w-full"></div>
              <CardHeader className="bg-green-50/50 border-b border-green-100/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <BookOpen className="h-6 w-6 text-green-500" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 font-semibold">Accuracy</span>
                    <span className="font-bold text-green-600">{stats.avgAccuracy}%</span>
                  </div>
                  <Progress value={stats.avgAccuracy} className="h-2.5 [&>div]:bg-green-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 font-semibold">Hint Usage ({stats.avgHints} avg)</span>
                    <span className="font-bold text-yellow-600">{hintUsageText}</span>
                  </div>
                  <Progress value={hintUsageProgress} className="h-2.5 [&>div]:bg-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 w-full"></div>
              <CardHeader className="bg-blue-50/50 border-b border-blue-100/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <Target className="h-6 w-6 text-blue-500" />
                  My Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {results.filter(r => r.userId === currentUser.id).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No competitions completed yet.</p>
                ) : (
                  results.filter(r => r.userId === currentUser.id).map((result, idx) => {
                    const comp = competitions.find(c => c.id === result.competitionId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{comp?.title || 'Unknown Competition'}</p>
                          <p className="text-xs text-slate-500">{new Date(result.completedAt).toLocaleDateString()}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                          {result.score} pts
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
