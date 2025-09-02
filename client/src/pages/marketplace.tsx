import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import AgentCard from "@/components/agent-card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackgroundEffects from "@/components/background-effects";
import CursorEffects from "@/components/cursor-effects";
import { Button } from "@/components/ui/button";
import type { Agent } from "@shared/schema";
import { CATEGORIES } from "@/lib/constants";

export default function Marketplace() {
	const [selectedCategory, setSelectedCategory] = useState("all");

	const { data: agents, isLoading } = useQuery<Agent[]>({
		queryKey: ["/api/agents"],
	});

	const filteredAgents = (agents || []).filter((a) =>
		selectedCategory === "all" ? true : a.category === selectedCategory
	);

	return (
		<div className="min-h-screen bg-black">
			<BackgroundEffects />
			<CursorEffects />
			<Header />
			{/* Marketplace Section */}
			      <section className="py-32 relative" style={{
          background: "linear-gradient(180deg, #0b1220 0%, #0a1b2a 50%, #062a2a 100%)"
        }}>
				<div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(800px 300px at 10% -10%, rgba(59,130,246,0.12), transparent), radial-gradient(900px 350px at 110% 120%, rgba(34,211,238,0.12), transparent)"
          }} />
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						className="text-center mb-20"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<motion.div
							className="inline-block bg-gray-800/50 text-gray-300 rounded-full px-6 py-2 mb-6 font-semibold text-sm border border-gray-600/30"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							<i className="fas fa-store mr-2"></i>
							AI SPECIALIST MARKETPLACE
						</motion.div>
						<h2 className="text-5xl md:text-6xl font-neiko font-black text-white mb-6 leading-tight">
							BUILD YOUR DREAM
							<br />
							<span className="text-gradient">AI TEAM</span>
						</h2>
						<p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
							Mix and match specialized AI agents to create the perfect workforce for your business.
							Each agent excels in specific tasks and integrates seamlessly with others.
						</p>
						{/* Filters */}
						<motion.div
							className="flex flex-wrap justify-center gap-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							{CATEGORIES.map((category) => (
								<Button
									key={category.id}
									onClick={() => setSelectedCategory(category.id)}
									className={`px-6 py-3 rounded-lg font-medium transition-colors ${
										selectedCategory === category.id
											? "bg-primary text-white"
											: "bg-white text-secondary hover:bg-gray-100"
									}`}
								>
									{category.name}
								</Button>
							))}
						</motion.div>
					</motion.div>

					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse h-64" />
							))}
						</div>
					) : (
						<motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" layout>
							<AnimatePresence>
								{filteredAgents.map((agent) => (
									<motion.div key={agent.id} layout>
										<AgentCard agent={agent} />
									</motion.div>
								))}
							</AnimatePresence>
						</motion.div>
					)}
				</div>
			</section>
			<Footer />
		</div>
	);
}
