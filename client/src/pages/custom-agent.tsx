import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackgroundEffects from "@/components/background-effects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Brain, 
  Settings, 
  Code, 
  Palette, 
  Rocket,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Users,
  TrendingUp
} from "lucide-react";

const CUSTOMIZATION_OPTIONS = [
  {
    id: "personality",
    title: "Personality & Tone",
    description: "Define how your agent communicates and behaves",
    icon: Brain,
    options: ["Professional", "Friendly", "Technical", "Creative", "Casual"]
  },
  {
    id: "capabilities",
    title: "Core Capabilities",
    description: "Select the main functions your agent will perform",
    icon: Zap,
    options: ["Content Creation", "Data Analysis", "Customer Support", "Sales", "Project Management"]
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect with your existing tools and platforms",
    icon: Settings,
    options: ["Slack", "Notion", "Google Workspace", "Salesforce", "HubSpot"]
  },
  {
    id: "customization",
    title: "Custom Features",
    description: "Add unique functionality specific to your needs",
    icon: Code,
    options: ["Custom API", "Specialized Training", "Unique Workflows", "Brand Voice", "Industry Knowledge"]
  }
];

const INDUSTRY_TEMPLATES = [
  {
    name: "E-commerce",
    description: "Product recommendations, inventory management, customer support",
    icon: "🛒",
    color: "from-blue-500 to-cyan-600"
  },
  {
    name: "SaaS",
    description: "User onboarding, feature adoption, technical support",
    icon: "💻",
    color: "from-purple-500 to-pink-600"
  },
  {
    name: "Marketing",
    description: "Content creation, campaign management, analytics",
    icon: "📈",
    color: "from-green-500 to-emerald-600"
  },
  {
    name: "Finance",
    description: "Risk assessment, compliance monitoring, reporting",
    icon: "💰",
    color: "from-yellow-500 to-orange-600"
  },
  {
    name: "Healthcare",
    description: "Patient scheduling, medical records, appointment reminders",
    icon: "🏥",
    color: "from-red-500 to-rose-600"
  },
  {
    name: "Education",
    description: "Student support, course management, learning analytics",
    icon: "🎓",
    color: "from-indigo-500 to-blue-600"
  }
];

