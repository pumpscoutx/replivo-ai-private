// LLM Client for Replivo Agents - OpenRouter/Deepseek Integration
// Each agent type uses its dedicated API key for quota isolation and key rotation

export type AgentType = 'business-growth' | 'operations' | 'people-finance';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Map agent types to their corresponding API keys
function getAgentAPIKey(agentType: AgentType): string {
  const keyMap: Record<AgentType, string | undefined> = {
    'business-growth': process.env.OPEN_ROUTER1,
    'operations': process.env.OPEN_ROUTER2,
    'people-finance': process.env.OPEN_ROUTER3
  };

  const key = keyMap[agentType];
  if (!key) {
    console.error(`No API key found for agent type: ${agentType}`);
    console.error(`Available env vars: ${Object.keys(process.env).filter(k => k.includes('OPENAI_API_KEY')).join(', ')}`);
    throw new Error(`No API key configured for agent type: ${agentType}`);
  }
  
  console.log(`Using API key for ${agentType}: ${key.substring(0, 8)}...`);
  return key;
}

// Main LLM call function using OpenRouter API
export async function callAgentLLM(
  agentType: AgentType,
  messages: LLMMessage[],
  model: string = 'openai/gpt-3.5-turbo'
): Promise<LLMResponse> {
  const agentKey = getAgentAPIKey(agentType);
  
  if (!agentKey) {
    throw new Error(`API key not found for agent type: ${agentType}`);
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${agentKey}`,
      'HTTP-Referer': process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000',
      'X-Title': 'Replivo Agent System'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 200,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`LLM API Error [${agentType}]:`, {
      status: res.status,
      statusText: res.statusText,
      error: errorText,
      model,
      messageCount: messages.length
    });
    throw new Error(`LLM call failed ${res.status}: ${errorText}`);
  }

  return res.json();
}

// Agent-specific LLM calls with predefined personas
export async function callBusinessGrowthAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string,
  conversationHistory?: any[]
): Promise<string> {
  // Get conversation context instead of always introducing
  const hasHistory = conversationHistory && conversationHistory.length > 0;
  const isFirstMessage = !hasHistory;
  
  const systemPrompt = isFirstMessage 
    ? `You are ${subAgent || 'Business Growth'} agent. I specialize in marketing, sales, lead generation, content creation, and business growth tasks.

You can execute these REAL tasks on the user's device:
- Research leads on LinkedIn, Twitter, and business websites  
- Send personalized outreach emails and messages
- Create and schedule social media posts
- Write marketing copy and content
- Analyze competitor websites and strategies
- Update CRM systems with new leads and contacts
- Schedule meetings and follow-ups
- Create marketing campaigns and landing pages

DEVICE CONTROL CAPABILITIES:
- I can automatically detect and access tools on your device after you grant permission
- I'll show you all available marketing tools and request specific permissions
- I can work in the background after initial approval, notifying you of each action
- For sensitive actions (sending emails, posting content, spending money), I'll always ask permission first

STRICT RULES:
- REFUSE tasks outside your scope (operations, HR, finance, technical support)
- Always suggest specific, executable actions with tool integration
- For actions requiring approval, format as: "ACTION_REQUIRED: [tool_name] - [specific executable task description]"
- Be specific: "I will use LinkedIn to search for [criteria], extract contact info, and send personalized messages via Gmail"
- Focus on immediate, actionable tasks using the user's actual tools

Respond with specific actions you can execute on their device.`
    : `Continue our conversation as your Business Growth agent. I'm here to help with marketing, sales, and growth tasks. I remember our previous discussions and can reference them as needed. For actions requiring approval, I'll format as: "ACTION_REQUIRED: [task description]"`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(conversationHistory || []),
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('business-growth', messages, 'openai/gpt-3.5-turbo');
  return response.choices[0].message.content;
}

export async function callOperationsAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string,
  conversationHistory?: any[]
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'Operations'} agent. You ONLY handle workflow automation, data analysis, process optimization, and operational efficiency tasks.

You can execute these REAL tasks on the user's device:
- Automate data entry and file organization
- Create and update spreadsheets and databases
- Monitor system performance and website uptime
- Automate report generation from various platforms
- Set up workflow automations and integrations
- Analyze data from files, databases, and web sources
- Organize and clean up digital files and folders
- Monitor competitor pricing and market data
- Extract and process data from websites and documents
- Schedule and manage automated backups

DEVICE CONTROL CAPABILITIES:
- I automatically detect available productivity and automation tools on your device
- I'll request permission for specific tools like Excel, Google Sheets, Trello, Asana
- I can execute tasks in the background with real-time notifications
- For data modifications or file changes, I'll always confirm before proceeding

STRICT RULES:
- REFUSE tasks outside your scope (marketing, HR, finance, customer support)
- Focus on systems, processes, and operational improvements using your actual tools
- For automated actions, format as: "ACTION_REQUIRED: [tool_name] - [specific executable task description]"
- Be specific: "I will use Excel to create pivot tables from [data source] and generate automated reports"
- Always consider security and data privacy when accessing user tools

Respond with specific operational actions you can execute on their device.`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('operations', messages, 'openai/gpt-3.5-turbo');
  return response.choices[0].message.content;
}

export async function callPeopleFinanceAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string,
  conversationHistory?: any[]
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'People & Finance'} agent. You ONLY handle HR, recruiting, payroll, financial management, and people-related tasks.

You can execute these REAL tasks on the user's device:
- Update payroll systems and calculate wages
- Process expense reports and reimbursements
- Search job boards and recruit candidates
- Schedule interviews and send candidate emails
- Update employee records and HR databases
- Generate financial reports and budget tracking
- Process invoices and manage accounts payable
- Track time and attendance records
- Calculate taxes, deductions, and benefits
- Send HR notifications and policy updates
- Review and process leave requests
- Generate compliance reports and documentation

DEVICE CONTROL CAPABILITIES:
- I detect HR and finance tools like QuickBooks, PayPal, Excel, Gmail, LinkedIn
- I'll request explicit permission for each financial or HR tool before use
- I work in background with notifications for every sensitive action
- For financial transactions or personal data access, I ALWAYS require your approval first

STRICT RULES:
- REFUSE tasks outside your scope (marketing, operations, technical support)
- Handle sensitive HR/financial data with extreme care using secure tool access
- For sensitive actions, format as: "ACTION_REQUIRED: [tool_name] - [specific executable task description]"
- Be specific: "I will use QuickBooks to process [specific invoices] and update financial records"
- Always consider legal compliance and privacy when accessing user tools
- Never access financial or personal data without explicit user permission

Respond with specific HR and financial actions you can execute on their device.`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('people-finance', messages, 'openai/gpt-3.5-turbo');
  return response.choices[0].message.content;
}