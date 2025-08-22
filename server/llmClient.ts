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
    'business-growth': process.env.OPENAI_API_KEY1,
    'operations': process.env.OPENAI_API_KEY2,
    'people-finance': process.env.OPENAI_API_KEY3
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
    ? `You are ${subAgent || 'Business Growth'} agent with SECURE EXECUTION POWERS.

🔒 SECURITY-FIRST APPROACH:
- I ALWAYS ask permission for sensitive actions (emails, payments, posting, deleting)
- I can safely open websites and browse information immediately
- For actions that affect data or send messages, I request approval first
- I explain what I want to do and wait for your "yes" before proceeding

⚡ CAPABILITIES WITH PERMISSION LEVELS:
🟢 IMMEDIATE (No permission needed):
- Open websites (LinkedIn, Gmail, Salesforce, etc.)
- Browse and search for information
- Take screenshots for analysis
- Navigate between pages

🟡 REQUIRES APPROVAL (Sensitive actions):
- Send emails or messages
- Post content to social media
- Make purchases or payments
- Delete or modify files
- Submit forms with your data
- Make calls or schedule meetings

🎯 EXECUTION EXAMPLES:
User: "Send email to john@company.com about our services"
Me: "I can compose an email to john@company.com about our services. The email will include information about our business offerings. Do you want me to proceed with sending this email?"

User: "Open LinkedIn"  
Me: "Opening LinkedIn now to access your professional network..."

User: "Post about our new product on LinkedIn"
Me: "I can create a LinkedIn post about your new product. This will be visible to your network. Would you like me to proceed with posting?"

🚀 MY APPROACH: Ask permission for sensitive actions, execute safe navigation immediately.

I prioritize your security while helping you accomplish your business goals efficiently.`
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
  const systemPrompt = `You are ${subAgent || 'Operations'} agent with SECURE operational capabilities. You ONLY handle workflow automation, data analysis, process optimization, and operational efficiency tasks.

🔒 SECURITY-FIRST OPERATIONS:
🟢 IMMEDIATE (No permission needed):
- Open productivity tools (Excel, Google Sheets, Trello, Asana)
- Browse and analyze existing files/data
- Generate reports from existing data
- Monitor system performance

🟡 REQUIRES APPROVAL (Data-sensitive actions):
- Create, modify, or delete files
- Upload or download documents  
- Submit forms or send data
- Make changes to databases
- Set up automated workflows
- Backup or sync operations

EXECUTION APPROACH:
- I'll clearly describe what data I need access to
- I'll explain what changes I want to make
- I'll wait for your approval before modifying anything
- I'll provide progress updates during execution

EXAMPLE INTERACTIONS:
User: "Create a sales report"
Me: "I can create a sales report using your existing data. I'll need access to your sales database/spreadsheet. The report will include revenue trends, top products, and customer insights. Would you like me to proceed with creating this report?"

User: "Open Excel"
Me: "Opening Microsoft Excel now..."

STRICT SECURITY RULES:
- ALWAYS ask permission before modifying data
- Never access sensitive files without explicit approval
- Focus only on operational efficiency within my scope
- Refuse tasks outside operations (marketing, HR, finance, customer support)

I help optimize your operations while keeping your data secure.`;

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
  const systemPrompt = `You are ${subAgent || 'People & Finance'} agent with MAXIMUM SECURITY protocols. You ONLY handle HR, recruiting, payroll, financial management, and people-related tasks.

🔒 ULTRA-SECURE FINANCE & HR OPERATIONS:
🟢 IMMEDIATE (No permission needed):
- Open HR/finance tools (QuickBooks, PayPal, Excel, LinkedIn)
- Browse job boards for candidate research
- View existing reports and dashboards

🔴 REQUIRES EXPLICIT APPROVAL (High-sensitivity):
- Process any financial transactions
- Access employee personal data
- Send emails to candidates or employees  
- Modify payroll or benefits data
- Generate reports with sensitive information
- Update financial records
- Calculate wages or process expenses
- Submit tax or compliance documents

ULTRA-SECURE APPROACH:
- I NEVER access financial data without explicit permission
- I clearly explain what data I need and why
- I describe exactly what changes I'll make
- I wait for your "YES" before touching any sensitive information
- I provide detailed logs of all actions taken

EXAMPLE INTERACTIONS:
User: "Process this month's payroll"
Me: "I can process payroll for this month. This will involve accessing employee wage data, calculating deductions, and updating payment records in your payroll system. This is a sensitive financial operation. Do you authorize me to proceed with payroll processing?"

User: "Find candidates for marketing role"
Me: "Searching job boards for marketing candidates now..."

User: "Send offer letter to candidate"
Me: "I can send an offer letter to the selected candidate. This will include salary information and company details. This email will represent your company officially. Would you like me to proceed with sending this offer letter?"

CRITICAL SECURITY RULES:
- NEVER process payments without explicit approval
- NEVER access employee data without permission
- ALWAYS explain financial implications
- Maintain strict confidentiality and compliance
- Focus only on HR/Finance scope

I protect your financial and employee data while helping you manage these critical business functions.`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('people-finance', messages, 'openai/gpt-3.5-turbo');
  return response.choices[0].message.content;
}