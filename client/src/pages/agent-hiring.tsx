import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star, Shield, Clock, CheckCircle, AlertCircle, Chrome } from "lucide-react";
import ExtensionSetup from "@/components/extension-setup";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackgroundEffects from "@/components/background-effects";
import { useToast } from "@/hooks/use-toast";
import type { SubAgent } from "@shared/schema";

interface Permission {
  scope: string;
  domain?: string;
  description: string;
  example: string;
}

export default function AgentHiring() {
  const { id } = useParams();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [autonomyLevel, setAutonomyLevel] = useState<"suggest" | "confirm" | "autonomous">("confirm");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showExtensionSetup, setShowExtensionSetup] = useState(false);

  const { data: agent, isLoading } = useQuery<SubAgent>({
    queryKey: [`/api/sub-agents/${id}`],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading agent details...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Agent not found</div>
      </div>
    );
  }

  // Mock permissions based on agent category
  const requestedPermissions: Permission[] = [
    {
      scope: "browser:navigate",
      description: "Navigate between web pages",
      example: "Open CRM dashboard and customer records"
    },
    {
      scope: "browser:fill",
      domain: "*.crm.example.com",
      description: "Fill and submit forms on CRM domains",
      example: "Update customer information and ticket status"
    },
    {
      scope: "browser:read",
      domain: "*.crm.example.com",
      description: "Read page content on allowed domains",
      example: "Extract customer data and order information"
    },
    {
      scope: "email:send",
      description: "Send emails on your behalf",
      example: "Send follow-up emails to customers"
    }
  ];

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleStartHiring = () => {
    if (!companyName || !contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all company details.",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };

  const handleGrantPermissions = () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }
    setShowExtensionSetup(true);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="bg-gray-900 border-gray-700 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  {agent.icon}
                </div>
                Hiring {agent.name}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Provide your company details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company" className="text-white">Company Name</Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your@company.com"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Agent Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white">${(agent.price / 100).toFixed(2)}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white">{agent.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white">{(agent.rating / 10).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleStartHiring}
                className="w-full"
                data-testid="button-start-hiring"
              >
                Continue to Permissions
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-gray-900 border-gray-700 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                Permission Request
              </CardTitle>
              <CardDescription className="text-gray-400">
                {agent.name} is requesting the following permissions to work effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {requestedPermissions.map((permission, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                            {permission.scope}
                          </Badge>
                          {permission.domain && (
                            <Badge variant="outline" className="text-gray-400">
                              {permission.domain}
                            </Badge>
                          )}
                        </div>
                        <p className="text-white text-sm mb-1">{permission.description}</p>
                        <p className="text-gray-500 text-xs">Example: "{permission.example}"</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-white font-medium">Choose Autonomy Level</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      level: "suggest" as const,
                      title: "Suggest",
                      description: "Agent proposes actions for your approval"
                    },
                    {
                      level: "confirm" as const,
                      title: "Confirm",
                      description: "Agent groups actions and asks for batch approval"
                    },
                    {
                      level: "autonomous" as const,
                      title: "Autonomous",
                      description: "Agent works independently (critical actions still require approval)"
                    }
                  ].map((option) => (
                    <div
                      key={option.level}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        autonomyLevel === option.level
                          ? "border-blue-500 bg-blue-600/10"
                          : "border-gray-600 bg-gray-800"
                      }`}
                      onClick={() => setAutonomyLevel(option.level)}
                    >
                      <h5 className="text-white font-medium mb-1">{option.title}</h5>
                      <p className="text-gray-400 text-xs">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h5 className="text-yellow-400 font-medium mb-1">Browser Extension Required</h5>
                    <p className="text-yellow-200 text-sm">
                      To enable these capabilities, you'll need to install the Replivo Helper browser extension.
                      The extension is code-signed and verified for security.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the terms and conditions and grant these permissions to {agent.name}
                </Label>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleGrantPermissions}
                  className="flex-1"
                  data-testid="button-grant-permissions"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Install Extension & Grant Access
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <BackgroundEffects />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Hire Your AI Agent
            </h1>
            <p className="text-xl text-gray-400">
              Step {step} of 2: Set up {agent.name} for your business
            </p>
          </motion.div>

          {renderStep()}
        </div>
      </main>

      <ExtensionSetup
        isOpen={showExtensionSetup}
        onClose={() => setShowExtensionSetup(false)}
        agentName={agent.name}
        requestedPermissions={requestedPermissions}
      />

      <Footer />
    </div>
  );
}