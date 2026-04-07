import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getStoredModules, saveModules } from "@/store/dataStore";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function ModuleEditor() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<any>(null);

  useEffect(() => {
    if (moduleId === "new") {
      setModule({
        id: `mod-${Date.now()}`,
        title: "",
        description: "",
        isUnlocked: false,
        progress: 0,
        practiceSets: []
      });
    } else {
      const existing = getStoredModules().find(m => m.id === moduleId);
      if (existing) setModule(existing);
      else navigate("/admin");
    }
  }, [moduleId, navigate]);

  if (!module) return <div className="p-8">Loading...</div>;

  const handleSave = () => {
    const allModules = getStoredModules();
    if (moduleId === "new") {
      saveModules([...allModules, module]);
    } else {
      saveModules(allModules.map(m => m.id === moduleId ? module : m));
    }
    navigate("/admin");
  };

  const addPracticeSet = () => {
    setModule((prev: any) => ({
      ...prev,
      practiceSets: [
        ...prev.practiceSets,
        { id: `set-${Date.now()}`, title: "New Practice Set", questions: [] }
      ]
    }));
  };

  const updatePracticeSet = (setId: string, title: string) => {
    setModule((prev: any) => ({
      ...prev,
      practiceSets: prev.practiceSets.map((s: any) => s.id === setId ? { ...s, title } : s)
    }));
  };

  const removePracticeSet = (setId: string) => {
    setModule((prev: any) => ({
      ...prev,
      practiceSets: prev.practiceSets.filter((s: any) => s.id !== setId)
    }));
  };

  const addQuestion = (setId: string) => {
    setModule((prev: any) => ({
      ...prev,
      practiceSets: prev.practiceSets.map((s: any) => {
        if (s.id === setId) {
          return {
            ...s,
            questions: [
              ...s.questions,
              {
                id: `q-${Date.now()}`,
                text: "",
                options: ["", "", "", ""],
                correctAnswer: "",
                explanation: ""
              }
            ]
          };
        }
        return s;
      })
    }));
  };

  const updateQuestion = (setId: string, questionId: string, field: string, value: any) => {
    setModule((prev: any) => ({
      ...prev,
      practiceSets: prev.practiceSets.map((s: any) => {
        if (s.id === setId) {
          return {
            ...s,
            questions: s.questions.map((q: any) => q.id === questionId ? { ...q, [field]: value } : q)
          };
        }
        return s;
      })
    }));
  };

  const updateQuestionOption = (setId: string, questionId: string, optionIndex: number, value: string) => {
    setModule((prev: any) => ({
      ...prev,
      practiceSets: prev.practiceSets.map((s: any) => {
        if (s.id === setId) {
          return {
            ...s,
            questions: s.questions.map((q: any) => {
              if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
              }
              return q;
            })
          };
        }
        return s;
      })
    }));
  };

  const removeQuestion = (setId: string, questionId: string) => {
    setModule((prev: any) => ({
      ...prev,
      practiceSets: prev.practiceSets.map((s: any) => {
        if (s.id === setId) {
          return {
            ...s,
            questions: s.questions.filter((q: any) => q.id !== questionId)
          };
        }
        return s;
      })
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
              {moduleId === "new" ? "Create Module" : "Edit Module"}
            </h1>
          </div>
          <Button onClick={handleSave}>Save Module</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={module.title}
                onChange={(e) => setModule({ ...module, title: e.target.value })}
                placeholder="Module Title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={module.description}
                onChange={(e) => setModule({ ...module, description: e.target.value })}
                placeholder="Module Description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isUnlocked"
                checked={module.isUnlocked}
                onChange={(e) => setModule({ ...module, isUnlocked: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="isUnlocked" className="text-sm font-medium">Unlocked (Students can access)</label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Practice Sets</h2>
            <Button variant="outline" onClick={addPracticeSet}>
              <Plus className="mr-2 h-4 w-4" /> Add Practice Set
            </Button>
          </div>

          {module.practiceSets.map((set: any, setIndex: number) => (
            <Card key={set.id} className="border-slate-200">
              <CardHeader className="bg-slate-100/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <label className="text-xs font-medium text-slate-500 uppercase">Practice Set Title</label>
                    <Input
                      value={set.title}
                      onChange={(e) => updatePracticeSet(set.id, e.target.value)}
                      className="mt-1 font-semibold"
                    />
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => removePracticeSet(set.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {set.questions.map((q: any, qIndex: number) => (
                  <div key={q.id} className="rounded-lg border border-slate-200 p-4 space-y-4 relative bg-white">
                    <div className="absolute top-4 right-4">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeQuestion(set.id, q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h4 className="font-medium text-slate-900">Question {qIndex + 1}</h4>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Question Text</label>
                      <Textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(set.id, q.id, "text", e.target.value)}
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
                              checked={q.correctAnswer === opt}
                              onChange={() => updateQuestion(set.id, q.id, "correctAnswer", opt)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                            />
                            <Input
                              value={opt}
                              onChange={(e) => {
                                updateQuestionOption(set.id, q.id, optIndex, e.target.value);
                                if (q.correctAnswer === opt) {
                                  updateQuestion(set.id, q.id, "correctAnswer", e.target.value);
                                }
                              }}
                              placeholder={`Option ${optIndex + 1}`}
                              className={q.correctAnswer === opt && opt !== "" ? "border-green-500 bg-green-50/50" : ""}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Explanation (Optional)</label>
                      <Textarea
                        value={q.explanation}
                        onChange={(e) => updateQuestion(set.id, q.id, "explanation", e.target.value)}
                        placeholder="Explain the correct answer..."
                      />
                    </div>
                  </div>
                ))}

                <Button variant="secondary" className="w-full" onClick={() => addQuestion(set.id)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
