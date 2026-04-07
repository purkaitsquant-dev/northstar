import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStoredModules } from "@/store/dataStore";
import { ArrowLeft, PlayCircle } from "lucide-react";

export default function StudentModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const module = getStoredModules().find(m => m.id === moduleId);

  if (!module) return <div>Module not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-emerald-50 p-6 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center space-x-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
          <Button variant="ghost" size="icon" onClick={() => navigate("/student")} className="hover:bg-white/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{module.title}</h1>
            <p className="text-slate-500 font-medium mt-1">Practice Sets</p>
          </div>
        </header>

        <div className="grid gap-6">
          {module.practiceSets.map((set, i) => (
            <Card key={set.id} className="border-0 shadow-md bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 w-full group-hover:from-yellow-400 group-hover:to-green-500 transition-all"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">Practice Set {i + 1}: {set.title}</CardTitle>
                  <CardDescription className="mt-2 font-medium text-slate-500">{set.questions.length} Questions</CardDescription>
                </div>
                <Button 
                  size="lg" 
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm font-semibold"
                  onClick={() => navigate(`/student/practice/${module.id}/${set.id}`)}
                >
                  <PlayCircle className="h-5 w-5" />
                  Start Practice
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
