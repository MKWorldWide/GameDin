/**
 * Codex AI Integration
 * 
 * This module provides intelligent code analysis using Codex AI models
 * (Mistral and DeepSeek) for GitHub automation and code review.
 * 
 * Features:
 * - Code change analysis and intent detection
 * - Security vulnerability scanning
 * - Code quality assessment
 * - Automated suggestions and improvements
 * - Context-aware responses
 * 
 * Supported Models:
 * - Mistral AI (mistral-large-latest)
 * - DeepSeek AI (deepseek-coder)
 */

interface CodexConfig {
  mistralApiKey?: string;
  deepseekApiKey?: string;
  preferredModel: 'mistral' | 'deepseek';
  maxTokens: number;
  temperature: number;
}

interface CodexResponse {
  analysis: string;
  confidence: number;
  model: string;
  timestamp: string;
}

/**
 * Default configuration for Codex AI
 */
const defaultConfig: CodexConfig = {
  mistralApiKey: process.env.MISTRAL_API_KEY,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  preferredModel: 'mistral',
  maxTokens: 2000,
  temperature: 0.3,
};

/**
 * Analyze code changes using Codex AI
 * 
 * @param context - Repository and branch context
 * @param diff - Code changes or commit messages
 * @returns AI analysis of the code changes
 */
export async function analyzeCodeChange(
  context: string, 
  diff: string
): Promise<string> {
  try {
    console.log('🤖 Analyzing code changes with Codex AI...'); 
    const prompt = generateCodeAnalysisPrompt(context, diff);
    const response = await callCodexAPI(prompt);
    
    console.log('✅ Code analysis complete');
    return response.analysis;
    
  } catch (error) {
    console.error(❌ Error analyzing code changes:', error);
    return 'Unable to analyze code changes at this time.';
  }
}

/**
 * Analyze code for security vulnerabilities
 * 
 * @param files - List of changed files
 * @param diff - Code diff or content
 * @returns Security analysis results
 */
export async function analyzeSecurityVulnerabilities(
  files: string[], 
  diff: string
): Promise<string> {
  try {
    console.log('🔒 Analyzing security vulnerabilities...'); 
    const prompt = generateSecurityAnalysisPrompt(files, diff);
    const response = await callCodexAPI(prompt);
    
    console.log('✅ Security analysis complete');
    return response.analysis;
    
  } catch (error) {
    console.error(❌ Erroranalyzing security:', error);
    return 'Unable to perform security analysis at this time.';
  }
}

/**
 * Generate code analysis prompt
 */
function generateCodeAnalysisPrompt(context: string, diff: string): string {
  return `You are an expert code reviewer and developer. Analyze the following code changes and provide insights:

Context:
${context}

Code Changes:
${diff}

Please provide:
1. Summary of what the code changes accomplish
2. Potential improvements or optimizations
3. Code quality assessment
4. Risks or suggestions

Be concise, helpful, and constructive in your analysis.`;
}

/**
 * Generate security analysis prompt
 */
function generateSecurityAnalysisPrompt(files: string[], diff: string): string {
  return `You are a security expert. Analyze the following code for potential security vulnerabilities:

Files Changed:
${files.join('\n')}

Code Changes:
${diff}

Please identify:
1. Potential security vulnerabilities (SQL injection, XSS, etc.)
2. Authentication/authorization issues
3. Data exposure risks
4. Input validation concerns
5. Recommendations for security improvements

Focus on security-critical issues and provide specific recommendations.`;
}

/**
 * Call Codex API (Mistral or DeepSeek)
 */
async function callCodexAPI(prompt: string): Promise<CodexResponse> { 
  const config = { ...defaultConfig };
  
  // Try preferred model first, fallback to other if needed
  if (config.preferredModel === 'mistral' && config.mistralApiKey) {
    try {
      return await callMistralAPI(prompt, config);
    } catch (error) {
      console.warn('Mistral API failed, trying DeepSeek...');
    }
  }
  
  if (config.deepseekApiKey) {
    try {
      return await callDeepSeekAPI(prompt, config);
    } catch (error) {
      console.warn('DeepSeek API failed, trying Mistral...');
    }
  }
  
  // Fallback to Mistral if DeepSeek was preferred
  if (config.preferredModel === 'deepseek' && config.mistralApiKey) {
    try {
      return await callMistralAPI(prompt, config);
    } catch (error) {
      console.error('Both APIs failed'); 
    }
  }
  
  throw new Error('No available Codex API');
}

/**
 * Call Mistral AI API
 */
async function callMistralAPI(prompt: string, config: CodexConfig): Promise<CodexResponse> { 
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',  headers: {
     'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.mistralApiKey}`,
    },
    body: JSON.stringify({
      'model': 'mistral-large-latest',      'messages': [
       {
          'role': 'system',
          'content': 'You are an expert code reviewer and security analyst. Provide clear, actionable insights.'
        },
       {
          'role': 'user',
          'content': prompt
        }
      ],
      'max_tokens': config.maxTokens,
      'temperature': config.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  const analysis = data.choices[0]?.message?.content || 'No analysis available';

  return {
    analysis,
    confidence: 0.8,
    model: 'mistral-large-latest',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Call DeepSeek AI API
 */
async function callDeepSeekAPI(prompt: string, config: CodexConfig): Promise<CodexResponse> { 
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',  headers: {
     'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.deepseekApiKey}`,
    },
    body: JSON.stringify({
      'model': 'deepseek-coder',      'messages': [
       {
          'role': 'system',
          'content': 'You are an expert code reviewer and security analyst. Provide clear, actionable insights.'
        },
       {
          'role': 'user',
          'content': prompt
        }
      ],
      'max_tokens': config.maxTokens,
      'temperature': config.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  const analysis = data.choices[0]?.message?.content || 'No analysis available';

  return {
    analysis,
    confidence: 0.8,
    model: 'deepseek-coder',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Analyze PR description and suggest improvements
 */
export async function analyzePullRequest(
  title: string, 
  description: string, 
  diff: string
): Promise<string> { 
  const prompt = `Analyze this pull request and provide feedback:

Title: ${title}
Description: ${description}
Diff: ${diff}

Please provide:
1. Overall assessment of the changes
2. Code quality feedback
3. Potential improvements
4. Security considerations
5. Testing recommendations

Be constructive and helpful.`;

  try {
    const response = await callCodexAPI(prompt);
    return response.analysis;
  } catch (error) {
    console.error('Error analyzing PR:', error);
    return 'Unable to analyze pull request at this time.';
  }
}

/**
 * Generate automated response for issues
 */
export async function generateIssueResponse(issueTitle: string, issueBody: string): Promise<string> { 
  const prompt = `Generate a helpful response for this GitHub issue:

Title: ${issueTitle}
Body: ${issueBody}

Please provide:1 Acknowledgment of the issue
2. Initial assessment
3. Next steps or suggestions
4. Offer to help further

Be friendly, professional, and helpful.`;

  try {
    const response = await callCodexAPI(prompt);
    return response.analysis;
  } catch (error) {
    console.error('Error generating issue response:', error);
    return 'Thank you for your issue. I\'ll help investigate this.';
  }
}

/**
 * Check if Codex AI is available
 */
export function isCodexAvailable(): boolean {
  return !!(process.env.MISTRAL_API_KEY || process.env.DEEPSEEK_API_KEY);
}

/**
 * Get Codex configuration
 */
export function getCodexConfig(): CodexConfig {
  return { ...defaultConfig };
} 