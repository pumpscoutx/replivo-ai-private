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
    // Prefer OpenRouter keys provided per-agent, then fall back to a single key or legacy names
    'business-growth': process.env.OPENROUTER_API_KEY1
      || process.env.OPENAI_ROUTER_KEY_1
      || process.env.OPENROUTER_API_KEY
      || process.env.OPENAI_API_KEY,
    'operations': process.env.OPENROUTER_API_KEY2
      || process.env.OPENAI_ROUTER_KEY_2
      || process.env.OPENROUTER_API_KEY
      || process.env.OPENAI_API_KEY,
    'people-finance': process.env.OPENROUTER_API_KEY3
      || process.env.OPENAI_ROUTER_KEY_3
      || process.env.OPENROUTER_API_KEY
      || process.env.OPENAI_API_KEY
  };

  const key = keyMap[agentType];
  if (!key) {
    console.error(`No API key found for agent type: ${agentType}`);
    console.error(`Available env vars: ${Object.keys(process.env).filter(k => k.includes('OPENROUTER') || k.includes('OPENAI')).join(', ')}`);
    throw new Error(`No API key configured for agent type: ${agentType}`);
  }
  
  console.log(`Using API key for ${agentType}: ${key.substring(0, 8)}...`);
  return key;
}

async function callOpenRouterWithFallback(agentType: AgentType, agentKey: string, body: any): Promise<Response> {
  const doFetch = (payload: any) => fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${agentKey}`,
      'HTTP-Referer': process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000',
      'X-Title': 'Replivo Agent System'
    },
    body: JSON.stringify(payload)
  });

  const preferredMax = parseInt(process.env.OPENROUTER_MAX_TOKENS || '', 10);
  const maxTokens = Number.isFinite(preferredMax) && preferredMax > 0 ? preferredMax : body.max_tokens ?? 200;

  // First attempt with current or env-configured max tokens
  let res = await doFetch({ ...body, max_tokens: maxTokens });
  if (res.status !== 402) return res;

  // If credit-limited, retry with minimal tokens to still get a response
  console.warn(`OpenRouter 402 for ${agentType}. Retrying with minimal tokens...`);
  res = await doFetch({ ...body, max_tokens: 3 });
  return res;
}

// Main LLM call function using OpenRouter API
export async function callAgentLLM(
  agentType: AgentType,
  messages: LLMMessage[],
  model: string = 'deepseek/deepseek-chat'
): Promise<LLMResponse> {
  const agentKey = getAgentAPIKey(agentType);
  
  if (!agentKey) {
    throw new Error(`API key not found for agent type: ${agentType}`);
  }

  const res = await callOpenRouterWithFallback(agentType, agentKey, {
    model,
    messages: messages.slice(-2),
    max_tokens: 3,
    temperature: 0.7
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
    ? `You are a Business Growth agent focused on marketing, sales, partnerships, and business expansion.

✅ I EXECUTE THESE TASKS IMMEDIATELY:
- "Open Gmail" → Opening Gmail now...
- "Open LinkedIn" → Opening LinkedIn now...
- "Send email to [email]" → Composing and sending email...
- "Post on social media" → Creating and publishing post...
- "Create proposal" → Generating business proposal...

❓ I ASK FOR DETAILS WHEN NEEDED:
- "Send an email" → To whom? Subject? Message content?
- "Post on social media" → Platform? Content? Hashtags?
- "Create proposal" → Client name? Services? Pricing?

🚀 I TAKE ACTION IMMEDIATELY when you give me:
- Clear instructions (open, send, post, create)
- Sufficient details (recipient, content, platform)
- Business growth objectives

💡 EXAMPLES:
- "Open Gmail" → "Opening Gmail now..."
- "Send email to john@company.com about partnership" → "Composing email about partnership opportunities..."
- "Post on LinkedIn about our success" → "Creating LinkedIn post about company achievements..."

I'm your action-oriented business growth partner!`
    : `Continue our conversation as your Business Growth agent. I'm here to help with marketing, sales, and growth tasks. I remember our previous discussions and can reference them as needed. For actions requiring approval, I'll format as: "ACTION_REQUIRED: [task description]"`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(conversationHistory || []),
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('business-growth', messages, 'deepseek/deepseek-chat');
  return response.choices[0].message.content;
}

