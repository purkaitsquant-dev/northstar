import { MOCK_COMPETITIONS, MOCK_MODULES, MOCK_LEADERBOARD, Competition, Module } from './mockData';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  password?: string;
}

export interface CompetitionLog {
  id: string;
  competitionId: string;
  userId: string;
  userName: string;
  deviceName: string;
  loginTime: string;
}

export interface CompetitionResultDetail {
  questionId: string;
  questionText: string;
  answerGiven: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface CompetitionResult {
  id: string;
  competitionId: string;
  userId: string;
  userName: string;
  score: number;
  completedAt: string;
  details?: CompetitionResultDetail[];
}

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alex', email: 'alex@example.com', role: 'student', password: 'password123' },
  { id: 'u2', name: 'Admin User', email: 'admin@example.com', role: 'admin', password: 'admin' }
];

export const getStoredCompetitions = (): Competition[] => {
  const data = localStorage.getItem('competitions');
  return data ? JSON.parse(data) : MOCK_COMPETITIONS;
};

export const saveCompetitions = (comps: Competition[]) => {
  localStorage.setItem('competitions', JSON.stringify(comps));
};

export const getStoredModules = (): Module[] => {
  const data = localStorage.getItem('modules');
  return data ? JSON.parse(data) : MOCK_MODULES;
};

export const saveModules = (mods: Module[]) => {
  localStorage.setItem('modules', JSON.stringify(mods));
};

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem('users');
  return data ? JSON.parse(data) : INITIAL_USERS;
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const getStoredCompetitionLogs = (): CompetitionLog[] => {
  const data = localStorage.getItem('competitionLogs');
  return data ? JSON.parse(data) : [];
};

export const saveCompetitionLogs = (logs: CompetitionLog[]) => {
  localStorage.setItem('competitionLogs', JSON.stringify(logs));
};

export const getStoredCompetitionResults = (): CompetitionResult[] => {
  const data = localStorage.getItem('competitionResults');
  return data ? JSON.parse(data) : [];
};

export const saveCompetitionResults = (results: CompetitionResult[]) => {
  localStorage.setItem('competitionResults', JSON.stringify(results));
};

export const getCurrentUser = (): User => {
  const data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : INITIAL_USERS[0];
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};
