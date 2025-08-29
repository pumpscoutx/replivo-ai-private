// Using built-in fetch

async function testQuickTasks() {
  try {
    console.log('Testing quick task execution endpoints...');
    
    // Test opening a website
    console.log('\n1. Testing website opening...');
    const openResponse = await fetch('http://localhost:5000/api/tasks/open-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://gmail.com',
        userId: 'demo-user'
      })
    });

    const openResult = await openResponse.json();
    console.log('Open website response:', JSON.stringify(openResult, null, 2));
    
    // Test sending an email
    console.log('\n2. Testing email sending...');
    const emailResponse = await fetch('http://localhost:5000/api/tasks/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: 'test@example.com',
        subject: 'Test Email from Agent System',
        body: 'This is a test email sent by the enhanced agent system.',
        userId: 'demo-user'
      })
    });

    const emailResult = await emailResponse.json();
    console.log('Send email response:', JSON.stringify(emailResult, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testQuickTasks(); 