import { LEVELS } from './constants.js';
import { shuffleArray } from './helpers.js';

const OPERATORS = ['add', 'subtract', 'multiply', 'divide'];

// Safe operator pairs for hybrid: [op1, op2]
// PEMDAS: op2 computed first, then op1
const HYBRID_PAIRS = [
    ['add', 'multiply'],     // a + b × c → a + (b × c)
    ['subtract', 'multiply'], // a - b × c → a - (b × c)
    ['multiply', 'add'],     // a × b + c → (a × b) + c
    ['multiply', 'subtract'],// a × b - c → (a × b) - c
    ['add', 'divide'],       // a + b ÷ c → a + (b ÷ c)
    ['subtract', 'divide'],  // a - b ÷ c → a - (b ÷ c)
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function computeSingle(a, b, op) {
    switch (op) {
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide': return a / b;
        default: return a + b;
    }
}

// PEMDAS: compute op2 first (b op2 c), then apply op1 (a op1 result)
function computeHybridAnswer(a, op1, b, op2, c) {
    const right = computeSingle(b, c, op2);
    return computeSingle(a, right, op1);
}

function maxAllowed(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    return level ? level.range[1] : Infinity;
}

function getLevelRange(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    return { min: level.range[0], max: level.range[1] };
}

function generateDistractors(correct, levelId) {
    const distractors = new Set();
    const { min, max } = getLevelRange(levelId);
    const maxAllowedVal = maxAllowed(levelId);
    let attempts = 0;

    while (distractors.size < 3 && attempts < 100) {
        let candidate;
        const r = Math.random();
        if (r < 0.3) {
            // Close to correct
            const offset = randomInt(1, Math.max(3, Math.floor((max - min) / 3)));
            candidate = correct + (Math.random() < 0.5 ? offset : -offset);
        } else if (r < 0.6) {
            // Random within level range
            candidate = randomInt(min, max);
        } else {
            // Offset by small amount
            candidate = correct + randomInt(-5, 5);
        }

        if (candidate !== correct && candidate >= min && candidate <= maxAllowedVal && !distractors.has(candidate)) {
            distractors.add(candidate);
        }
        attempts++;
    }

    // Fallback: fill with randoms in range
    while (distractors.size < 3) {
        const fallback = randomInt(min, Math.min(max, maxAllowedVal));
        if (fallback !== correct && !distractors.has(fallback)) {
            distractors.add(fallback);
        }
    }

    return Array.from(distractors).slice(0, 3);
}

function generateHybridQuestion(levelId) {
    const { min, max } = getLevelRange(levelId);
    const maxAllowedVal = maxAllowed(levelId);

    let attempts = 0;
    while (attempts < 200) {
        const [op1, op2] = HYBRID_PAIRS[randomInt(0, HYBRID_PAIRS.length - 1)];
        let a, b, c;

        if (op2 === 'multiply') {
            // b × c: keep both small so product ≤ max
            const maxBC = Math.floor(Math.sqrt(max));
            b = randomInt(1, Math.min(maxBC, 9));
            c = randomInt(1, Math.min(maxBC, 9));
            const product = b * c;
            // Pick a based on op1
            if (op1 === 'add') {
                // a + product ≤ max → a ≤ max - product
                a = randomInt(min, Math.max(min, max - product));
            } else {
                // a - product ≥ min → a ≥ min + product
                a = randomInt(Math.max(min, min + product), max);
            }
        } else if (op2 === 'divide') {
            // b ÷ c: clean division, c ∈ [2, 9]
            c = randomInt(2, Math.min(9, max));
            const quotient = randomInt(min, max);
            b = quotient * c;
            if (b > max * 5) {
                attempts++;
                continue;
            }
            // Pick a based on op1
            if (op1 === 'add') {
                a = randomInt(min, Math.max(min, max - quotient));
            } else {
                a = randomInt(Math.max(min, min + quotient), max);
            }
        } else {
            // op2 is add/subtract: a op1 (b op2 c)
            a = randomInt(min, max);
            b = randomInt(min, max);
            c = randomInt(min, max);
        }

        const correctAnswer = computeHybridAnswer(a, op1, b, op2, c);

        // Answer must be integer, within range, and positive
        if (!Number.isInteger(correctAnswer)) {
            attempts++;
            continue;
        }
        if (correctAnswer < min || correctAnswer > maxAllowedVal) {
            attempts++;
            continue;
        }
        // For subtract, ensure a ≥ (b op2 c) so answer is positive
        if (op1 === 'subtract') {
            const right = computeSingle(b, c, op2);
            if (a < right) {
                attempts++;
                continue;
            }
        }

        return {
            a, op1, b, op2, c,
            correctAnswer,
            isHybrid: true,
        };
    }

    // Fallback: simple a + b × 1
    return {
        a: min, op1: 'add', b: min, op2: 'multiply', c: 1,
        correctAnswer: min + min,
        isCampuran: true,
    };
}

export function generateQuestions(levelId, count, operator = 'add') {
    const { min, max } = getLevelRange(levelId);
    const maxAllowedVal = maxAllowed(levelId);
    const questions = [];
    const usedPairs = new Set();

    for (let i = 0; i < count; i++) {
        let question;
        let key;
        let attempts = 0;

        do {
            if (operator === 'hybrid') {
                question = generateHybridQuestion(levelId);
                key = `hybrid-${question.a}-${question.op1}-${question.b}-${question.op2}-${question.c}`;
            } else {
                let a, b, op;
                op = operator;

                if (op === 'divide') {
                    const answer = randomInt(min, max);
                    b = randomInt(min, max);
                    a = answer * b;
                    if (a > max * 2) a = b * randomInt(1, 5);
                } else if (op === 'multiply') {
                    a = randomInt(min, max);
                    b = randomInt(1, Math.min(3, max));
                } else if (op === 'subtract') {
                    a = randomInt(min, max);
                    b = randomInt(min, max);
                    if (b > a) [a, b] = [b, a];
                } else {
                    a = randomInt(min, max);
                    b = randomInt(min, max);
                }

                const correctAnswer = computeSingle(a, b, op);
                key = `${op}-${a}-${b}`;
                question = { a, b, op, correctAnswer, isCampuran: false };
            }

            attempts++;
        } while (usedPairs.has(key) && attempts < 50);

        usedPairs.add(key);
        const distractors = generateDistractors(question.correctAnswer, levelId);
        question.options = shuffleArray([question.correctAnswer, ...distractors]);
        questions.push(question);
    }

    return questions;
}
