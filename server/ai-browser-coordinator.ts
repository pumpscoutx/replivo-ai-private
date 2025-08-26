// AI Browser Automation Coordinator
// Converts natural language requests into browser automation commands

import { callAgentLLM, type AgentType } from './llmClient';
import { capabilityRegistry, isSensitiveCapability, type CapabilityId } from './capabilities';
import { storage } from './storage';
import { getExtensionWebSocketServer } from './routes';

export interface BrowserTask {
	id: string;
	naturalLanguage: string;
	agentType: AgentType;
	priority: 'low' | 'normal' | 'high';
	context?: {
		url?: string;
		pageType?: string;
		userSession?: string;
	};
}

export interface TaskPlan {
	steps: TaskStep[];
	estimatedDuration: number;
	confidence: number;
	requiresApproval: boolean;
}

export interface TaskStep {
	action: string;
	target: string;
	value?: string;
	description: string;
	timeout?: number;
	waitCondition?: string;
}

export class AIBrowserCoordinator {
	constructor() {
		console.log('AI Browser Coordinator initialized');
	}

	// Main entry point: Convert natural language to browser automation
	async executeNaturalLanguageTask(
		userId: string,
		naturalLanguage: string,
		agentType: AgentType = 'business-growth',
		context: any = {}
	): Promise<{ success: boolean; result?: any; error?: string }> {
		try {
			console.log(`Executing task for user ${userId}: "${naturalLanguage}"`);

			// Step 1: Analyze and plan the task deterministically
			const taskPlan = await this.planTaskWithAI(naturalLanguage, agentType, context);

			// Step 2: Convert plan to capability-aligned commands with safety flags
			const browserCommands = await this.convertPlanToCommands(userId, taskPlan);

			// Step 3: Execute commands via the WebSocket orchestrator
			const executionResult = await this.executeCommands(userId, browserCommands);

			return {
				success: true,
				result: {
					task: naturalLanguage,
					plan: taskPlan,
					commands: browserCommands,
					execution: executionResult
				}
			};
		} catch (error) {
			console.error('Natural language task execution failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	// Use AI to plan the task execution with allowed actions only
	private async planTaskWithAI(
		naturalLanguage: string,
		agentType: AgentType,
		context: any
	): Promise<TaskPlan> {
		const allowedActions = [
			'navigate',
			'click',
			'fill',
			'wait',
			'extract',
			'compose',
			'send'
		];

		const safetyRules = `
- Per-app scopes and autonomy levels apply
- Sensitive categories require explicit confirmation: payments, mass messaging (>5 recipients), permanent deletes
- Never bypass captchas, 2FA, or rate limits
- Prefer official APIs with OAuth when available (Gmail, Twitter) else fall back to UI
- Output only allowed actions: ${allowedActions.join(', ')}
`;

		const systemPrompt = `You are a deterministic planner that converts natural language into a JSON plan of granular UI/API steps. Do not narrate. Produce JSON only.

${safetyRules}

Return a JSON object with this structure:
{
  "steps": [
    {
      "action": "navigate|click|fill|wait|extract|compose|send",
      "target": "specific element, URL, or platform",
      "value": "optional content",
      "description": "short description",
      "timeout": 3000
    }
  ],
  "estimatedDuration": 12000,
  "confidence": 0.9,
  "requiresApproval": false
}

Natural language request: "${naturalLanguage}"
Context: ${JSON.stringify(context)}`;

		const messages = [
			{ role: 'system' as const, content: systemPrompt },
			{ role: 'user' as const, content: `Plan this task using only the allowed actions.` }
		];

		try {
			const response = await callAgentLLM(agentType, messages, 'openai/gpt-3.5-turbo');
			const planText = response.choices[0].message.content;
			const jsonMatch = planText.match(/\{[\s\S]*\}/);
			if (!jsonMatch) throw new Error('No JSON found in AI response');
			const plan = JSON.parse(jsonMatch[0]);
			if (!plan.steps || !Array.isArray(plan.steps)) throw new Error('Invalid plan structure');
			return plan;
		} catch (err) {
			console.warn('Planner LLM unavailable or invalid output. Falling back to local planner.', err);
			return this.generateFallbackPlan(naturalLanguage);
		}
	}

	// Generate fallback plan when AI planning fails
	private generateFallbackPlan(naturalLanguage: string): TaskPlan {
		const steps: TaskStep[] = [];

		if (/gmail|email/i.test(naturalLanguage)) {
			steps.push({ action: 'navigate', target: 'https://mail.google.com', description: 'Open Gmail', timeout: 3000 });
			if (/send|compose/i.test(naturalLanguage)) {
				steps.push({ action: 'compose', target: 'email', description: 'Compose email', timeout: 2000 });
			}
		} else if (/linkedin/i.test(naturalLanguage)) {
			steps.push({ action: 'navigate', target: 'https://www.linkedin.com', description: 'Open LinkedIn', timeout: 3000 });
		} else if (/twitter|x\.com/i.test(naturalLanguage)) {
			steps.push({ action: 'navigate', target: 'https://twitter.com', description: 'Open Twitter/X', timeout: 3000 });
		} else if (/calendar/i.test(naturalLanguage)) {
			steps.push({ action: 'navigate', target: 'https://calendar.google.com', description: 'Open Google Calendar', timeout: 3000 });
		} else {
			steps.push({ action: 'extract', target: 'page analysis', description: 'Analyze page', timeout: 2000 });
		}

		return { steps, estimatedDuration: steps.length * 2000, confidence: 0.8, requiresApproval: false };
	}

	// Convert AI plan to commands for the extension orchestrator
	private async convertPlanToCommands(userId: string, plan: TaskPlan): Promise<any[]> {
		const commands: any[] = [];

		const hasGmail = await storage.hasOAuthToken?.(userId, 'google').catch?.(() => false);
		const hasTwitter = await storage.hasOAuthToken?.(userId, 'twitter').catch?.(() => false);
		const userPermissions = await storage.getUserPermissions(userId).catch(() => [] as any[]);

		for (let i = 0; i < plan.steps.length; i++) {
			const step = plan.steps[i];
			let capability: CapabilityId;
			let args: Record<string, any> = {};

			if (step.action === 'navigate') {
				capability = 'open_url';
				args = { url: this.resolveUrl(step.target) };
			} else if (step.action === 'compose' && /email/i.test(step.target)) {
				if (hasGmail) {
					capability = 'api_send_email';
					args = { recipient: '', subject: '', body: '' }; // planner may refine later
				} else {
					capability = 'compose_email';
					args = { recipient: '', subject: '', body: '' };
				}
			} else if (step.action === 'click' || step.action === 'fill' || step.action === 'wait' || step.action === 'extract') {
				// Use smart UI command path for descriptive targets
				capability = 'execute_ai_command';
				args = { action: this.smartActionFor(step.action), target: step.target, value: step.value, waitCondition: step.waitCondition, timeout: step.timeout };
			} else if (/send/i.test(step.action)) {
				capability = hasGmail ? 'api_send_email' : 'compose_email';
				args = { recipient: '', subject: '', body: '' };
			} else {
				// Default to smart analyze
				capability = 'execute_ai_command';
				args = { action: 'analyze_and_act', target: step.target, value: step.value };
			}

			// Sensitive check + scope-based authorization
			let requiresApproval = isSensitiveCapability(capability, args);
			const scopes = capabilityRegistry.capabilities[capability]?.scopes || [];
			if (scopes.length > 0) {
				for (const scope of scopes) {
					const perm = userPermissions.find(p => p.scope === scope && p.isActive !== false && (p.autonomyLevel === 'autonomous'));
					if (!perm) {
						requiresApproval = true;
						break;
					}
				}
			}

			commands.push({
				request_id: `cmd_${Date.now()}_${i}`,
				agent_id: 'planner',
				capability,
				args,
				requiresApproval
			});
		}

		return commands;
	}

	private smartActionFor(action: string): string {
		switch (action) {
			case 'navigate': return 'smart_navigate';
			case 'click': return 'smart_click';
			case 'fill': return 'smart_fill';
			default: return 'analyze_and_act';
		}
	}

	private resolveUrl(target: string): string {
		if (/^https?:\/\//i.test(target)) return target;
		const t = target.toLowerCase();
		if (t.includes('gmail')) return 'https://mail.google.com';
		if (t.includes('linkedin')) return 'https://www.linkedin.com';
		if (t.includes('calendar')) return 'https://calendar.google.com';
		if (t.includes('drive')) return 'https://drive.google.com';
		return target;
	}

	// Execute commands sequentially with simple state machine
	private async executeCommands(userId: string, commands: any[]) {
		const ws = getExtensionWebSocketServer();
		if (!ws) throw new Error('Extension WebSocket server not initialized');

		const results: any[] = [];
		for (const cmd of commands) {
			try {
				const sent = await ws.sendCommand(userId, cmd);
				if (!sent) {
					results.push({ request_id: cmd.request_id, status: 'failed', error: 'Extension not connected' });
					continue;
				}
				// Optimistic: mark as queued; real-time updates will arrive via command_result broadcast
				results.push({ request_id: cmd.request_id, status: 'queued' });
				// Small delay to avoid overwhelming
				await new Promise((r) => setTimeout(r, 500));
			} catch (err) {
				results.push({ request_id: cmd.request_id, status: 'failed', error: err instanceof Error ? err.message : String(err) });
			}
		}
		return { total: commands.length, results };
	}
}

// Export singleton instance
export const aiBrowserCoordinator = new AIBrowserCoordinator();