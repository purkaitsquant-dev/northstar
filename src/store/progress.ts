export interface ChatMessage {
  role: 'student' | 'ai';
  content: string;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  attempts: number;
  hintsUsed: number;
  isCorrect: boolean;
  timestamp: number;
  conversation: ChatMessage[];
  studentEmail?: string;
}

export const saveQuestionResult = (result: QuestionResult) => {
  const existing = getQuestionResults();
  existing.push(result);
  localStorage.setItem('question_results', JSON.stringify(existing));
};

export const getQuestionResults = (): QuestionResult[] => {
  const data = localStorage.getItem('question_results');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const getAdminStats = () => {
  const results = getQuestionResults();
  if (results.length === 0) {
    return {
      avgAccuracy: 0,
      avgHints: 0,
    };
  }

  const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0);
  const avgHints = totalHints / results.length;

  // Accuracy could be defined as questions answered correctly on the first attempt
  // or (1 / avg attempts). Let's use correct on first attempt for simplicity,
  // or just 1 / attempts. Let's use correct on first attempt.
  const firstTryCorrect = results.filter(r => r.attempts === 1 && r.isCorrect).length;
  const avgAccuracy = Math.round((firstTryCorrect / results.length) * 100);

  return {
    avgAccuracy,
    avgHints: Number(avgHints.toFixed(1)),
  };
};
