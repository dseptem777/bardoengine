
import { performance } from 'perf_hooks';

const ITERATIONS = 1000;
const SEGMENTS_PER_ITERATION = 5000; // Increased significantly
const SAMPLE_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function runBenchmark(name, fn) {
    let totalLength = 0;
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = fn();
        totalLength += res.length;
    }
    const end = performance.now();
    const duration = end - start;
    console.log(`${name}: ${duration.toFixed(2)}ms (Check: ${totalLength})`);
    return duration;
}

console.log(`Running benchmark: ${ITERATIONS} iterations, ${SEGMENTS_PER_ITERATION} segments per iteration\n`);

// Scenario 1: Newline Separator (continueStory)
console.log("--- Scenario 1: 'continueStory' (separator: \\n\\n) ---");

const baseline1 = runBenchmark("String Concat (+ '\\n\\n')", () => {
    let fullText = "";
    for (let j = 0; j < SEGMENTS_PER_ITERATION; j++) {
        fullText += SAMPLE_TEXT + '\n\n';
    }
    return fullText.trim();
});

const optimized1 = runBenchmark("Array Join ('\\n\\n')", () => {
    const parts = [];
    for (let j = 0; j < SEGMENTS_PER_ITERATION; j++) {
        parts.push(SAMPLE_TEXT);
    }
    return parts.join('\n\n').trim();
});

console.log(`Improvement: ${((baseline1 - optimized1) / baseline1 * 100).toFixed(2)}%\n`);


// Scenario 2: No Separator (useEffect)
console.log("--- Scenario 2: 'useEffect' (no separator) ---");

const baseline2 = runBenchmark("String Concat (+=)", () => {
    let fullText = "";
    for (let j = 0; j < SEGMENTS_PER_ITERATION; j++) {
        fullText += SAMPLE_TEXT;
    }
    return fullText.trim();
});

const optimized2 = runBenchmark("Array Join ('')", () => {
    const parts = [];
    for (let j = 0; j < SEGMENTS_PER_ITERATION; j++) {
        parts.push(SAMPLE_TEXT);
    }
    return parts.join('').trim();
});

console.log(`Improvement: ${((baseline2 - optimized2) / baseline2 * 100).toFixed(2)}%\n`);
