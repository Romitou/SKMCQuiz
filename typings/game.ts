export interface User {
    discordId: string;
    name: string;
    avatar: string;
}

export interface GameQuestion {
    id: string;
    content: string;
    image: boolean;
    correctAnswerId: string | undefined;
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
}

export interface GameSession {
    question: GameQuestion | undefined;
    timeLeft: number | undefined;
    answeredQuestions: number | undefined;
}
