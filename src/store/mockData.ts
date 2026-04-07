export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  tags?: string[];
}

export interface PracticeSet {
  id: string;
  title: string;
  questions: Question[];
}

export interface Module {
  id: string;
  title: string;
  unlockDay: number;
  practiceSets: PracticeSet[];
  isUnlocked: boolean;
}

export interface Competition {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'upcoming' | 'active' | 'completed';
  startTime: string;
  questions: Question[];
}

export const MOCK_COMPETITIONS: Competition[] = [
  {
    id: "comp-1",
    title: "Spring Math Olympiad",
    durationMinutes: 5,
    status: 'active',
    startTime: "2026-03-14T23:45:00-07:00",
    questions: [
      {
        id: "cq1",
        text: "What is 15% of 80?",
        options: ["10", "12", "15", "20"],
        correctAnswer: "12"
      },
      {
        id: "cq2",
        text: "Solve for x: 3x + 5 = 20",
        options: ["5", "10", "15", "20"],
        correctAnswer: "5"
      },
      {
        id: "cq3",
        text: "What is the area of a circle with radius 3? (Use pi=3.14)",
        options: ["18.84", "24.26", "9.42", "31.4"],
        correctAnswer: "24.26"
      }
    ]
  }
];

export const MOCK_MODULES: Module[] = [
  {
    id: "m1",
    title: "Module 1: Algebra Foundations",
    unlockDay: 1,
    isUnlocked: true,
    practiceSets: [
      {
        id: "ps1",
        title: "Arithmetic Progressions",
        questions: [
          {
            id: "q1",
            text: "Find the sum of the first 10 terms of the arithmetic progression: 2, 5, 8, 11, ...",
            options: ["145", "155", "165", "175"],
            correctAnswer: "155"
          },
          {
            id: "q2",
            text: "If the 3rd term of an AP is 10 and the 7th term is 22, find the 10th term.",
            options: ["24", "31", "34", "37"],
            correctAnswer: "31"
          }
        ]
      },
      {
        id: "ps2",
        title: "Quadratic Equations",
        questions: [
          {
            id: "q3",
            text: "Find the roots of the equation x^2 - 5x + 6 = 0",
            options: ["2, 3", "-2, -3", "1, 6", "-1, -6"],
            correctAnswer: "2, 3"
          }
        ]
      }
    ]
  },
  {
    id: "m2",
    title: "Module 2: Geometry",
    unlockDay: 2,
    isUnlocked: false,
    practiceSets: []
  },
  {
    id: "m3",
    title: "Module 3: Probability",
    unlockDay: 3,
    isUnlocked: false,
    practiceSets: []
  }
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alice Smith", points: 1250 },
  { rank: 2, name: "Bob Johnson", points: 1120 },
  { rank: 3, name: "Charlie Brown", points: 980 },
  { rank: 4, name: "Diana Prince", points: 950 },
  { rank: 5, name: "Eve Davis", points: 890 },
];
