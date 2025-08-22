import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Activity, Chrome, Clock, CheckCircle, AlertCircle, Zap, Play, Pause } from "lucide-react";

export default function Dashboard() {
  const [activeAgents, setActiveAgents] = useState([
    {
      id: "1",
      name: "Business Growth",
      status: "working",
      currentTask: "Generating leads for Q4 campaign",
      progress: 75,
      tasksCompleted: 12,
      timeActive: "2h 15m"
    },
    {
      id: "2", 
      name: "Content Creator",
      status: "working",
      currentTask: "Writing blog post about AI trends",
      progress: 45,
      tasksCompleted: 8,
      timeActive: "1h 32m"
    }
  ]);

  const { data: extensionStatus } = useQuery({
    queryKey: ["/api/extension/status", "demo-user"],
    refetchInterval: 5000,
    select: (data: any) => ({
      paired: data.hasPairedExtension,
      online: data.extensions?.[0]?.isOnline || false
    })
  });

  const generateTaskMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const response = await apiRequest("POST", "/api/agents/hire", {
        agentType: "business-growth",
        subAgent: "Business Growth", 
        task: "Continue working on assigned tasks",
        context: "Dashboard task execution",
        userId: "demo-user"
      });
      return await response.json();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working": return "text-green-500";
      case "paused": return "text-yellow-500";
      case "completed": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working": return <Activity className="w-4 h-4" />;
      case "paused": return <Pause className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Agent Dashboard</h1>
          <p className="text-gray-400">Monitor and manage your AI agents</p>
        </motion.div>

        {/* Extension Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Chrome className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Browser Extension</h3>
                    <p className="text-gray-400 text-sm">
                      {extensionStatus?.paired && extensionStatus?.online 
                        ? "Connected and ready for automation"
                        : extensionStatus?.paired 
                          ? "Paired but offline"
                          : "Not connected"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    extensionStatus?.paired && extensionStatus?.online 
                      ? 'bg-green-500' 
                      : extensionStatus?.paired 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    extensionStatus?.paired && extensionStatus?.online 
                      ? 'text-green-400' 
                      : 'text-gray-400'
                  }`}>
                    {extensionStatus?.paired && extensionStatus?.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {activeAgents.map((agent) => (
            <Card key={agent.id} className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(agent.status)} bg-gray-800`}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(agent.status)}
                      {agent.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2">Current Task:</p>
                  <p className="text-gray-400 text-xs">{agent.currentTask}</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{agent.progress}%</span>
                  </div>
                  <Progress value={agent.progress} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-400">Tasks: </span>
                    <span className="text-white">{agent.tasksCompleted}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Active: </span>
                    <span className="text-white">{agent.timeActive}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => generateTaskMutation.mutate(agent.id)}
                  disabled={generateTaskMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Zap className="w-3 h-3 mr-2" />
                  {generateTaskMutation.isPending ? 'Executing...' : 'Give New Task'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "2 min ago", action: "Content Creator completed blog post draft", type: "success" },
                  { time: "5 min ago", action: "Business Growth started lead generation task", type: "info" },
                  { time: "12 min ago", action: "SEO Specialist optimized 3 pages", type: "success" },
                  { time: "18 min ago", action: "Data Analyst generated weekly report", type: "success" },
                  { time: "25 min ago", action: "Extension connected successfully", type: "info" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}