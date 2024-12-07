const fs = require('fs');
const path = require('path');

// Utility function to calculate file size
function getFileSize(filePath) {
    return fs.statSync(filePath).size;
}

// Recursive function to index the directory
function indexDirectory(baseDir, currentDir, prefix) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const metadata = {};
    
    entries.forEach((entry) => {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        const prefixedPath = path.posix.join(prefix, relativePath.split(path.sep).join('/'));

        if (entry.isDirectory()) {
            const children = fs.readdirSync(fullPath).map((child) => child);
            metadata[prefixedPath] = children;
            Object.assign(metadata, indexDirectory(baseDir, fullPath, prefix));
        } else if (entry.isFile()) {
            metadata[prefixedPath] = getFileSize(fullPath);
        }
    });

    return metadata;
}

// Main function
function main() {
    const [,, prefix, inputDir, outputFile] = process.argv;

    if (!prefix || !inputDir || !outputFile) {
        console.error('Usage: node index_data.js <prefix> <inputDir> <outputFile>');
        process.exit(1);
    }

    const absoluteInputDir = path.resolve(inputDir);

    if (!fs.existsSync(absoluteInputDir) || !fs.statSync(absoluteInputDir).isDirectory()) {
        console.error('Error: Invalid input directory');
        process.exit(1);
    }

    const index = indexDirectory(absoluteInputDir, absoluteInputDir, prefix);

    fs.writeFileSync(outputFile, JSON.stringify(index, null, 4));
    console.log(`Index written to ${outputFile}`);
}

// Run the script
main();
