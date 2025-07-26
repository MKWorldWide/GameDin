const fs = require('fs');
const path = require('path');

// Function to fix package.json files
function fixPackageJson(filePath) {
  try {
    console.log(`Checking ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Try to parse the JSON to check for syntax errors
    try {
      JSON.parse(content);
      console.log(`✓ ${path.basename(filePath)} is valid`);
      return true;
    } catch (error) {
      console.error(`✗ Error in ${filePath}: ${error.message}`);
      
      // Try to fix common JSON issues
      try {
        // Remove trailing commas
        let fixedContent = content.replace(/,\s*([}\]])/g, '$1');
        
        // Remove comments (not valid in JSON)
        fixedContent = fixedContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
        
        // Try parsing again
        JSON.parse(fixedContent);
        
        // If we get here, the fixed content is valid JSON
        const backupPath = `${filePath}.bak`;
        fs.writeFileSync(backupPath, content, 'utf8');
        fs.writeFileSync(filePath, JSON.stringify(JSON.parse(fixedContent), null, 2) + '\n', 'utf8');
        
        console.log(`✓ Fixed ${path.basename(filePath)}. Backup saved to ${backupPath}`);
        return true;
      } catch (fixError) {
        console.error(`✗ Could not automatically fix ${path.basename(filePath)}: ${fixError.message}`);
        return false;
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Find all package.json files in the monorepo
function findPackageJsons(dir, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory() && file.name !== 'node_modules' && !file.name.startsWith('.')) {
      findPackageJsons(filePath, fileList);
    } else if (file.name === 'package.json') {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Main function
function main() {
  const rootDir = path.join(__dirname, '..');
  const packageFiles = findPackageJsons(rootDir);
  
  console.log(`Found ${packageFiles.length} package.json files`);
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const file of packageFiles) {
    const success = fixPackageJson(file);
    if (success) {
      fixedCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\nSummary:');
  console.log(`✓ ${fixedCount} package.json files checked/validated`);
  if (errorCount > 0) {
    console.log(`✗ ${errorCount} package.json files had issues`);
    process.exit(1);
  } else {
    console.log('✓ All package.json files are valid');
  }
}

// Run the script
main();
