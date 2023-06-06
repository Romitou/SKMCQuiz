export interface User {
    discordId: string;
    name: string;
    avatar: string;
}

export interface PrivateGameQuestion {
    id: string;
    content: string;
    image: boolean;
    averageResponseTime: number;
    score: number;
    averageScore: number;
    correctAnswerId: string | undefined;
    answers: PrivateGameAnswer[];
}

export interface PrivateGameAnswer {
    id: string;
    content: string;
    image: boolean;
    answerPercentage: number;
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

export interface PrivateGameSession {
    startedAt: number,
    score: number,
    answers: Record<string, string>;
    timings: Record<string, number>;
    currentQuestionId: string;
    remainingTime: number;
    bonus: number;
    name: string;
    discordId: string;
    ip: string | undefined;
}

export interface GameSession {
    question: PrivateGameQuestion | undefined;
    timeLeft: number | undefined;
    answeredQuestions: number | undefined;
}
