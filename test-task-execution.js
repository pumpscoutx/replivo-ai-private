// Using built-in fetch

async function testTaskExecution() {
  try {
    console.log('Testing natural language task execution...');
    
    const response = await fetch('http://localhost:5000/api/tasks/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: 'Open Gmail',
        userId: 'demo-user',
        context: 'Testing task execution'
      })
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTaskExecution(); 