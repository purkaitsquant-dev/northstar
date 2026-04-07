import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Question } from "@/store/mockData";
import { getStoredModules, getCurrentUser } from "@/store/dataStore";
import { evaluateStudentAnswer, EvaluationResult } from "@/services/ai";
import { saveQuestionResult } from "@/store/progress";
import { ArrowLeft, BrainCircuit, CheckCircle2, XCircle, Loader2, Lightbulb, Bot, Send, Sparkles, Clock } from "lucide-react";

export default function Practice() {
  const { moduleId, setId } = useParams();
  const navigate = useNavigate();
  
  const module = getStoredModules().find(m => m.id === moduleId);
  const practiceSet = module?.practiceSets.find(ps => ps.id === setId);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reasoningLog, setReasoningLog] = useState<{role: 'student' | 'ai', content: string}[]>([]);
  const [currentReasoning, setCurrentReasoning] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [step, setStep] = useState<'select' | 'reasoning' | 'feedback'>('select');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reasoningLog, evaluation, step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step !== 'feedback' || evaluation?.mistakeType !== 'Correct') {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, step, evaluation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = practiceSet?.questions[currentQuestionIdx];

  if (!practiceSet || !question) return <div>Practice set not found</div>;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setReasoningLog(prev => [
      ...prev,
      { role: 'ai', content: `You selected **${option}**. Before we check if it's correct, what was your approach? Briefly explain the formula or logic you used.` }
    ]);
    setCurrentReasoning("");
    setStep('reasoning');
  };

  const handleGetReasoningHint = async () => {
    setIsEvaluating(true);
    const isCorrect = selectedOption ? selectedOption === question.correctAnswer : null;
    
    const newLog = [...reasoningLog, { role: 'student' as const, content: "Can I get a hint?" }];
    setReasoningLog(newLog);
    
    const result = await evaluateStudentAnswer(
      question.text,
      question.correctAnswer,
      selectedOption,
      newLog,
      isCorrect
    );
    
    if (result.mistakeType === 'Vague reasoning' || result.mistakeType === 'Hint request' || result.mistakeType === 'Clarification request') {
      setReasoningLog([...newLog, { role: 'ai', content: result.message }]);
      setIsEvaluating(false);
      if (result.mistakeType === 'Hint request') {
        setHintIndex(prev => prev + 1); // Track hint usage for points calculation
      }
    } else {
      if (!selectedOption) {
        setReasoningLog([...newLog, { role: 'ai', content: result.message }]);
        setIsEvaluating(false);
      } else {
        setEvaluation(result);
        setStep('feedback');
        setIsEvaluating(false);
        setAttempts(prev => prev + 1);
        
        if (isCorrect && result.mistakeType === 'Correct') {
          let points = 10;
          if (hintIndex === 1) points = 6;
          if (hintIndex > 1) points = 3;
          setPointsEarned(prev => prev + points);
        }
      }
    }
  };

  const handleSubmitReasoning = async () => {
    if (!currentReasoning.trim()) return;
    
    setIsEvaluating(true);
    const isCorrect = selectedOption ? selectedOption === question.correctAnswer : null;
    
    const newLog = [...reasoningLog, { role: 'student' as const, content: currentReasoning }];
    setReasoningLog(newLog);
    setCurrentReasoning("");
    
    const result = await evaluateStudentAnswer(
      question.text,
      question.correctAnswer,
      selectedOption,
      newLog,
      isCorrect
    );
    
    if (result.mistakeType === 'Vague reasoning' || result.mistakeType === 'Hint request' || result.mistakeType === 'Clarification request') {
      setReasoningLog([...newLog, { role: 'ai', content: result.message }]);
      setIsEvaluating(false);
      if (result.mistakeType === 'Hint request') {
        setHintIndex(prev => prev + 1); // Track hint usage for points calculation
      }
    } else {
      if (!selectedOption && result.mistakeType !== 'Correct') {
        setReasoningLog([...newLog, { role: 'ai', content: result.message }]);
        setIsEvaluating(false);
      } else {
        if (!selectedOption && result.mistakeType === 'Correct') {
          setSelectedOption(question.correctAnswer);
        }
        
        setEvaluation(result);
        setStep('feedback');
        setIsEvaluating(false);
        setAttempts(prev => prev + 1);
        
        if (result.mistakeType === 'Correct') {
          // Calculate points based on hints used
          let points = 10;
          if (hintIndex === 1) points = 6;
          if (hintIndex > 1) points = 3;
          setPointsEarned(prev => prev + points);
        }
      }
    }
  };

  const handleNextHint = () => {
    if (evaluation?.hints && hintIndex < evaluation.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
  };

  const handleTryAgain = () => {
    const revealedHints = evaluation?.hints?.slice(0, hintIndex + 1) || [];
    let feedbackContext = `My previous feedback: ${evaluation?.message}`;
    if (revealedHints.length > 0) {
      feedbackContext += `\n\nHints provided:\n${revealedHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`;
    }

    setSelectedOption(null);
    setReasoningLog(prev => [
      ...prev,
      { role: 'ai', content: feedbackContext },
      { role: 'ai', content: "Let's try again! You can select a different option, or tell me what you're thinking now." }
    ]);
    setCurrentReasoning("");
    setEvaluation(null);
    setStep('select');
  };

  const handleNextQuestion = () => {
    const user = getCurrentUser();
    // Save stats for this question
    saveQuestionResult({
      questionId: question.id,
      questionText: question.text,
      attempts: attempts,
      hintsUsed: hintIndex,
      isCorrect: evaluation?.mistakeType === 'Correct',
      timestamp: Date.now(),
      conversation: reasoningLog,
      studentEmail: user.email
    });

    if (currentQuestionIdx < practiceSet.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setReasoningLog([]);
      setCurrentReasoning("");
      setEvaluation(null);
      setHintIndex(0);
      setAttempts(0);
      setStep('select');
      setStartTime(Date.now());
      setElapsedTime(0);
    } else {
      // Finished practice set
      navigate("/student");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-50 to-emerald-100 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/student/module/${moduleId}`)} className="hover:bg-white/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{practiceSet.title}</h1>
              <p className="text-sm text-slate-500 font-medium">Question {currentQuestionIdx + 1} of {practiceSet.questions.length}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-full bg-white px-5 py-2 shadow-sm border border-green-50">
            <span className="font-bold text-slate-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </span>
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">+{pointsEarned} Practice XP</span>
          </div>
        </header>

        <Progress value={((currentQuestionIdx) / practiceSet.questions.length) * 100} className="h-3 rounded-full bg-white/50 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-yellow-400" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Question & Options */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden rounded-3xl">
              <div className="h-2 bg-gradient-to-r from-green-500 to-yellow-400 w-full"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold leading-relaxed text-slate-800">
                  {question.text}
                </CardTitle>
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {question.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className={`space-y-3 ${step !== 'select' ? 'opacity-60 pointer-events-none' : ''}`}>
                  {question.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                        selectedOption === option 
                          ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]" 
                          : "border-slate-100 bg-white hover:bg-slate-50 hover:border-green-200 hover:shadow-sm"
                      }`}
                    >
                      <span className="font-bold text-green-600 mr-2">{String.fromCharCode(65 + i)}.</span> 
                      <span className="font-medium text-slate-700">{option}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: AI Tutor Chat */}
          <div className="lg:col-span-7">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl h-[600px] flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white flex items-center gap-3 shadow-md z-10">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">AI Tutor</h2>
                  <p className="text-xs text-green-100 font-medium">Socratic Guide</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Initial AI Message */}
                  {reasoningLog.length === 0 && step === 'select' && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 shadow-sm border border-yellow-200">
                        <Bot className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="bg-white border border-yellow-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-slate-700 max-w-[85%] text-[15px] leading-relaxed">
                        <p>Hi! I'm your AI Tutor. You can select an option to submit your answer, or ask me for a hint if you're stuck!</p>
                      </div>
                    </div>
                  )}

                  {/* Chat Log */}
                  {reasoningLog.map((log, idx) => (
                    <div key={idx} className={`flex gap-3 ${log.role === 'student' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${log.role === 'student' ? 'bg-green-100 border border-green-200' : 'bg-yellow-100 border border-yellow-200'}`}>
                        {log.role === 'student' ? <span className="font-bold text-green-600 text-[10px]">YOU</span> : <Bot className="h-6 w-6 text-yellow-600" />}
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] text-[15px] leading-relaxed whitespace-pre-wrap ${
                        log.role === 'student' 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-tr-none' 
                          : 'bg-white border border-yellow-100 text-slate-700 rounded-tl-none'
                      }`}>
                        {/* Render markdown-like bold text */}
                        <p dangerouslySetInnerHTML={{ __html: log.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    </div>
                  ))}

                  {/* Feedback / Evaluation */}
                  {step === 'feedback' && evaluation && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${evaluation.mistakeType === 'Correct' ? 'bg-emerald-100 border-emerald-200' : 'bg-amber-100 border-amber-200'}`}>
                        <Bot className={`h-6 w-6 ${evaluation.mistakeType === 'Correct' ? 'text-emerald-600' : 'text-amber-600'}`} />
                      </div>
                      <div className={`p-5 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] border ${
                        evaluation.mistakeType === 'Correct' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/5">
                          {evaluation.mistakeType === 'Correct' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-600" />}
                          <span className="font-bold text-sm uppercase tracking-wider">{evaluation.mistakeType}</span>
                        </div>
                        <p className="text-[15px] leading-relaxed mb-4">{evaluation.message}</p>

                        {/* Hints */}
                        {evaluation.hints && evaluation.hints.length > 0 && (
                          <div className="space-y-3 mt-4">
                            {evaluation.hints.slice(0, hintIndex + 1).map((hint, i) => (
                              <div key={i} className="bg-white/80 p-4 rounded-xl border border-amber-200 shadow-sm flex gap-3 animate-in fade-in">
                                <div className="bg-amber-100 p-1.5 rounded-lg h-fit">
                                  <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                </div>
                                <span className="text-[14px] leading-relaxed text-amber-950">{hint}</span>
                              </div>
                            ))}
                            {hintIndex < evaluation.hints.length - 1 && (
                              <Button variant="outline" size="sm" onClick={handleNextHint} className="w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800 font-medium">
                                Get another hint
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-5 flex gap-3 pt-2">
                          {evaluation.mistakeType !== 'Correct' && (
                            <Button onClick={handleTryAgain} className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-semibold flex-1">
                              Try Again
                            </Button>
                          )}
                          {(evaluation.mistakeType === 'Correct' || hintIndex >= (evaluation.hints?.length || 0) - 1) && (
                            <Button onClick={handleNextQuestion} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-semibold flex-1">
                              {currentQuestionIdx < practiceSet.questions.length - 1 ? "Next Question" : "Finish Practice"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} className="h-4" />
                </div>
              </div>

              {/* Input Box */}
              <div className={`p-4 bg-white border-t border-slate-100 z-10 ${step === 'feedback' ? 'opacity-50 pointer-events-none bg-slate-50' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Explain your reasoning</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleGetReasoningHint}
                    disabled={isEvaluating}
                    className="h-6 px-2 text-xs text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Get Hint
                  </Button>
                </div>
                <div className="relative flex items-end gap-2">
                  <Textarea 
                    placeholder={reasoningLog.length > 0 ? "Reply to the tutor..." : "I used the formula..."}
                    value={currentReasoning}
                    onChange={(e) => setCurrentReasoning(e.target.value)}
                    className="resize-none bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-green-500 min-h-[60px] text-[15px]"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitReasoning();
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    onClick={handleSubmitReasoning} 
                    disabled={!currentReasoning.trim() || isEvaluating}
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white h-[60px] w-[60px] flex-shrink-0 shadow-sm transition-all"
                  >
                    {isEvaluating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 ml-1" />}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2 font-medium uppercase tracking-wider">Press Enter to send</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
