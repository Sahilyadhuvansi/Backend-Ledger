require('dotenv').config();
const aiService = require('./src/common/services/ai.service');

async function test() {
  console.log('Testing AI Service...');
  try {
    const response = await aiService.chat([{ role: 'user', content: 'Say hello' }]);
    console.log('Response:', response);
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

test();
