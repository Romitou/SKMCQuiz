import type { H3Event } from 'h3';
import type { GameQuestion } from '../../typings/game';

export async function getRandomQuestion(event: H3Event, level: number): Promise<GameQuestion> {
    const QUESTIONS: KVNamespace = event.context.cloudflare.env.questions;

    const questions = await QUESTIONS.get(`level-${level}`, { type: 'json' }) as GameQuestion[];
    const question = questions[Math.floor(Math.random() * questions.length)];

    question.correctAnswerId = undefined;

    return question;
}

export async function getQuestion(event: H3Event, id: string, level: number, isPrivate: boolean): Promise<GameQuestion | undefined> {
    const QUESTIONS: KVNamespace = event.context.cloudflare.env.questions;

    const questions = await QUESTIONS.get(`level-${level}`, { type: 'json' }) as GameQuestion[];
    const question = questions.find(q => q.id === id);

    if (!isPrivate && question) {
        question.correctAnswerId = undefined;
    }

    return question;
}

export function getLevelScore(level: number): number {
    if (level <= 0) {
        throw createError({
            statusCode: 500,
            message: 'An error occurred while calculating your score.',
        });
    }

    if (level === 1) {
        return 2;
    } else if (level <= 5) {
        return 3;
    } else if (level <= 9) {
        return 4;
    } else if (level <= 13) {
        return 5;
    } else if (level <= 15) {
        return 6;
    } else if (level <= 17) {
        return 7;
    } else if (level === 18) {
        return 8;
    } else if (level === 19) {
        return 9;
    } else {
        return 10;
    }
}
