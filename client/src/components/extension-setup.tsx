import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, Chrome, Shield, Zap, Check, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtensionSetupProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  requestedPermissions: Permission[];
}

interface Permission {
  scope: string;
  domain?: string;
  description: string;
  example: string;
}

export default function ExtensionSetup({ isOpen, onClose, agentName, requestedPermissions }: ExtensionSetupProps) {
  const [step, setStep] = useState(1);
  const [pairingCode, setPairingCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<'not-installed' | 'installing' | 'paired' | 'error'>('not-installed');
  const { toast } = useToast();

  const generatePairingCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/extension/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user' }) // In production, get from auth
      });
      
      const data = await response.json();
      setPairingCode(data.pairingCode);
      setStep(3);
    } catch (error) {
      toast({
        title: "Failed to generate pairing code",
        description: "Please try again.",
        variant: "destructive"
      });
    }
    setIsGeneratingCode(false);
  };

  const copyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode);
    toast({
      title: "Pairing code copied!",
      description: "Paste it in the Replivo Helper extension.",
    });
  };

  const checkExtensionStatus = async () => {
    try {
      const response = await fetch('/api/extension/status/demo-user');
      const data = await response.json();
      
      if (data.hasPairedExtension) {
        setExtensionStatus('paired');
        setStep(5);
      }
    } catch (error) {
      console.error('Failed to check extension status:', error);
    }
  };

  useEffect(() => {
    if (step === 4 || step === 3) {
      const interval = setInterval(checkExtensionStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {agentName} requires browser access
              </h3>
              <p className="text-gray-400">
                To work effectively, this agent needs permission to interact with web pages on your behalf.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Requested permissions:</h4>
              {requestedPermissions.map((permission, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                      {permission.scope}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-white text-sm mb-1">{permission.description}</p>
                      <p className="text-gray-500 text-xs">Example: "{permission.example}"</p>
                      {permission.domain && (
                        <p className="text-gray-400 text-xs mt-1">Domain: {permission.domain}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Accept & Install Helper
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <Chrome className="w-16 h-16 mx-auto text-blue-500" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Install Replivo Helper</h3>
              <p className="text-gray-400">
                Download the secure browser extension to enable agent automation.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-white font-medium">Secure & Privacy-First</span>
              </div>
              <ul className="text-left text-gray-400 text-sm space-y-1">
                <li>• Code-signed and verified extension</li>
                <li>• All commands are cryptographically signed</li>
                <li>• You control all permissions and can revoke anytime</li>
                <li>• Complete audit trail of all actions</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={generatePairingCode} disabled={isGeneratingCode}>
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingCode ? 'Preparing...' : 'Download Extension'}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <Zap className="w-16 h-16 mx-auto text-yellow-500" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Pair Your Extension</h3>
              <p className="text-gray-400">
                Enter this code in the Replivo Helper extension to connect it to your account.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-center mb-4">
                <span className="text-gray-400 text-sm">Pairing Code</span>
                <div className="text-4xl font-mono font-bold text-white tracking-widest mt-2">
                  {pairingCode}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={copyPairingCode} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>

            <div className="text-left text-gray-400 text-sm space-y-2">
              <p>1. Click the Replivo Helper extension icon in your browser toolbar</p>
              <p>2. Click "Pair with Account"</p>
              <p>3. Enter the pairing code above</p>
              <p>4. Grant permissions for the requested domains</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Waiting for extension pairing...</span>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Check className="w-16 h-16 mx-auto text-green-500" />
            </motion.div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Successfully Connected!</h3>
              <p className="text-gray-400">
                {agentName} is now ready to work on your behalf. All actions will be logged and can be reviewed in your dashboard.
              </p>
            </div>

            <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
              <div className="flex items-center gap-3 justify-center text-green-400">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Secure Connection Established</span>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">
              Start Using {agentName}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Browser Helper Setup</DialogTitle>
          <DialogDescription className="text-gray-400">
            Step {step} of 4
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}