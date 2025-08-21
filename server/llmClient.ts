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
  model: string = 'deepseek/deepseek-chat'
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
      messages
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
  const systemPrompt = `You are ${subAgent || 'Business Growth'} agent. Help with marketing, sales, and growth tasks. Respond in plain English with actionable advice.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await callAgentLLM('business-growth', messages, 'deepseek/deepseek-chat');
  return response.choices[0].message.content;
}

export async function callOperationsAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'Operations'} agent. Help with workflow automation, data analysis, and operational efficiency. Respond with clear, practical solutions.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await callAgentLLM('operations', messages, 'deepseek/deepseek-chat');
  return response.choices[0].message.content;
}

export async function callPeopleFinanceAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string
): Promise<string> {
  const systemPrompt = `You are ${subAgent || 'People & Finance'} agent. Help with HR, recruiting, payroll, and financial management. Provide helpful guidance and solutions.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await callAgentLLM('people-finance', messages, 'deepseek/deepseek-chat');
  return response.choices[0].message.content;
}