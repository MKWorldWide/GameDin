import { ESLint } from 'eslint';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';

interface FixResult {
  filePath: string;
  fixCount: number;
  remainingErrorCount: number;
}

async function fixTypeScriptErrors(): Promise<void> {
  const eslint = new ESLint({
    fix: true,
    extensions: ['.ts', '.tsx'],
    useEslintrc: true
  });

  console.log('Starting ESLint auto-fix process...');
  
  try {
    // Run ESLint with auto-fix
    const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);
    
    // Apply fixes
    await ESLint.outputFixes(results);
    
    // Generate fix report
    const fixResults: FixResult[] = results.map(result => ({
      filePath: result.filePath,
      fixCount: result.fixableErrorCount + result.fixableWarningCount,
      remainingErrorCount: result.errorCount + result.warningCount - (result.fixableErrorCount + result.fixableWarningCount)
    }));

    // Generate summary
    const summary = {
      totalFiles: results.length,
      totalFixableErrors: results.reduce((sum, result) => sum + result.fixableErrorCount, 0),
      totalFixableWarnings: results.reduce((sum, result) => sum + result.fixableWarningCount, 0),
      totalRemainingErrors: results.reduce((sum, result) => sum + (result.errorCount - result.fixableErrorCount), 0),
      totalRemainingWarnings: results.reduce((sum, result) => sum + (result.warningCount - result.fixableWarningCount), 0),
      filesWithRemainingErrors: fixResults.filter(r => r.remainingErrorCount > 0)
    };

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      details: fixResults
    };

    await writeFile(
      resolve(process.cwd(), 'eslint-fix-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Log results
    console.log('\nESLint Fix Summary:');
    console.log(`Total files processed: ${summary.totalFiles}`);
    console.log(`Fixed errors: ${summary.totalFixableErrors}`);
    console.log(`Fixed warnings: ${summary.totalFixableWarnings}`);
    console.log(`Remaining errors: ${summary.totalRemainingErrors}`);
    console.log(`Remaining warnings: ${summary.totalRemainingWarnings}`);
    
    if (summary.filesWithRemainingErrors.length > 0) {
      console.log('\nFiles with remaining errors:');
      summary.filesWithRemainingErrors.forEach(result => {
        console.log(`- ${result.filePath}: ${result.remainingErrorCount} error(s)`);
      });
    }

    // Exit with error if there are remaining errors
    if (summary.totalRemainingErrors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during ESLint fix:', error);
    process.exit(1);
  }
}

// Run the fix process
fixTypeScriptErrors().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 