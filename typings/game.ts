export interface User {
    discordId: string;
    name: string;
    avatar: string;
}

export interface PrivateGameQuestion {
    id: string;
    content: string;
    level: number;
    image: boolean;
    averageResponseTime: number;
    totalResponseTime: number;
    score: number;
    averageScore: number;
    totalScore: number;
    correctAnswerId: string | undefined;
    answers: PrivateGameAnswer[];
}

export interface SummaryQuestion {
    id: string;
    content: string;
    level: number;
    userScore: number;
    image: boolean;
    averageResponseTime: number;
    averageScore: number;
    answers: SummaryAnswer[];
}

export interface SummaryAnswer {
    id: string;
    content: string;
    image: boolean;
    answerPercentage: number;
    correct: boolean;
    selected: boolean;
}

export interface PrivateGameAnswer {
    id: string;
    content: string;
    image: boolean;
    answerPercentage: number;
    count: number;
}


export interface GameQuestion {
    id: string;
    content: string;
    image: boolean;
    answers: GameAnswer[];
}

export interface GameAnswer {
    id: string;
    content: string;
    image: boolean;
}

export interface Summary {
    cachedAt: string;
    score: number;
    bonus: number;
    bonusComment: string;
    questions: SummaryQuestion[];
}

export interface PrivateGameSession {
    startedAt: number,
    score: number,
    answers: Record<string, string>;
    timings: Record<string, number>;
    currentQuestionId: string;
    remainingTime: number;
    bonus: number;
    bonusComment: string | undefined;
    name: string;
    discordId: string;
    ip: string | undefined;
}

export interface GameSession {
    question: PrivateGameQuestion | undefined;
    timeLeft: number | undefined;
    answeredQuestions: number | undefined;
}
