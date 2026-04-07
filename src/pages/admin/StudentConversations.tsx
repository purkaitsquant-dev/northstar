import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQuestionResults, QuestionResult } from "@/store/progress";
import { ArrowLeft, MessageSquare, User, Calendar, CheckCircle2, XCircle, ChevronRight, Bot } from "lucide-react";

export default function StudentConversations() {
  const navigate = useNavigate();
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<QuestionResult | null>(null);
  const [filterEmail, setFilterEmail] = useState<string>("all");

  useEffect(() => {
    const allResults = getQuestionResults();
    // Sort by timestamp descending
    setResults(allResults.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const uniqueStudents = Array.from(new Set(results.map(r => r.studentEmail).filter(Boolean)));

  const filteredResults = filterEmail === "all" 
    ? results 
    : results.filter(r => r.studentEmail === filterEmail);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tutor Conversations</h1>
              <p className="text-slate-500">Review student interactions with the AI Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Filter by Student:</span>
            <select 
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            >
              <option value="all">All Students</option>
              {uniqueStudents.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Conversation List */}
          <Card className="md:col-span-1 h-[calc(100vh-200px)] overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
              <CardDescription>{filteredResults.length} sessions found</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto">
              <div className="divide-y">
                {filteredResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No conversations found for this selection.
                  </div>
                ) : (
                  filteredResults.map((result, idx) => (
                    <button
                      key={`${result.timestamp}-${idx}`}
                      onClick={() => setSelectedResult(result)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                        selectedResult?.timestamp === result.timestamp ? 'bg-blue-50/50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className={`mt-1 p-2 rounded-full ${result.isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}>
                        {result.isCorrect ? (
                          <CheckCircle2 className={`h-4 w-4 ${result.isCorrect ? 'text-green-600' : 'text-amber-600'}`} />
                        ) : (
                          <XCircle className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-900 truncate">
                            {result.studentEmail?.split('@')[0] || 'Student'}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-1">{result.questionText}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {result.hintsUsed} hints
                          </Badge>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {result.attempts} attempts
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 mt-2" />
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conversation Detail */}
          <Card className="md:col-span-2 h-[calc(100vh-200px)] overflow-hidden flex flex-col">
            {selectedResult ? (
              <>
                <CardHeader className="border-b bg-white shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{selectedResult.studentEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{selectedResult.questionText}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                  <div className="space-y-6">
                    {selectedResult.conversation && selectedResult.conversation.length > 0 ? (
                      selectedResult.conversation.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                            msg.role === 'student' ? 'bg-green-100 border-green-200' : 'bg-blue-100 border-blue-200'
                          }`}>
                            {msg.role === 'student' ? (
                              <span className="text-[10px] font-bold text-green-600">YOU</span>
                            ) : (
                              <Bot className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className={`p-4 rounded-2xl shadow-sm max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'student' 
                              ? 'bg-green-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                          }`}>
                            <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 italic">
                        No detailed conversation log recorded for this session.
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <MessageSquare className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-1">Select a session</h3>
                <p className="max-w-xs">Choose a conversation from the list on the left to view the full interaction history.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
