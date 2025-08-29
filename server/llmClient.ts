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
    'business-growth': process.env.OPENROUTER_API_KEY1,
    'operations': process.env.OPENROUTER_API_KEY2,
    'people-finance': process.env.OPENROUTER_API_KEY3
  };

  const key = keyMap[agentType];
  if (!key) {
    console.error(`No API key found for agent type: ${agentType}`);
    console.error(`Available env vars: ${Object.keys(process.env).filter(k => k.includes('OPENROUTER_API_KEY')).join(', ')}`);
    throw new Error(`No API key configured for agent type: ${agentType}`);
  }
  
  console.log(`Using API key for ${agentType}: ${key.substring(0, 8)}...`);
  return key;
}

// Main LLM call function using OpenRouter API
export async function callAgentLLM(
  agentType: AgentType,
  messages: LLMMessage[],
  model: string = 'meta-llama/llama-3.1-8b-instruct'
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
      max_tokens: 1000,
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
  
  const systemPrompt = `You are ${subAgent || 'Business Growth'} agent. Help with marketing and growth tasks.`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(conversationHistory || []),
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('business-growth', messages, 'meta-llama/llama-3.1-8b-instruct');
  return response.choices[0].message.content;
}

export async function callOperationsAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string,
  conversationHistory?: any[]
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'Operations'} agent. Help with operations and workflow tasks.`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('operations', messages, 'meta-llama/llama-3.1-8b-instruct');
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
⚡ AGGRESSIVE HR & FINANCE EXECUTION:
I have FULL ACCESS to your actual business accounts and will use them:
- Your real QuickBooks, PayPal, banking accounts
- Your LinkedIn Recruiter, ATS systems, HRIS platforms
- Your actual employee data, payroll systems
- Your private financial records and reports

🟢 I WILL EXECUTE IMMEDIATELY:
- Access your real employee databases and records
- Send emails to candidates through your accounts
- Update actual payroll and HR systems
- Generate real financial reports and statements
- Search and contact real candidates on LinkedIn
- Create actual job postings and offers

🔴 I ONLY ASK APPROVAL FOR:
- Actual money transfers and payments
- Firing or terminating employees
- Signing legal contracts or agreements
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
Me: "I'll process this month's payroll. I need to confirm:
- Which payroll system should I access? (QuickBooks, ADP, etc.)
- Are there any special adjustments this month? (bonuses, deductions, new hires)
- Should I review the calculations with you before processing payments?
This involves real financial transactions, so I'll show you the summary before executing."

User: "Send offer letter to John Smith"
Me: "Sending offer letter to John Smith now. I'm accessing your HR system to pull his application details, using your standard offer template with competitive salary based on the role level. Email sent from your company HR account with benefits package and start date. I've also updated your ATS system to mark him as 'Offer Sent'."

User: "Find candidates for marketing role"
Me: "I'll search for marketing candidates. Tell me:
- What specific marketing role? (digital marketing, content, growth, etc.)
- Experience level needed? (junior, mid-level, senior)
- Location requirements? (remote, specific city, hybrid)
- Key skills or qualifications?
I'll search real job boards and professional networks for actual candidates."

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

  const response = await callAgentLLM('people-finance', messages, 'meta-llama/llama-3.1-8b-instruct');
  return response.choices[0].message.content;
}