export default function CustomAgent() {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string[]>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [personality, setPersonality] = useState<string>("Professional");
  const [toneTraits, setToneTraits] = useState<{clarity:number; creativity:number; empathy:number}>({ clarity: 70, creativity: 50, empathy: 60 });
  const [description, setDescription] = useState<string>("");

  const handleCustomizationChange = (categoryId: string, option: string) => {
    setCustomizations(prev => {
      const current = prev[categoryId] || [];
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [categoryId]: updated };
    });
  };

  const getTotalPrice = () => {
    let basePrice = 299;
    const customizationCount = Object.values(customizations).flat().length;
    const integrationCount = (customizations.integrations?.length || 0);
    const complexity = Math.round((toneTraits.creativity + toneTraits.clarity + toneTraits.empathy) / 100);
    return basePrice + (customizationCount * 50) + (integrationCount * 75) + complexity;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <BackgroundEffects />
      
      {/* Hero Section (Realistic messaging) */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Sparkles className="w-4 h-4 text-cyan-300 mr-2" />
              <span className="text-cyan-200 text-xs font-semibold tracking-wider">CUSTOM AI ASSISTANT BUILDER</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black mb-4">Build Your Custom AI Assistant</h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Real results with realistic expectations: most projects complete in 2–3 weeks including setup, training, and team onboarding.
            </p>
          </motion.div>

          {/* New Wizard: Sidebar + Preview + Options */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Progress */}
            <aside className="lg:col-span-3">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Setup Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[{n:1,l:"Industry"},{n:2,l:"Personality"},{n:3,l:"Capabilities"},{n:4,l:"Review & Pricing"}].map(s => (
                    <div key={s.n} className={`flex items-center justify-between p-3 rounded-xl border ${currentStep >= s.n ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep > s.n ? 'bg-cyan-600 text-white' : currentStep === s.n ? 'bg-cyan-500/30 text-cyan-200' : 'bg-gray-800 text-gray-400'}`}>
                          {currentStep > s.n ? '✓' : s.n}
                        </div>
                        <span className="text-sm text-white/90">{s.l}</span>
                      </div>
                      {currentStep === s.n && <span className="text-xs text-cyan-300">Current</span>}
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-gray-400">
                    Typical timeline: Discovery (1wk) → Build (2–3wks) → Testing (1wk) → Training (ongoing)
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Configurator */}
            <main className="lg:col-span-6 space-y-6">
              {currentStep === 1 && (
                <Card className="bg-gray-900/60 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Choose your industry template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {INDUSTRY_TEMPLATES.map(t => (
                        <button
                          key={t.name}
                          onClick={() => setSelectedTemplate(t.name)}
                          className={`text-left p-4 rounded-2xl border transition-all bg-white/5 hover:bg-white/10 ${selectedTemplate===t.name? 'border-cyan-500/50 shadow-[0_0_0_1px_rgba(34,211,238,.2)]':'border-white/10'}`}
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br ${t.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>{t.icon}</div>
                          <div className="font-semibold text-white">{t.name}</div>
                          <div className="text-sm text-gray-400">{t.description}</div>
                          <div className="mt-2 text-xs text-gray-500">Popular in your region</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="bg-gray-900/60 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Define personality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {CUSTOMIZATION_OPTIONS.find(c=>c.id==='personality')!.options.map(opt => (
                        <Badge
                          key={opt}
                          onClick={() => setPersonality(opt)}
                          className={`cursor-pointer ${personality===opt? 'bg-cyan-600':'bg-gray-700 hover:bg-gray-600'}`}
                        >{opt}</Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[{k:'clarity',l:'Clarity'},{k:'creativity',l:'Creativity'},{k:'empathy',l:'Empathy'}].map(s => (
                        <div key={s.k}>
                          <div className="text-sm text-gray-300 mb-1">{s.l}: {toneTraits[s.k as keyof typeof toneTraits]}%</div>
                          <input type="range" min={0} max={100} value={toneTraits[s.k as keyof typeof toneTraits]}
                            onChange={(e)=> setToneTraits(prev=>({...prev, [s.k]: Number(e.target.value)}))}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm text-gray-300 mb-1">Brief description (optional)</div>
                      <Textarea value={description} onChange={(e)=> setDescription(e.target.value)} placeholder="Describe your assistant’s goals, audience, and constraints" className="bg-gray-900 border-gray-800" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="bg-gray-900/60 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Select capabilities & integrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Core Capabilities</div>
                      <div className="flex flex-wrap gap-2">
                        {CUSTOMIZATION_OPTIONS.find(c=>c.id==='capabilities')!.options.map(opt => (
                          <Badge
                            key={opt}
                            onClick={() => handleCustomizationChange('capabilities', opt)}
                            className={`cursor-pointer ${customizations.capabilities?.includes(opt)? 'bg-cyan-600':'bg-gray-700 hover:bg-gray-600'}`}
                          >{opt}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-2">Integrations</div>
                      <div className="flex flex-wrap gap-2">
                        {CUSTOMIZATION_OPTIONS.find(c=>c.id==='integrations')!.options.map(opt => (
                          <Badge
                            key={opt}
                            onClick={() => handleCustomizationChange('integrations', opt)}
                            className={`cursor-pointer ${customizations.integrations?.includes(opt)? 'bg-cyan-600':'bg-gray-700 hover:bg-gray-600'}`}
                          >{opt}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Most integrations take 1–3 days for setup and testing.</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <Card className="bg-gray-900/60 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Review & pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-gray-400">Industry</div>
                        <div className="text-white font-semibold">{selectedTemplate || 'Not selected'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-gray-400">Personality</div>
                        <div className="text-white font-semibold">{personality}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-gray-400">Capabilities</div>
                        <div className="text-white text-sm">{customizations.capabilities?.join(', ') || 'None'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-gray-400">Integrations</div>
                        <div className="text-white text-sm">{customizations.integrations?.join(', ') || 'None'}</div>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-gray-400 text-sm">
                        Transparent pricing includes setup, training, QA, and rollout support.
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-cyan-400">${getTotalPrice()}</div>
                        <div className="text-sm text-gray-500">per month • setup fees may apply</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                  disabled={currentStep===1}
                  onClick={()=> setCurrentStep(s=> Math.max(1, s-1))}
                >Back</Button>
                {currentStep < 4 ? (
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-600"
                    onClick={()=> setCurrentStep(s=> Math.min(4, s+1))}
                  >Next</Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-green-500 to-emerald-600"
                    onClick={()=> setLocation('/dashboard')}
                  >Request Build</Button>
                )}
              </div>
            </main>

            {/* Live Preview */}
            <aside className="lg:col-span-3">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Live preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="text-xs text-gray-500 mb-2">Conversation sample</div>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                        You: Can you draft a weekly report for marketing?
                      </div>
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200">
                        {personality} Assistant: Sure! I’ll prepare a concise weekly summary with highlights, trends, and next actions.
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="text-xs text-gray-500 mb-2">Summary</div>
                    <div className="text-xs text-gray-400">
                      <div>Template: <span className="text-white/90">{selectedTemplate || '—'}</span></div>
                      <div>Capabilities: <span className="text-white/90">{customizations.capabilities?.length || 0}</span></div>
                      <div>Integrations: <span className="text-white/90">{customizations.integrations?.length || 0}</span></div>
                      <div>Tone: <span className="text-white/90">{toneTraits.clarity}% clarity / {toneTraits.creativity}% creativity / {toneTraits.empathy}% empathy</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="text-xs text-gray-500 mb-1">Estimated cost</div>
                    <div className="text-2xl font-black text-cyan-400">${getTotalPrice()}</div>
                    <div className="text-[11px] text-gray-500">Includes setup & QA • Integrations may require additional time</div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* Industry Templates (legacy) */}
      {/* The original sections remain below for reference; the wizard above is primary. */}
      {/* ... existing code ... */}

      {/* Pricing & CTA */}
      {/* ... existing code ... */}

      <Footer />
    </div>
  );
}
