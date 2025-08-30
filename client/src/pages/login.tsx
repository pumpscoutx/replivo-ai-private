import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackgroundEffects from "@/components/background-effects";
import CursorEffects from "@/components/cursor-effects";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const response = await apiRequest("POST", endpoint, formData);

      if (response.success) {
        // Store session token
        localStorage.setItem("sessionToken", response.sessionToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        toast({
          title: isRegistering ? "Account created!" : "Welcome back!",
          description: isRegistering 
            ? "Your account has been created successfully." 
            : "You have been logged in successfully.",
        });

        // Redirect to dashboard
        setLocation("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Google OAuth (in production, this would use Google OAuth)
      const mockGoogleUser = {
        googleId: `google_${Date.now()}`,
        email: "user@example.com",
        name: "Demo User",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      };

      const response = await apiRequest("POST", "/api/auth/google", mockGoogleUser);

      if (response.success) {
        localStorage.setItem("sessionToken", response.sessionToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        toast({
          title: "Welcome!",
          description: "You have been logged in with Google.",
        });

        setLocation("/dashboard");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      toast({
        title: "Google authentication failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <BackgroundEffects />
      <CursorEffects />
      <Header />
      
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gray-900/80 backdrop-blur-md border-gray-700 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-neiko font-black text-white">
                {isRegistering ? "CREATE ACCOUNT" : "WELCOME BACK"}
              </CardTitle>
              <p className="text-gray-400 mt-2">
                {isRegistering 
                  ? "Join thousands of businesses using AI agents" 
                  : "Sign in to your Replivo account"
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required={isRegistering}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-neiko font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isRegistering ? "Creating Account..." : "Signing In..."}
                    </div>
                  ) : (
                    isRegistering ? "CREATE ACCOUNT" : "SIGN IN"
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <Button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-neiko font-bold py-3 rounded-lg transition-all"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
              
              <div className="text-center">
                <p className="text-gray-400">
                  {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                  >
                    {isRegistering ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
} 