import { useState, useCallback } from 'react';
import type { HiringFlowState, AgentRef, TaskItem, ToolItem, HiringStep } from '../types/hiring-flow.types';

export function useHiringFlow(initialAgent?: AgentRef) {
	const [state, setState] = useState<HiringFlowState>({
		step: 'pricing',
		selectedAgent: initialAgent || null,
		selectedPlan: 'monthly',
		selectedTasks: [],
		connectedTools: [],
	});

	const setStep = useCallback((step: HiringStep) => setState(s => ({ ...s, step })), []);
	const setPlan = useCallback((plan: 'monthly' | 'yearly') => setState(s => ({ ...s, selectedPlan: plan })), []);

	const startHiring = useCallback(async (agentId: string, plan: 'monthly' | 'yearly') => {
		const res = await fetch(`/api/agents/${agentId}/hire`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ plan })
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.error || 'Failed to start hiring');
		setState(s => ({ ...s, sessionId: data.sessionId }));
	}, []);

	const processPayment = useCallback(async (amount: number) => {
		if (!state.sessionId) throw new Error('No session');
		const res = await fetch('/api/payment/process', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ sessionId: state.sessionId, amount })
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.error || 'Payment failed');
		setState(s => ({ ...s, paymentReceiptId: data.receiptId }));
	}, [state.sessionId]);

	const saveConfiguration = useCallback(async (agentId: string, tasks: TaskItem[], tools: ToolItem[]) => {
		const res = await fetch(`/api/agents/${agentId}/configure`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ sessionId: state.sessionId, selectedTasks: tasks, connectedTools: tools })
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.error || 'Failed to save configuration');
	}, [state.sessionId]);

	return { state, setStep, setPlan, startHiring, processPayment, saveConfiguration, setState };
} 