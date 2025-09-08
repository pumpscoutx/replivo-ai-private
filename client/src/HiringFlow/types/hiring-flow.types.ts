export type HiringStep = 'pricing' | 'payment' | 'tasks' | 'tools' | 'extension' | 'pairing' | 'success';

export interface AgentRef {
	id: string;
	name: string;
	category?: string;
	icon?: any;
}

export interface TaskItem {
	id: string;
	title?: string;
	description?: string;
	priority?: 'low' | 'medium' | 'high';
}

export interface ToolItem {
	id: string;
	name: string;
	status?: 'disconnected' | 'connected' | 'testing';
}

export interface HiringFlowState {
	step: HiringStep;
	selectedAgent: AgentRef | null;
	selectedPlan: 'monthly' | 'yearly';
	paymentReceiptId?: string;
	selectedTasks: TaskItem[];
	connectedTools: ToolItem[];
	pairingCode?: string;
	sessionId?: string;
} 