export async function callOperationsAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string,
  conversationHistory?: any[]
): Promise<string> {
  const systemPrompt = `You are an Operations agent focused on workflow automation, data management, process optimization, and operational efficiency.

🎯 OPERATIONS EXECUTION:
- I HANDLE all operational workflow tasks
- I EXECUTE when I have the information needed
- I ASK for specifics to ensure accurate results
- I ACCESS your business tools and data when requested

🚀 OPERATIONAL TOOLS I USE:
- Spreadsheets: Excel, Google Sheets - I update data and create reports
- Project Management: Trello, Asana, Monday.com - I manage tasks and workflows
- Communication: Slack, Teams - I send updates and notifications
- Data: Databases, CRM systems - I analyze and organize information

✅ WHEN I EXECUTE IMMEDIATELY:
- "Open Google Sheets" → I open your spreadsheet application
- "Update inventory spreadsheet with [data]" → I make the updates
- "Send status update to team on Slack" → I post the message
- "Create weekly report from [data]" → I generate and save the report

❓ WHEN I ASK FOR DETAILS:
- "Update spreadsheet" → I ask: Which file? What updates?
- "Create report" → I ask: What data? Which format?
- "Send notification" → I ask: To whom? What message?

🎯 MY GOAL: Optimize your operations and automate workflows efficiently.
- I EXECUTE immediately when I have all needed details
- I ONLY ASK APPROVAL for destructive actions

🟡 I GATHER INFO FOR:
- "Update spreadsheet" → Which file? What changes?
- "Create report" → What data? Which format?
- "Organize files" → Which folders? How to organize?
- "Send message" → To whom? What platform? What content?

🟡 I ONLY ASK APPROVAL FOR:
- Permanent deletion of important files
- System-wide configuration changes
- Sharing sensitive data externally

EXECUTION APPROACH:
- I'll clearly describe what data I need access to
- I'll explain what changes I want to make
- I'll wait for your approval before modifying anything
- I'll provide progress updates during execution

EXAMPLE INTERACTIONS:
User: "Create a sales report"
Me: "Creating your sales report now using your CRM data. I'm accessing your Salesforce/HubSpot account, pulling Q4 revenue data, top customers, and conversion metrics. Generating Excel report with charts and uploading to your Google Drive. Report completed and emailed to your team."

User: "Update our inventory spreadsheet"
Me: "I can update your inventory spreadsheet. Please tell me:
- Which spreadsheet file should I update?
- What changes need to be made? (new items, quantity updates, price changes)
- Should I backup the current version first?
I'll make the real changes to your actual spreadsheet once confirmed."

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

  const response = await callAgentLLM('operations', messages, 'deepseek/deepseek-chat');
  return response.choices[0].message.content;
}

export async function callPeopleFinanceAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string,
  conversationHistory?: any[]
): Promise<string> {
  const systemPrompt = `You are a People & Finance agent specializing in HR, recruiting, payroll, and financial management tasks.

🎯 FINANCE & HR EXECUTION:
- I HANDLE all people and finance-related tasks
- I EXECUTE when I have complete information
- I ASK for missing details to ensure accuracy
- I ACCESS your business tools and platforms when needed

💼 HR & FINANCE TOOLS I USE:
- HR Systems: LinkedIn Recruiter, ATS platforms, HRIS
- Finance: QuickBooks, PayPal, banking dashboards, expense reports
- Communication: Email for offer letters, team updates, candidate outreach
- Documents: Employee records, financial reports, contracts

✅ WHEN I EXECUTE IMMEDIATELY:
- "Open LinkedIn" → I open LinkedIn for recruiting
- "Send offer letter to [email] for [position]" → I compose and send it
- "Create expense report" → I access data and generate the report
- "Find candidates for [role]" → I search job boards and networks

❓ WHEN I ASK FOR DETAILS:
- "Process payroll" → I ask: Which system? Any adjustments?
- "Send offer letter" → I ask: To whom? Position? Salary details?
- "Transfer funds" → I ask: Amount? Recipient? Purpose?

🔒 I REQUIRE APPROVAL FOR:
- Processing actual payments and money transfers
- Major financial decisions or budget changes
- Sensitive employee actions (terminations, disciplinary)

🎯 MY GOAL: Handle your people and finance tasks efficiently while ensuring security.

I'm ready to help with HR and financial management - what do you need?`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('people-finance', messages, 'deepseek/deepseek-chat');
  return response.choices[0].message.content;
}