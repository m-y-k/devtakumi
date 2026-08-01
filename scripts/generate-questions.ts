/**
 * AI-powered question generation script.
 * 
 * Usage: 
 *   npx tsx scripts/generate-questions.ts
 * 
 * This script reads the seeded classes from the database (via the API or direct DB)
 * and generates practice questions for each class using an LLM API.
 * 
 * For v1, run this manually to seed the initial question bank.
 * The prompt template from Section 10 of the technical spec is used.
 * 
 * See technical-spec.md Section 10 for the full prompt template.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8080';

async function generateQuestionsForClass(classNumber: number, classTitle: string) {
  const prompt = `
You are generating practice coding questions for a Java-based coding bootcamp class.
Only use concepts that have been taught up to and including the class described below.

Class number: ${classNumber}
Class title: ${classTitle}
Target language: Java

Generate 5 to 8 practice questions that reinforce ONLY the concept(s) named in the class title above.
Order them from easiest to hardest.

Return ONLY a JSON array matching this schema:
[{
  "title": "string",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "statement_markdown": "string",
  "constraints": ["string"],
  "examples": [{"input": "string", "output": "string", "explanation": "string"}],
  "starter_code_java": "string",
  "test_cases": [{"input": "string", "expected_output": "string", "hidden": true|false}],
  "tags": ["string"]
}]

At least 2 examples per question. At least 6 test cases per question, at least 3 hidden.
`;

  // In a real implementation, call your LLM provider here (OpenAI, Anthropic, etc.)
  console.log(`Generating questions for class ${classNumber}: ${classTitle}`);
  
  // Placeholder: log the prompt and return empty array
  // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
  // const questions = JSON.parse(response.choices[0].message.content);
  // for (const q of questions) {
  //   await fetch(`${API_BASE}/api/admin/classes/${classId}/questions`, {
  //     method: 'POST',
  //     headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  //     body: JSON.stringify(q)
  //   });
  // }
  
  return [];
}

async function main() {
  console.log('Question generation script');
  console.log(`API base: ${API_BASE}`);
  console.log('To use: set your LLM API key and uncomment the implementation above.');
  console.log('See technical-spec.md Section 10 for the complete prompt template.');
}

main().catch(console.error);
