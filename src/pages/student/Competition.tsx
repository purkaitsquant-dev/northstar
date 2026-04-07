import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStoredCompetitions, getCurrentUser, getStoredCompetitionLogs, saveCompetitionLogs, getStoredCompetitionResults, saveCompetitionResults } from "@/store/dataStore";
import { ArrowLeft, Clock, Trophy, AlertCircle, Lock } from "lucide-react";

export default function Competition() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [competition, setCompetition] = useState(() => getStoredCompetitions().find(c => c.id === id));
  const currentUser = getCurrentUser();
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(() => {
    const comp = getStoredCompetitions().find(c => c.id === id);
    return comp ? comp.durationMinutes * 60 : 0;
  });
  
  const [isFinished, setIsFinished] = useState(() => {
    const results = getStoredCompetitionResults();
    return !!results.find(r => r.competitionId === id && r.userId === currentUser.id);
  });
  
  const [score, setScore] = useState(() => {
    const results = getStoredCompetitionResults();
    const existing = results.find(r => r.competitionId === id && r.userId === currentUser.id);
    return existing ? existing.score : 0;
  });
  
  const [isLive, setIsLive] = useState(false);
  const hasLoggedEntry = useRef(false);
  
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedComp = getStoredCompetitions().find(c => c.id === id);
      if (updatedComp) {
        setCompetition(updatedComp);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (competition) {
      const checkLive = () => {
        const startTime = new Date(competition.startTime).getTime();
        setIsLive(Date.now() >= startTime);
      };
      
      checkLive();
      const interval = setInterval(checkLive, 1000);
      return () => clearInterval(interval);
    }
  }, [competition]);

  useEffect(() => {
    if (competition && !isFinished && isLive) {
      if (!hasLoggedEntry.current) {
        hasLoggedEntry.current = true;
        const logs = getStoredCompetitionLogs();
        const newLog = {
          id: `log-${Date.now()}`,
          competitionId: competition.id,
          userId: currentUser.id,
          userName: currentUser.name,
          deviceName: navigator.userAgent,
          loginTime: new Date().toISOString()
        };
        saveCompetitionLogs([...logs, newLog]);
      }
    }
  }, [competition, isFinished, isLive, currentUser]);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished && competition && isLive) {
      handleFinish();
      return;
    }

    if (!isFinished && isLive) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isFinished, competition, isLive]);

  if (!competition) return <div>Competition not found</div>;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-50 to-emerald-100 p-6 flex items-center justify-center font-sans">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden text-center p-8">
          <div className="mx-auto bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Trophy className="h-12 w-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Competition Complete!</h1>
          <p className="text-slate-500 mb-8">You've successfully finished {competition.title}</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Final Score</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-green-500">
              {score}
            </p>
          </div>

          <Button onClick={() => navigate('/student')} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 text-lg font-semibold shadow-md">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!isLive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 flex items-center justify-center font-sans">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden text-center p-8">
          <div className="mx-auto bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Lock className="h-12 w-12 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Competition Locked</h1>
          <p className="text-slate-500 mb-8">This competition hasn't started yet or has been locked by the admin.</p>
          <Button onClick={() => navigate('/student')} className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl h-12 text-lg font-semibold shadow-md">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const question = competition.questions[currentQuestionIdx];

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: option }));
  };

  const getUpdatedQuestionTimes = () => {
    const now = Date.now();
    const timeSpent = Math.floor((now - questionStartTime) / 1000);
    return {
      ...questionTimes,
      [question.id]: (questionTimes[question.id] || 0) + timeSpent
    };
  };

  const handleNext = () => {
    const updatedTimes = getUpdatedQuestionTimes();
    setQuestionTimes(updatedTimes);
    setQuestionStartTime(Date.now());

    if (currentQuestionIdx < competition.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      handleFinish(updatedTimes);
    }
  };

  const handleFinish = (finalTimes?: Record<string, number>) => {
    const timesToUse = finalTimes || getUpdatedQuestionTimes();
    if (!finalTimes) {
      setQuestionTimes(timesToUse);
    }

    setIsFinished(true);
    let correctCount = 0;
    
    const details = competition.questions.map(q => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        questionText: q.text,
        answerGiven: answers[q.id] || '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        timeSpentSeconds: timesToUse[q.id] || 0
      };
    });
    
    // Base points + time bonus
    const basePoints = correctCount * 100;
    const timeBonus = Math.floor(timeLeft / 10); // 1 point for every 10 seconds left
    const finalScore = basePoints + (correctCount > 0 ? timeBonus : 0);
    setScore(finalScore);

    const results = getStoredCompetitionResults();
    const existing = results.find(r => r.competitionId === competition.id && r.userId === currentUser.id);
    if (!existing) {
      saveCompetitionResults([...results, {
        id: `res-${Date.now()}`,
        competitionId: competition.id,
        userId: currentUser.id,
        userName: currentUser.name,
        score: finalScore,
        completedAt: new Date().toISOString(),
        details
      }]);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-50 to-emerald-100 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/student')} className="hover:bg-white/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{competition.title}</h1>
              <p className="text-sm text-slate-500 font-medium">Question {currentQuestionIdx + 1} of {competition.questions.length}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 rounded-full px-5 py-2 shadow-sm border transition-colors ${timeLeft < 60 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-yellow-50 text-yellow-600'}`}>
            <Clock className={`h-5 w-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
            <span className="font-bold text-lg tracking-wider">{formatTime(timeLeft)}</span>
          </div>
        </header>

        <Progress value={((currentQuestionIdx) / competition.questions.length) * 100} className="h-3 rounded-full bg-white/50 [&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-green-500" />

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-yellow-400 to-green-500 w-full"></div>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl font-semibold leading-relaxed text-slate-800">
                {question.text}
              </CardTitle>
              <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No Hints
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                    answers[question.id] === option 
                      ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]" 
                      : "border-slate-100 bg-white hover:bg-slate-50 hover:border-green-200 hover:shadow-sm"
                  }`}
                >
                  <span className="font-bold text-green-600 mr-2">{String.fromCharCode(65 + i)}.</span> 
                  <span className="font-medium text-slate-700">{option}</span>
                </button>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!answers[question.id]}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-semibold shadow-md"
              >
                {currentQuestionIdx < competition.questions.length - 1 ? "Next Question" : "Submit Final Answers"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
