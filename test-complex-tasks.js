// Using built-in fetch

async function testComplexTasks() {
  console.log('Testing complex natural language task execution...\n');

  const baseUrl = 'http://localhost:5000';
  const userId = 'demo-user';

  const testCases = [
    {
      name: 'Simple Email Task',
      task: 'Send email to john@example.com about meeting tomorrow',
      expected: 'Should break down into multiple steps: open Gmail, compose, fill details, send'
    },
    {
      name: 'Website Navigation',
      task: 'Open LinkedIn and search for software developers',
      expected: 'Should open LinkedIn and perform search'
    },
    {
      name: 'Form Filling',
      task: 'Fill out the contact form on example.com with my name John Doe and email john@example.com',
      expected: 'Should open website and fill form fields'
    },
    {
      name: 'Data Extraction',
      task: 'Go to weather.com and get today\'s temperature',
      expected: 'Should open website and extract temperature data'
    },
    {
      name: 'Multi-step Task',
      task: 'Open Gmail, compose a new email to support@company.com with subject "Bug Report" and body "I found a bug in the system"',
      expected: 'Should perform multiple steps: open Gmail, compose, fill all fields, send'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`Task: "${testCase.task}"`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/tasks/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: testCase.task,
          userId: userId,
          context: 'Testing complex task execution'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ SUCCESS');
        console.log(`Task Plan: ${result.taskPlan.description}`);
        console.log(`Steps: ${result.taskPlan.steps.length}`);
        result.taskPlan.steps.forEach((step, index) => {
          console.log(`  ${index + 1}. ${step.action}: ${step.target}`);
        });
      } else {
        console.log('❌ FAILED');
        console.log(`Error: ${result.error}`);
        console.log(`Details: ${result.details}`);
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.log(`Error: ${error.message}`);
    }
    
    console.log('─'.repeat(80));
  }

  // Test execution history
  console.log('\n📊 Testing execution history...');
  try {
    const response = await fetch(`${baseUrl}/api/tasks/history?userId=${userId}&limit=5`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found ${result.count} executions`);
      result.history.forEach((exec, index) => {
        console.log(`  ${index + 1}. ${exec.taskPlan.description} - ${exec.status}`);
      });
    } else {
      console.log('❌ Failed to get history');
    }
  } catch (error) {
    console.log(`❌ Error getting history: ${error.message}`);
  }
}

testComplexTasks().catch(console.error); 