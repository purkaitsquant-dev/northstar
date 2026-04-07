import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getStoredCompetitions, saveCompetitions } from "@/store/dataStore";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function CompetitionEditor() {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState<any>(null);

  useEffect(() => {
    if (competitionId === "new") {
      setCompetition({
        id: `comp-${Date.now()}`,
        title: "",
        durationMinutes: 30,
        status: 'upcoming',
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        questions: []
      });
    } else {
      const existing = getStoredCompetitions().find(c => c.id === competitionId);
      if (existing) setCompetition(existing);
      else navigate("/admin");
    }
  }, [competitionId, navigate]);

  if (!competition) return <div className="p-8">Loading...</div>;

  const handleSave = () => {
    const allComps = getStoredCompetitions();
    if (competitionId === "new") {
      saveCompetitions([...allComps, competition]);
    } else {
      saveCompetitions(allComps.map(c => c.id === competitionId ? competition : c));
    }
    navigate("/admin");
  };

  const addQuestion = () => {
    setCompetition((prev: any) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `cq-${Date.now()}`,
          text: "",
          options: ["", "", "", ""],
          correctAnswer: ""
        }
      ]
    }));
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    setCompetition((prev: any) => ({
      ...prev,
      questions: prev.questions.map((q: any) => q.id === questionId ? { ...q, [field]: value } : q)
    }));
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setCompetition((prev: any) => ({
      ...prev,
      questions: prev.questions.map((q: any) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const removeQuestion = (questionId: string) => {
    setCompetition((prev: any) => ({
      ...prev,
      questions: prev.questions.filter((q: any) => q.id !== questionId)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {competitionId === "new" ? "Create Competition" : "Edit Competition"}
            </h1>
          </div>
          <Button onClick={handleSave}>Save Competition</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Competition Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={competition.title}
                onChange={(e) => setCompetition({ ...competition, title: e.target.value })}
                placeholder="Competition Title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Minutes)</label>
                <Input
                  type="number"
                  value={competition.durationMinutes}
                  onChange={(e) => setCompetition({ ...competition, durationMinutes: parseInt(e.target.value) || 0 })}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="datetime-local"
                  value={new Date(new Date(competition.startTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setCompetition({ ...competition, startTime: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
            <Button variant="outline" onClick={addQuestion}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {competition.questions.map((q: any, qIndex: number) => (
            <Card key={q.id} className="border-slate-200">
              <CardContent className="pt-6 space-y-4 relative">
                <div className="absolute top-4 right-4">
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <h4 className="font-medium text-slate-900">Question {qIndex + 1}</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Text</label>
                  <Textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                    placeholder="Enter question text here..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Options</label>
                  <div className="grid gap-2">
                    {q.options.map((opt: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswer === opt && opt !== ""}
                          onChange={() => updateQuestion(q.id, "correctAnswer", opt)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                        />
                        <Input
                          value={opt}
                          onChange={(e) => {
                            updateQuestionOption(q.id, optIndex, e.target.value);
                            if (q.correctAnswer === opt) {
                              updateQuestion(q.id, "correctAnswer", e.target.value);
                            }
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                          className={q.correctAnswer === opt && opt !== "" ? "border-green-500 bg-green-50/50" : ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
