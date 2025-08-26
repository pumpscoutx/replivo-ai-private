export type CapabilityId =
  | 'open_url'
  | 'compose_email'
  | 'fill_form'
  | 'click_selector'
  | 'extract_content'
  | 'take_screenshot'
  | 'execute_ai_command'
  | 'api_send_email'
  | 'api_post_tweet';

export interface CapabilityDefinition {
  id: CapabilityId;
  title: string;
  description: string;
  argsSchema: Record<string, any>;
  sensitive?: boolean | ((args: Record<string, any>) => boolean);
  preferredPath?: 'api' | 'ui';
  scopes?: string[]; // authorization scopes
}

export interface CapabilityRegistry {
  version: string;
  capabilities: Record<CapabilityId, CapabilityDefinition>;
}

export const capabilityRegistry: CapabilityRegistry = {
  version: '1.0.0',
  capabilities: {
    open_url: {
      id: 'open_url',
      title: 'Open URL',
      description: 'Opens a URL in a new tab or current tab',
      argsSchema: { url: 'string', newTab: 'boolean?' },
      preferredPath: 'ui',
      scopes: ['browser:navigate']
    },
    compose_email: {
      id: 'compose_email',
      title: 'Compose Email (UI)',
      description: 'Composes an email using Gmail UI with prefilled fields',
      argsSchema: { recipient: 'string', subject: 'string', body: 'string' },
      sensitive: (args) => {
        const to = (args.recipient || '').split(/[,;\s]+/).filter(Boolean);
        return to.length > 5; // mass messaging guard
      },
      preferredPath: 'ui',
      scopes: ['email:send']
    },
    api_send_email: {
      id: 'api_send_email',
      title: 'Send Email (API)',
      description: 'Sends an email via Gmail API using OAuth',
      argsSchema: { recipient: 'string', subject: 'string', body: 'string' },
      sensitive: (args) => {
        const to = (args.recipient || '').split(/[,;\s]+/).filter(Boolean);
        return to.length > 5;
      },
      preferredPath: 'api',
      scopes: ['gmail.read', 'gmail.send']
    },
    api_post_tweet: {
      id: 'api_post_tweet',
      title: 'Post Tweet (API)',
      description: 'Posts a tweet via Twitter/X API using OAuth',
      argsSchema: { text: 'string' },
      sensitive: false,
      preferredPath: 'api',
      scopes: ['twitter.write']
    },
    fill_form: {
      id: 'fill_form',
      title: 'Fill Form (CSS selectors)',
      description: 'Fills fields by CSS selectors and optionally submits',
      argsSchema: { selectors: 'Record<string,string>', values: 'Record<string,string>', submit: 'boolean?' },
      preferredPath: 'ui',
      scopes: ['browser:fill']
    },
    click_selector: {
      id: 'click_selector',
      title: 'Click Element (CSS selector)',
      description: 'Clicks an element found by CSS selector',
      argsSchema: { selector: 'string', waitFor: 'number?' },
      preferredPath: 'ui',
      scopes: ['browser:click']
    },
    extract_content: {
      id: 'extract_content',
      title: 'Extract Content',
      description: 'Extracts content from elements',
      argsSchema: { selectors: 'Record<string,string>', includeText: 'boolean?', includeAttributes: 'string[]?' },
      preferredPath: 'ui',
      scopes: ['browser:read']
    },
    take_screenshot: {
      id: 'take_screenshot',
      title: 'Take Screenshot',
      description: 'Captures a screenshot of the visible tab',
      argsSchema: { quality: 'number?' },
      preferredPath: 'ui',
      scopes: ['browser:read']
    },
    execute_ai_command: {
      id: 'execute_ai_command',
      title: 'Execute Smart UI Command',
      description: 'Runs a smart action in the content script (smart_click/fill/navigate)',
      argsSchema: { action: "'smart_click'|'smart_fill'|'smart_navigate'|'analyze_and_act'", target: 'string', value: 'string?' },
      preferredPath: 'ui',
      scopes: ['browser:act']
    }
  }
};

export function isSensitiveCapability(id: CapabilityId, args: Record<string, any>): boolean {
  const def = capabilityRegistry.capabilities[id];
  if (!def) return false;
  if (typeof def.sensitive === 'function') return !!def.sensitive(args);
  return !!def.sensitive;
}

export function listCapabilities() {
  return {
    version: capabilityRegistry.version,
    capabilities: Object.values(cabilitySummaries()),
  };
}

function cabilitySummaries() {
  const entries = Object.values(capabilityRegistry.capabilities).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    scopes: c.scopes || [],
    preferredPath: c.preferredPath || 'ui',
  }));
  const map: Record<string, any> = {};
  for (const e of entries) map[e.id] = e;
  return map;
}