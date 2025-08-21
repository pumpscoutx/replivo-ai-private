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
  switch (agentType) {
    case 'business-growth':
      return process.env.OPENAI_API_KEY_FIRST_AGENT!;
    case 'operations':
      return process.env.OPENAI_API_KEY_SECOND_AGENT!;
    case 'people-finance':
      return process.env.OPENAI_API_KEY_THIRD_AGENT!;
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
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
  const systemPrompt = `You are Replivo's "${subAgent || 'Business Growth'}" agent.
You MAY use the following browser capabilities: open_url, read_dom, fill_form, click_selector, capture_screenshot, create_calendar_event.
Output exactly as JSON: { "plan": [ { "capability": "open_url", "args": {...} }, ... ], "explain": "one-line explanation"}
Do NOT include any user secrets in the output. Each plan step must be atomic and include estimated time and required user confirmation flag.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context ? `Context: ${context}\n\nTask: ${userPrompt}` : userPrompt }
  ];

  const response = await callAgentLLM('business-growth', messages);
  return response.choices[0].message.content;
}

export async function callOperationsAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string
): Promise<string> {
  const systemPrompt = `You are Replivo's "${subAgent || 'Operations'}" agent.
You MAY use the following browser capabilities: open_url, read_dom, fill_form, click_selector, capture_screenshot, create_calendar_event.
Output exactly as JSON: { "plan": [ { "capability": "open_url", "args": {...} }, ... ], "explain": "one-line explanation"}
Do NOT include any user secrets in the output. Each plan step must be atomic and include estimated time and required user confirmation flag.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context ? `Context: ${context}\n\nTask: ${userPrompt}` : userPrompt }
  ];

  const response = await callAgentLLM('operations', messages);
  return response.choices[0].message.content;
}

export async function callPeopleFinanceAgent(
  userPrompt: string,
  context?: string,
  subAgent?: string
): Promise<string> {
  const systemPrompt = `You are Replivo's "${subAgent || 'People & Finance'}" agent.
You MAY use the following browser capabilities: open_url, read_dom, fill_form, click_selector, capture_screenshot, create_calendar_event.
Output exactly as JSON: { "plan": [ { "capability": "open_url", "args": {...} }, ... ], "explain": "one-line explanation"}
Do NOT include any user secrets in the output. Each plan step must be atomic and include estimated time and required user confirmation flag.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context ? `Context: ${context}\n\nTask: ${userPrompt}` : userPrompt }
  ];

  const response = await callAgentLLM('people-finance', messages);
  return response.choices[0].message.content;
}