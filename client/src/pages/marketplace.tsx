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
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<"relevance" | "rating" | "priceAsc" | "priceDesc">("relevance");

	const { data: agents, isLoading } = useQuery<Agent[]>({
		queryKey: ["/api/agents"],
	});

	// Normalize potential nullable arrays from API
	const normalizedAgents: Agent[] = (agents || []).map((a: any) => ({
		...a,
		tasks: Array.isArray(a.tasks) ? a.tasks : [],
	}));

	let filteredAgents = normalizedAgents.filter((a) =>
		(selectedCategory === "all" ? true : a.category === selectedCategory) &&
		(a.name.toLowerCase().includes(search.toLowerCase()) ||
		 a.description.toLowerCase().includes(search.toLowerCase()))
	);

	// Sorting
	switch (sort) {
		case "rating":
			filteredAgents = [...filteredAgents].sort((a, b) => (b.rating || 0) - (a.rating || 0));
			break;
		case "priceAsc":
			filteredAgents = [...filteredAgents].sort((a, b) => (a.price || 0) - (b.price || 0));
			break;
		case "priceDesc":
			filteredAgents = [...filteredAgents].sort((a, b) => (b.price || 0) - (a.price || 0));
			break;
		default:
			break;
	}

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
						{/* Animated background elements */}
						<div className="absolute inset-0 -z-10 overflow-hidden">
							<div className="absolute left-1/4 -top-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
							<div className="absolute right-1/5 top-0 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: '0.6s' }} />
							<div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(transparent 95%, rgba(255,255,255,0.15) 95%), linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.15) 95%)", backgroundSize: '24px 24px' }} />
						</div>

						<motion.div
							className="inline-block bg-white/10 backdrop-blur-md text-gray-200 rounded-full px-6 py-2 mb-6 font-semibold text-sm border border-white/20 shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							<i className="fas fa-store mr-2"></i>
							AI SPECIALIST MARKETPLACE
						</motion.div>

						<h2 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
							<span className="block drop-shadow-[0_0_15px_rgba(59,130,246,0.35)]">BUILD YOUR DREAM</span>
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 drop-shadow-[0_0_18px_rgba(99,102,241,0.35)]">AI TEAM</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
							Launch a high‑performing AI workforce in minutes. Proven specialists that create, analyze, and automate — 24/7.
						</p>

						{/* Search + Filters */}
						<div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3 mb-8">
							<div className="relative flex-1">
								<i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
								<input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search agents, skills, or categories"
									className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
								/>
							</div>
							<button className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition">
								<i className="fas fa-sliders-h mr-2" />
								Filters
							</button>
							<select
								value={sort}
								onChange={(e) => setSort(e.target.value as any)}
								className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
							>
								<option value="relevance">Sort: Relevance</option>
								<option value="rating">Sort: Rating</option>
								<option value="priceAsc">Sort: Price (Low → High)</option>
								<option value="priceDesc">Sort: Price (High → Low)</option>
							</select>
						</div>

						{/* Category Pills */}
						<motion.div
							className="flex flex-wrap justify-center gap-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							{CATEGORIES.map((category) => (
								<button
									key={category.id}
									onClick={() => setSelectedCategory(category.id)}
									className={`px-5 py-2.5 rounded-2xl backdrop-blur-md border transition-all text-sm font-medium flex items-center gap-2 shadow ${
										selectedCategory === category.id
											? 'bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 border-cyan-400/40 text-white ring-2 ring-cyan-400/30'
											: 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/15'
									}`}
								>
									<i className={`text-xs ${category.id === 'content' ? 'fas fa-pen' : category.id === 'analytics' ? 'fas fa-chart-line' : category.id === 'support' ? 'fas fa-headset' : 'fas fa-robot'}`} />
									{category.name}
								</button>
							))}
						</motion.div>

						{/* Social proof / stats */}
						<div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
							<div className="flex items-center gap-2"><i className="fas fa-users text-cyan-300" /> Join 10,000+ businesses</div>
							<div className="flex items-center gap-2"><i className="fas fa-bolt text-yellow-300" /> Avg. 2.1s response</div>
							<div className="flex items-center gap-2"><i className="fas fa-shield-alt text-emerald-300" /> Enterprise‑grade security</div>
						</div>
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
