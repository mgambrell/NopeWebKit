const fs = require('fs');
const path = require('path');

// Generate a flat file list with paths as keys and children indices for directories
function generateFileListJson(directory, prefix = '', currentPath = '') {
	const entries = fs.readdirSync(directory, { withFileTypes: true });

	const result = {};
	const childrenIndices = {};

	entries.forEach((entry, index) => {
		const fullPath = path.join(directory, entry.name);
		const isDirectory = entry.isDirectory();
		const size = isDirectory ? 0 : fs.statSync(fullPath).size;

		// Build the relative path with `/` separators
		const relativePath = path.posix.join(currentPath, entry.name);
		const fullPathWithPrefix = prefix + path.posix.join('/', relativePath);

		// Add the entry to the flat result
		result[fullPathWithPrefix] = [isDirectory ? 0 : 1, size, entry.name];

		// If it's a directory, track its children for indices
		if (isDirectory) {
			const nestedEntries = generateFileListJson(fullPath, prefix, relativePath);
			Object.assign(result, nestedEntries);

			// Get the child indices for the current directory
			const allEntries = Object.entries(result);
			const currentChildren = Object.keys(nestedEntries);
			childrenIndices[fullPathWithPrefix] = currentChildren.map(child =>
				allEntries.findIndex(([key]) => key === child)
			);
		}
	});

	// Add child indices to directories
	Object.entries(childrenIndices).forEach(([dirPath, indices]) => {
		if (result[dirPath]) {
			result[dirPath].push(indices);
		}
	});

	return result;
}

function main() {
	if (process.argv.length < 5) {
		console.error('Usage: node index_data.js <prefix> <inputDir> <outputFile>');
		process.exit(1);
	}

	const prefix = _normalizePath(process.argv[2]); // Prefix for paths
	const dataDir = path.resolve(process.argv[3]); // Input directory
	const outputFile = path.resolve(process.argv[4]); // Output file

	console.log('Starting recursive content indexing...');
	const fileList = generateFileListJson(dataDir, prefix);

	// Write the flat JSON structure to the output file (minified)
	fs.writeFileSync(outputFile, JSON.stringify(fileList), 'utf8');
	console.log(`Content indexing complete. File written to: ${outputFile}`);
}

// Normalize paths by replacing backslashes and ensuring a leading slash
function _normalizePath(filePath) {
	filePath = filePath.replace(/\\/g, '/');
	if (filePath[0] !== '/') {
		filePath = '/' + filePath;
	}
	return filePath;
}

// Run the script
main();
