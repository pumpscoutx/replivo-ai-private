// Test real task execution

async function testRealExecution() {
  console.log('Testing real task execution...\n');

  const baseUrl = 'http://localhost:5000';
  const userId = 'demo-user';

  // Test 1: Simple task execution
  console.log('🧪 Test 1: Simple task execution');
  try {
    const response = await fetch(`${baseUrl}/api/tasks/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: 'Open Gmail',
        userId: userId,
        context: 'Testing real execution'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Task executed successfully');
      console.log(`Task Plan: ${result.taskPlan.description}`);
      console.log(`Steps: ${result.taskPlan.steps.length}`);
      
      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check execution history
      console.log('\n📊 Checking execution history...');
      const historyResponse = await fetch(`${baseUrl}/api/tasks/history?userId=${userId}&limit=5`);
      const historyResult = await historyResponse.json();
      
      if (historyResult.success) {
        console.log(`✅ Found ${historyResult.count} executions`);
        historyResult.history.forEach((exec, index) => {
          console.log(`  ${index + 1}. ${exec.taskPlan.description} - ${exec.status}`);
          if (exec.results && Object.keys(exec.results).length > 0) {
            console.log(`     Results: ${Object.keys(exec.results).length} steps completed`);
            Object.entries(exec.results).forEach(([stepId, result]) => {
              console.log(`       ${stepId}: ${result.method || 'unknown'} - ${result.success ? '✅' : '❌'}`);
            });
          }
        });
      } else {
        console.log('❌ Failed to get history');
      }
    } else {
      console.log('❌ Task execution failed');
      console.log(`Error: ${result.error}`);
      console.log(`Details: ${result.details}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 2: Quick task endpoint
  console.log('\n🧪 Test 2: Quick task endpoint');
  try {
    const response = await fetch(`${baseUrl}/api/tasks/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: 'test@example.com',
        subject: 'Test from Real Execution',
        body: 'This is a test email from the real execution test.',
        userId: userId
      })
    });

    const result = await response.json();
    console.log(`Email task: ${result.success ? '✅ Success' : '❌ Failed'}`);
    
    if (result.success) {
      console.log(`Message: ${result.message}`);
    } else {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Email test error: ${error.message}`);
  }

  // Test 3: Check final history
  console.log('\n📊 Final execution history check...');
  try {
    const response = await fetch(`${baseUrl}/api/tasks/history?userId=${userId}&limit=10`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Total executions: ${result.count}`);
      if (result.count > 0) {
        result.history.forEach((exec, index) => {
          console.log(`  ${index + 1}. ${exec.taskPlan.description} - ${exec.status}`);
          if (exec.error) {
            console.log(`     Error: ${exec.error}`);
          }
          if (exec.results && Object.keys(exec.results).length > 0) {
            console.log(`     Steps completed: ${Object.keys(exec.results).length}`);
          }
        });
      } else {
        console.log('⚠️ No executions found in history');
      }
    } else {
      console.log('❌ Failed to get final history');
    }
  } catch (error) {
    console.log(`❌ Final history error: ${error.message}`);
  }
}

testRealExecution().catch(console.error); 