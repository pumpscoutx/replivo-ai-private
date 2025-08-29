// Using built-in fetch

async function testAgentHire() {
  try {
    console.log('Testing agent hire functionality...');
    
    const response = await fetch('http://localhost:5000/api/agents/hire', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentType: 'business-growth',
        subAgent: 'Business Growth',
        task: 'Test task to verify agent functionality',
        context: 'Testing if the agent system is working correctly',
        userId: 'demo-user'
      })
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAgentHire(); 