export interface User {
    discordId: string;
    name: string;
    avatar: string;
}

export interface GameQuestion {
    id: string;
    content: string;
    imageUrl: string;
    correctAnswerId: string | undefined;
    answers: GameAnswer[];
}

export interface GameAnswer {
    id: string;
    content: string;
    imageUrl: string;
}

export interface PrivateGameSession {
    startedAt: number,
    score: number,
    answers: Record<string, string>;
    currentQuestionId: string;
}

export interface GameSession {
    question: GameQuestion | undefined;
    timeLeft: number | undefined;
    answeredQuestions: number | undefined;
}
