import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Chrome, Mail, Shield, User } from "lucide-react";
import BackgroundEffects from "@/components/background-effects";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Redirect to Google OAuth
    window.location.href = "/api/auth/google";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create or login user
      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      <BackgroundEffects />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <nav className="flex justify-between items-center p-6">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg border border-gray-600">
              <i className="fas fa-robot text-gray-300 text-lg"></i>
            </div>
            <span className="text-2xl font-neiko font-black text-white">REPLIVO</span>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              ← Back to Home
            </Button>
          </Link>
        </nav>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Welcome to Replivo
            </CardTitle>
            <p className="text-gray-400">
              Sign in to access your AI agent marketplace
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 py-3 font-medium"
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            <div className="relative">
              <Separator className="bg-gray-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-gray-900 px-3 text-gray-400 text-sm">or</span>
              </div>
            </div>

            {/* Email Sign In */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  data-testid="input-email"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium"
                data-testid="button-email-login"
              >
                <Mail className="w-5 h-5 mr-3" />
                {isLoading ? "Signing in..." : "Continue with Email"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <motion.div
          className="mt-8 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 border border-gray-700">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <h3 className="text-white font-semibold text-sm">Smart Agents</h3>
            <p className="text-gray-400 text-xs">AI that actually works</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 border border-gray-700">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-2">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">Secure Control</h3>
            <p className="text-gray-400 text-xs">Your data stays safe</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
