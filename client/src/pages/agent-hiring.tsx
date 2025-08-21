import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, X, Globe, Chrome, Shield, Activity, MessageSquare, Zap } from "lucide-react";
import type { Agent, SubAgent } from "@shared/schema";

export default function AgentHiring() {
  const [, params] = useRoute("/hire/:agentId");
  const [step, setStep] = useState(1);
  const [selectedSubAgents, setSelectedSubAgents] = useState<string[]>([]);
  const [permissions, setPermissions] = useState({
    browserAccess: false,
    emailAccess: false,
    calendarAccess: false,
    socialMedia: false
  });
  const [domains, setDomains] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState<"suggest" | "confirm" | "autonomous">("confirm");
  const [extensionStatus, setExtensionStatus] = useState<{ paired: boolean; online: boolean }>({ paired: false, online: false });

  const { data: agent, isLoading } = useQuery<Agent>({
    queryKey: ["/api/agents", params?.agentId],
    enabled: !!params?.agentId
  });

  const { data: subAgents } = useQuery<SubAgent[]>({
    queryKey: ["/api/sub-agents"],
    enabled: !!agent?.subAgentIds?.length
  });

  const { data: extensionStatusData } = useQuery({
    queryKey: ["/api/extension/status", "demo-user"],
    refetchInterval: 5000,
    select: (data: any) => ({
      paired: data.hasPairedExtension,
      online: data.extensions?.[0]?.isOnline || false
    })
  });

  const generatePairingCodeMutation = useMutation({
    mutationFn: () => apiRequest("/api/extension/generate-code", "POST", { userId: "demo-user" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/extension/status"] });
    }
  });

  const hireAgentMutation = useMutation({
    mutationFn: async (hireData: any) => {
      // Grant permissions for each selected capability
      for (const permission of hireData.permissions) {
        await apiRequest("/api/extension/permissions/demo-user/grant", "POST", permission);
      }
      
      // Execute initial agent task
      return apiRequest("/api/agents/hire", "POST", {
        agentType: getAgentType(agent?.category || ""),
        subAgent: agent?.name,
        task: "I've been hired! Ready to help with your tasks.",
        context: "Initial agent setup and introduction",
        userId: "demo-user"
      });
    },
    onSuccess: () => {
      setStep(4); // Success step
      queryClient.invalidateQueries({ queryKey: ["/api/agents/hired"] });
    }
  });

  useEffect(() => {
    if (extensionStatusData) {
      setExtensionStatus(extensionStatusData);
    }
  }, [extensionStatusData]);

  const getAgentType = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "growth": "business-growth",
      "operations": "operations",
      "people-finance": "people-finance"
    };
    return categoryMap[category] || "business-growth";
  };

  const agentSubAgents = subAgents?.filter(sa => 
    agent?.subAgentIds?.includes(sa.id)
  ) || [];

  const handleHire = async () => {
    if (!agent) return;

    const permissionsToGrant = [];
    
    if (permissions.browserAccess) {
      permissionsToGrant.push({
        agentId: agent.id,
        scope: "browser:all",
        domain: domains || "*",
        autonomyLevel: autonomyLevel
      });
    }
    
    if (permissions.emailAccess) {
      permissionsToGrant.push({
        agentId: agent.id,
        scope: "email:send",
        autonomyLevel: autonomyLevel
      });
    }

    if (permissions.calendarAccess) {
      permissionsToGrant.push({
        agentId: agent.id,
        scope: "calendar:create",
        autonomyLevel: autonomyLevel
      });
    }

    if (permissions.socialMedia) {
      permissionsToGrant.push({
        agentId: agent.id,
        scope: "social:post",
        autonomyLevel: autonomyLevel
      });
    }

    await hireAgentMutation.mutateAsync({
      agent,
      selectedSubAgents,
      permissions: permissionsToGrant,
      autonomyLevel
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
            <p className="text-gray-400">The agent you're trying to hire doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Hire {agent.name}
          </h1>
          <p className="text-gray-400 text-lg">
            Set up your AI agent with secure browser control
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {stepNum < step ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-12 h-0.5 ${stepNum < step ? 'bg-blue-600' : 'bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Chrome className="w-5 h-5" />
                    Chrome Extension Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Extension Status</h3>
                      <p className="text-gray-400 text-sm">
                        {extensionStatus.paired 
                          ? extensionStatus.online 
                            ? "Connected and online" 
                            : "Paired but offline"
                          : "Not paired"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        extensionStatus.paired && extensionStatus.online 
                          ? 'bg-green-500' 
                          : extensionStatus.paired 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`} />
                      <span className={`text-sm ${
                        extensionStatus.paired && extensionStatus.online 
                          ? 'text-green-400' 
                          : 'text-gray-400'
                      }`}>
                        {extensionStatus.paired && extensionStatus.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {!extensionStatus.paired && (
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        Install the Replivo Chrome extension to enable device control for your agents.
                      </p>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => window.open('/chrome-extension/manifest.json', '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Chrome className="w-4 h-4 mr-2" />
                          Download Extension
                        </Button>
                        <Button
                          onClick={() => generatePairingCodeMutation.mutate()}
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                          disabled={generatePairingCodeMutation.isPending}
                        >
                          Generate Pairing Code
                        </Button>
                      </div>
                      {generatePairingCodeMutation.data && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <p className="text-white font-mono text-lg text-center">
                            {generatePairingCodeMutation.data.pairingCode}
                          </p>
                          <p className="text-gray-400 text-sm text-center mt-2">
                            Enter this code in the extension
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!extensionStatus.paired}
                    className="w-full bg-gray-800 hover:bg-gray-700"
                  >
                    Continue to Permissions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Browser Control</h3>
                        <p className="text-gray-400 text-sm">Allow agent to interact with web pages</p>
                      </div>
                      <Switch
                        checked={permissions.browserAccess}
                        onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, browserAccess: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Email Access</h3>
                        <p className="text-gray-400 text-sm">Send emails on your behalf</p>
                      </div>
                      <Switch
                        checked={permissions.emailAccess}
                        onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, emailAccess: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Calendar Access</h3>
                        <p className="text-gray-400 text-sm">Create and manage calendar events</p>
                      </div>
                      <Switch
                        checked={permissions.calendarAccess}
                        onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, calendarAccess: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Social Media</h3>
                        <p className="text-gray-400 text-sm">Post content to social platforms</p>
                      </div>
                      <Switch
                        checked={permissions.socialMedia}
                        onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, socialMedia: checked }))}
                      />
                    </div>
                  </div>

                  {permissions.browserAccess && (
                    <div>
                      <label className="text-white font-medium block mb-2">Allowed Domains</label>
                      <Input
                        value={domains}
                        onChange={(e) => setDomains(e.target.value)}
                        placeholder="example.com, *.mycompany.com (leave empty for all domains)"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-white font-medium block mb-2">Autonomy Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "suggest" as const, label: "Suggest", desc: "Ask before every action" },
                        { value: "confirm" as const, label: "Confirm", desc: "Ask for important actions" },
                        { value: "autonomous" as const, label: "Autonomous", desc: "Act independently" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAutonomyLevel(option.value)}
                          className={`p-3 rounded-lg border text-left ${
                            autonomyLevel === option.value
                              ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                              : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs opacity-75">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => setStep(1)} variant="outline" className="flex-1 border-gray-600">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1 bg-gray-800 hover:bg-gray-700">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Confirm Hiring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-white font-bold text-xl mb-2">{agent.name}</h3>
                    <p className="text-gray-400 mb-4">{agent.description}</p>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-600/20 text-blue-300">
                        ${(agent.price / 100).toFixed(0)}/month
                      </Badge>
                      <Badge className="bg-gray-700 text-gray-300">
                        {agentSubAgents.length} Sub-agents
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Granted Permissions:</h4>
                    <div className="space-y-1">
                      {permissions.browserAccess && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-4 h-4" />
                          <span>Browser Control {domains && `(${domains})`}</span>
                        </div>
                      )}
                      {permissions.emailAccess && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-4 h-4" />
                          <span>Email Access</span>
                        </div>
                      )}
                      {permissions.calendarAccess && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-4 h-4" />
                          <span>Calendar Access</span>
                        </div>
                      )}
                      {permissions.socialMedia && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-4 h-4" />
                          <span>Social Media Access</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => setStep(2)} variant="outline" className="flex-1 border-gray-600">
                      Back
                    </Button>
                    <Button 
                      onClick={handleHire}
                      disabled={hireAgentMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {hireAgentMutation.isPending ? 'Hiring...' : 'Hire Agent'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">Agent Hired Successfully!</h3>
                  <p className="text-gray-400 mb-6">
                    {agent.name} is now active and ready to help you. You can start giving it tasks through the Chrome extension.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => window.location.href = "/marketplace"} variant="outline" className="border-gray-600">
                      Back to Marketplace
                    </Button>
                    <Button onClick={() => window.location.href = "/dashboard"} className="bg-blue-600 hover:bg-blue-700">
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}

