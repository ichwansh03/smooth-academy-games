import { LEVELS } from './constants.js';
import { shuffleArray } from './helpers.js';

const OPERATORS = ['add', 'subtract', 'multiply', 'divide'];
const MIXED_OPERATORS = ['add', 'subtract', 'multiply', 'divide'];

function randomOperator() {
    return MIXED_OPERATORS[Math.floor(Math.random() * MIXED_OPERATORS.length)];
}

function computeAnswer(a, b, op) {
    switch (op) {
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide': return a;
        default: return a + b;
    }
}

function generateDistractors(correct, levelId, op) {
    const distractors = new Set();
    let range;
    if (levelId === 1) range = [1, 6];
    else if (levelId === 2) range = [3, 20];
    else if (levelId === 3) range = [10, 50];
    else range = [20, 200];

    const maxAllowed = levelId === 1 ? 9 : Infinity;
    let attempts = 0;
    while (distractors.size < 3 && attempts < 100) {
        let candidate;
        if (op === 'divide') {
            candidate = correct + Math.floor(Math.random() * 5) + 1;
        } else if (op === 'multiply') {
            candidate = correct + Math.floor(Math.random() * 10) - 5;
        } else {
            const offset = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
            const sign = Math.random() < 0.5 ? -1 : 1;
            candidate = correct + sign * offset;
        }
        if (candidate !== correct && candidate > 0 && candidate <= maxAllowed && !distractors.has(candidate)) {
            distractors.add(candidate);
        }
        attempts++;
    }
    while (distractors.size < 3) {
        if (levelId === 1) {
            const fallback = Math.floor(Math.random() * 9) + 1;
            if (fallback !== correct && !distractors.has(fallback)) {
                distractors.add(fallback);
            }
        } else {
            const fallback = correct + distractors.size + 1 + Math.floor(Math.random() * 5);
            if (!distractors.has(fallback) && fallback !== correct && fallback > 0) {
                distractors.add(fallback);
            }
        }
    }
    return Array.from(distractors).slice(0, 3);
}

export function generateQuestions(levelId, count, operator = 'add') {
    const level = LEVELS.find(l => l.id === levelId);
    const min = level.range[0];
    const max = level.range[1];
    const questions = [];
    const usedPairs = new Set();

    for (let i = 0; i < count; i++) {
        let a, b, op, key, correctAnswer;
        let attempts = 0;

        do {
            if (operator === 'campuran') {
                op = randomOperator();
            } else {
                op = operator;
            }

            if (op === 'divide') {
                const answer = Math.floor(Math.random() * (max - min + 1)) + min;
                b = Math.floor(Math.random() * (max - min + 1)) + min;
                a = answer * b;
                if (a > max * 2) a = b * Math.floor(Math.random() * 5 + 1);
            } else if (op === 'multiply') {
                a = Math.floor(Math.random() * (max - min + 1)) + min;
                b = Math.floor(Math.random() * 3) + 1;
            } else if (op === 'subtract') {
                a = Math.floor(Math.random() * (max - min + 1)) + min;
                b = Math.floor(Math.random() * (max - min + 1)) + min;
                if (b > a) [a, b] = [b, a];
            } else {
                a = Math.floor(Math.random() * (max - min + 1)) + min;
                b = Math.floor(Math.random() * (max - min + 1)) + min;
            }

            key = `${op}-${a}-${b}`;
            correctAnswer = computeAnswer(a, b, op);
            attempts++;
        } while ((usedPairs.has(key) || correctAnswer < 0 || correctAnswer > maxAllowed(levelId)) && attempts < 50);

        usedPairs.add(key);
        const distractors = generateDistractors(correctAnswer, levelId, op);
        questions.push({
            a, b, op, correctAnswer,
            options: shuffleArray([correctAnswer, ...distractors]),
        });
    }
    return questions;
}

function maxAllowed(levelId) {
    return levelId === 1 ? 9 : Infinity;
}
