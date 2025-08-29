// Test execution status and history

async function testExecutionStatus() {
  console.log('Testing task execution status...\n');

  const baseUrl = 'http://localhost:5000';
  const userId = 'demo-user';

  // Test a simple task
  console.log('🧪 Testing simple task execution...');
  try {
    const response = await fetch(`${baseUrl}/api/tasks/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: 'Open Gmail',
        userId: userId,
        context: 'Testing execution status'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Task executed successfully');
      console.log(`Task Plan: ${result.taskPlan.description}`);
      console.log(`Steps: ${result.taskPlan.steps.length}`);
      
      // Wait a moment for execution to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

  // Test quick task endpoints
  console.log('\n🧪 Testing quick task endpoints...');
  
  try {
    const emailResponse = await fetch(`${baseUrl}/api/tasks/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email from the enhanced task executor.',
        userId: userId
      })
    });

    const emailResult = await emailResponse.json();
    console.log(`Email task: ${emailResult.success ? '✅ Success' : '❌ Failed'}`);
    
    if (emailResult.success) {
      console.log(`Message: ${emailResult.message}`);
    }
  } catch (error) {
    console.log(`❌ Email test error: ${error.message}`);
  }

  try {
    const websiteResponse = await fetch(`${baseUrl}/api/tasks/open-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://google.com',
        userId: userId
      })
    });

    const websiteResult = await websiteResponse.json();
    console.log(`Website task: ${websiteResult.success ? '✅ Success' : '❌ Failed'}`);
    
    if (websiteResult.success) {
      console.log(`Message: ${websiteResult.message}`);
    }
  } catch (error) {
    console.log(`❌ Website test error: ${error.message}`);
  }

  // Final history check
  console.log('\n📊 Final execution history check...');
  try {
    const finalHistoryResponse = await fetch(`${baseUrl}/api/tasks/history?userId=${userId}&limit=10`);
    const finalHistoryResult = await finalHistoryResponse.json();
    
    if (finalHistoryResult.success) {
      console.log(`✅ Total executions: ${finalHistoryResult.count}`);
      finalHistoryResult.history.forEach((exec, index) => {
        console.log(`  ${index + 1}. ${exec.taskPlan.description} - ${exec.status}`);
        if (exec.error) {
          console.log(`     Error: ${exec.error}`);
        }
      });
    } else {
      console.log('❌ Failed to get final history');
    }
  } catch (error) {
    console.log(`❌ Final history error: ${error.message}`);
  }
}

testExecutionStatus().catch(console.error); 