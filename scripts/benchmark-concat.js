
import { performance } from 'perf_hooks';

const ITERATIONS = 1000;
const SEGMENTS_PER_ITERATION = 1000; // Large story turn
const SAMPLE_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const SAMPLE_TAGS = ["tag1", "tag2", "tag3"];

function runBenchmark(name, fn) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }
    const end = performance.now();
    const duration = end - start;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
}

console.log(`Running benchmark: ${ITERATIONS} iterations, ${SEGMENTS_PER_ITERATION} segments per iteration\n`);

// Scenario: continueStory
console.log("--- Scenario: continueStory ---");

const arrayJoin = runBenchmark("Current (Array Push + Join)", () => {
    const textParts = [];
    const allTags = [];
    for (let j = 0; j < SEGMENTS_PER_ITERATION; j++) {
        textParts.push(SAMPLE_TEXT);
        allTags.push(...SAMPLE_TAGS);
    }
    const fullText = textParts.join('\n\n');
    return { fullText, allTags };
});

const stringConcat = runBenchmark("Proposed (String Concat + Array Push)", () => {
    let fullText = "";
    const allTags = [];
    for (let j = 0; j < SEGMENTS_PER_ITERATION; j++) {
        fullText += SAMPLE_TEXT + '\n\n';
        allTags.push(...SAMPLE_TAGS);
    }
    fullText = fullText.trim();
    return { fullText, allTags };
});

const arraySpread = runBenchmark("Bad (String Concat + Array Spread)", () => {
    let fullText = "";
    let allTags = [];
    for (let j = 0; j < SEGMENTS_PER_ITERATION; j++) {
        fullText += SAMPLE_TEXT + '\n\n';
        allTags = [...allTags, ...SAMPLE_TAGS];
    }
    fullText = fullText.trim();
    return { fullText, allTags };
});

console.log(`\nComparison vs Current:`);
console.log(`String Concat: ${((arrayJoin - stringConcat) / arrayJoin * 100).toFixed(2)}% faster`);
console.log(`Array Spread (Bad): ${((arrayJoin - arraySpread) / arrayJoin * 100).toFixed(2)}% faster`);
