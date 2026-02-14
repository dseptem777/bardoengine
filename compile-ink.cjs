// Compile Ink using inkjs's built-in compiler for version compatibility
const { Compiler } = require('inkjs/compiler/Compiler');
const fs = require('fs');

// Accept command line arguments or use defaults
const args = process.argv.slice(2);
const inkFile = args[0] || 'partuza.ink';
const outputFile = args[1] || 'src/stories/partuza.json';

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
        console.error('Details:');
        e.errors.forEach(err => console.error('  -', err));
    } else {
        console.error('No detailed errors found in the exception object.');
        console.error(e); // Print full error
    }
}
