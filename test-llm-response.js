// Test script to see what the LLM returns for task planning

async function testLLMResponse() {
  try {
    console.log('Testing LLM response for task planning...');
    
    const response = await fetch('http://localhost:5000/api/agents/hire', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentType: 'business-growth',
        subAgent: 'Business Growth',
        task: 'Create a JSON task plan for opening Gmail',
        context: 'Testing LLM response format',
        userId: 'test-user'
      })
    });

    const result = await response.json();
    console.log('LLM Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLLMResponse(); 