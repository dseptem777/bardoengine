// Compile Ink using inkjs's built-in compiler for version compatibility
const { Compiler } = require('inkjs/compiler/Compiler');
const fs = require('fs');

const inkFile = 'partuza.ink';
const outputFile = 'src/stories/partuza.json';

try {
    const inkSource = fs.readFileSync(inkFile, 'utf8');
    const compiler = new Compiler(inkSource);
    const story = compiler.Compile();

    // Get the JSON output
    const jsonOutput = story.ToJson();

    fs.writeFileSync(outputFile, jsonOutput);
    console.log('✅ Compiled successfully to', outputFile);
    console.log('   Using inkjs built-in compiler for version compatibility');
} catch (e) {
    console.error('❌ Compilation error:', e.message);
    if (e.errors) {
        e.errors.forEach(err => console.error('  -', err));
    }
}
