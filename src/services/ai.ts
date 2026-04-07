export type MistakeType = 'Concept error' | 'Formula selection error' | 'Logical reasoning error' | 'Calculation mistake' | 'Guesswork' | 'Correct' | 'Vague reasoning' | 'Hint request' | 'Clarification request';

export interface EvaluationResult {
  mistakeType: MistakeType;
  message: string;
  hints?: string[];
}

export async function generateHintForQuestion(
  _question: string,
  _correctAnswer: string,
  _previousHints: string[]
): Promise<string> {
  return "Try breaking the problem down into smaller steps.";
}

export async function evaluateStudentAnswer(
  _question: string,
  _correctAnswer: string,
  studentSelectedOption: string | null,
  _studentReasoningLog: { role: string, content: string }[],
  isOptionCorrect: boolean | null
): Promise<EvaluationResult> {
  if (isOptionCorrect) {
    return {
      mistakeType: 'Correct',
      message: "Correct! Well done.",
    };
  }

  if (studentSelectedOption) {
    return {
      mistakeType: 'Concept error',
      message: "Not quite. Check your steps and try again.",
      hints: ["Review the core concept.", "Double check your calculation."]
    };
  }

  return {
    mistakeType: 'Hint request',
    message: "What's your approach to this problem?",
    hints: ["Think about the first step."]
  };
}
