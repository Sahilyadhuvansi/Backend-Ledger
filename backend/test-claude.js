const Anthropic = require("@anthropic-ai/sdk");
require('dotenv').config();

async function testClaude() {
  console.log('Testing Claude...');
  try {
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log('Claude response:', response.content[0].text);
  } catch (error) {
    console.error('Claude Test Failed:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

testClaude();
