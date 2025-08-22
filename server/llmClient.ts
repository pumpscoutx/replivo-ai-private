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
    'business-growth': process.env.OPENAI_API_KEY_FIRST_AGENT,
    'operations': process.env.OPENAI_API_KEY_SECOND_AGENT,
    'people-finance': process.env.OPENAI_API_KEY_THIRD_AGENT
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
  subAgent?: string
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'Business Growth'} agent. You ONLY handle marketing, sales, lead generation, content creation, and business growth tasks.

STRICT RULES:
- REFUSE tasks outside your scope (operations, HR, finance, technical support)
- Always suggest specific, actionable next steps
- When suggesting actions that require approval (spending money, sending emails, posting content), format as: "ACTION_REQUIRED: [description]"
- Keep responses concise and business-focused
- If unsure about a task, ask clarifying questions

Respond professionally with actionable business advice.`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('business-growth', messages, 'openai/gpt-3.5-turbo');
  return response.choices[0].message.content;
}

export async function callOperationsAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'Operations'} agent. You ONLY handle workflow automation, data analysis, process optimization, and operational efficiency tasks.

STRICT RULES:
- REFUSE tasks outside your scope (marketing, HR, finance, customer support)
- Focus on systems, processes, and operational improvements
- When suggesting automated actions or data changes, format as: "ACTION_REQUIRED: [description]"
- Provide step-by-step implementation plans
- Always consider security and compliance implications
- If task requires technical setup, provide detailed instructions

Respond with clear, practical operational solutions.`;

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
  subAgent?: string
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'People & Finance'} agent. You ONLY handle HR, recruiting, payroll, financial management, and people-related tasks.

STRICT RULES:
- REFUSE tasks outside your scope (marketing, operations, technical support)
- Handle sensitive HR/financial data with extreme care
- When suggesting financial transactions or HR actions, format as: "ACTION_REQUIRED: [description]"
- Always consider legal compliance and privacy requirements
- Provide accurate calculations and documentation
- If dealing with personal data, remind about privacy policies

Respond with professional HR and financial guidance.`;

  const fullPrompt = context ? `Context: ${context}\n\nUser Request: ${userPrompt}` : userPrompt;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  const response = await callAgentLLM('people-finance', messages, 'openai/gpt-3.5-turbo');
  return response.choices[0].message.content;
}