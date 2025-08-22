import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Activity, Chrome, Clock, CheckCircle, AlertCircle, Zap, Play, Pause,
  MessageCircle, Send, Settings, Users, History, Bell, TrendingUp,
  Mail, Calendar, DollarSign, Shield, Eye, CheckSquare, X, ChevronRight
} from "lucide-react";

interface Message {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'action' | 'approval';
  needsApproval?: boolean;
  approved?: boolean;
}

interface ActivityItem {
  id: string;
  agentName: string;
  action: string;
  timestamp: Date;
  type: 'success' | 'info' | 'warning' | 'approval';
  needsApproval?: boolean;
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      agentId: 'business-growth',
      agentName: 'Business Growth Agent',
      content: "I've just identified 23 new leads from LinkedIn. Ready to send intro emails - approve?",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: 'approval',
      needsApproval: true
    },
    {
      id: '2',
      agentId: 'operations',
      agentName: 'Operations Agent',
      content: "I scheduled your client meeting for tomorrow at 2PM and sent calendar invites.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'message'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      agentName: 'Customer Support Agent',
      action: 'Replied to 3 customer tickets with average 2min response time',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      type: 'success'
    },
    {
      id: '2',
      agentName: 'Marketing Agent',
      action: 'Wants to spend $100 on Facebook ads for lead campaign',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: 'approval',
      needsApproval: true
    },
    {
      id: '3',
      agentName: 'Operations Agent',
      action: 'Updated CRM with 15 new contact records',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      type: 'success'
    }
  ]);
  const [pendingApprovals, setPendingApprovals] = useState(2);
  const [connectedAgents] = useState([
    { id: 'business-growth', name: 'Business Growth', status: 'active', tasksToday: 8 },
    { id: 'operations', name: 'Operations', status: 'active', tasksToday: 12 },
    { id: 'customer-support', name: 'Customer Support', status: 'active', tasksToday: 15 }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: extensionStatus } = useQuery({
    queryKey: ["/api/extension/status", "demo-user"],
    refetchInterval: 5000,
    select: (data: any) => ({
      paired: data.hasPairedExtension,
      online: data.extensions?.[0]?.isOnline || false
    })
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!extensionStatus?.paired) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/extension-ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Dashboard WebSocket connected');
        setWsConnected(true);
        
        // Send authentication
        ws.send(JSON.stringify({
          type: 'dashboard_connect',
          userId: 'demo-user'
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Dashboard WebSocket disconnected');
        setWsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (extensionStatus?.paired) {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('Dashboard WebSocket error:', error);
        setWsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [extensionStatus?.paired]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'agent_message':
        // Add new agent message to chat
        const newMessage: Message = {
          id: Date.now().toString(),
          agentId: data.agentId || 'unknown',
          agentName: data.agentName || 'Agent',
          content: data.message,
          timestamp: new Date(),
          type: data.needsApproval ? 'approval' : 'message',
          needsApproval: data.needsApproval
        };
        setMessages(prev => [...prev, newMessage]);
        
        if (data.needsApproval) {
          setPendingApprovals(prev => prev + 1);
        }
        break;
        
      case 'agent_activity':
        // Add new activity to feed
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          agentName: data.agentName || 'Agent',
          action: data.action,
          timestamp: new Date(),
          type: data.needsApproval ? 'approval' : 'success',
          needsApproval: data.needsApproval
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        break;
        
      case 'task_completed':
        // Show task completion in activity feed
        const taskActivity: ActivityItem = {
          id: Date.now().toString(),
          agentName: data.agentName || 'Agent',
          action: `Completed: ${data.taskDescription}`,
          timestamp: new Date(),
          type: 'success'
        };
        setActivities(prev => [taskActivity, ...prev.slice(0, 9)]);
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate real-time agent activity for demo purposes
  useEffect(() => {
    if (!wsConnected) return;
    
    const interval = setInterval(() => {
      // Simulate random agent activity
      const agents = ['Customer Support', 'Operations', 'Marketing', 'Business Growth'];
      const actions = [
        'Processed customer inquiry',
        'Updated CRM records',
        'Scheduled social media post',
        'Identified new business opportunity',
        'Completed data analysis',
        'Sent follow-up email'
      ];
      
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      // Occasionally require approval
      const needsApproval = Math.random() < 0.3;
      
      const activity: ActivityItem = {
        id: Date.now().toString(),
        agentName: randomAgent + ' Agent',
        action: needsApproval ? `Wants to ${randomAction.toLowerCase()} - requires approval` : randomAction,
        timestamp: new Date(),
        type: needsApproval ? 'approval' : 'success',
        needsApproval
      };
      
      setActivities(prev => [activity, ...prev.slice(0, 9)]);
      
      if (needsApproval) {
        setPendingApprovals(prev => prev + 1);
      }
    }, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, [wsConnected]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      agentId: 'user',
      agentName: 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'message'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate agent response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        agentId: 'business-growth',
        agentName: 'Business Growth Agent',
        content: "Got it! I'll work on that right away and update you with progress.",
        timestamp: new Date(),
        type: 'message'
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const handleApproval = (messageId: string, approved: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, approved, needsApproval: false } : msg
    ));
    if (approved) {
      setPendingApprovals(prev => Math.max(0, prev - 1));
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'agents', label: 'My Agents', icon: Users },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, badge: pendingApprovals },
    { id: 'history', label: 'Task History', icon: History },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'agents':
        return renderAgents();
      case 'approvals':
        return renderApprovals();
      case 'history':
        return renderHistory();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Live Activity Feed */}
      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Agent Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'approval' ? 'bg-yellow-500' :
                      activity.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{activity.agentName}</p>
                          <p className="text-gray-300 text-sm">{activity.action}</p>
                          <p className="text-gray-400 text-xs mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                        {activity.needsApproval && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-green-600 border-green-600 hover:bg-green-700">
                              ✓
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-red-600 border-red-600 hover:bg-red-700">
                              ✗
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Agent Status Cards */}
        <div className="grid grid-cols-1 gap-4">
          {connectedAgents.map((agent) => (
            <Card key={agent.id} className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium text-sm">{agent.name}</p>
                      <p className="text-gray-400 text-xs">{agent.tasksToday} tasks today</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-400 text-xs font-medium">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Agent Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.agentId === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.agentId === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.type === 'approval'
                        ? 'bg-yellow-600/20 border border-yellow-600/50 text-yellow-100'
                        : 'bg-gray-800 text-gray-200'
                  } rounded-lg p-3`}>
                    {message.agentId !== 'user' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="bg-green-600 text-white text-xs">
                            {message.agentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{message.agentName}</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">{formatTimeAgo(message.timestamp)}</p>
                    
                    {message.needsApproval && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(message.id, true)}
                          className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproval(message.id, false)}
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-7 px-3 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Chat with your agents..."
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button onClick={sendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Agents</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Hire New Agent
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectedAgents.map((agent) => (
          <Card key={agent.id} className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                    <p className="text-gray-400 text-sm">Active since today</p>
                  </div>
                </div>
                <Badge className="bg-green-600">
                  <div className="w-2 h-2 rounded-full bg-white mr-1" />
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Tasks Today</p>
                  <p className="text-white text-xl font-bold">{agent.tasksToday}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-white text-xl font-bold">94%</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-gray-600">
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-gray-600">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
        <Badge className="bg-yellow-600 text-white px-3 py-1">
          {pendingApprovals} pending
        </Badge>
      </div>
      
      <div className="space-y-4">
        {[
          {
            id: '1',
            agent: 'Marketing Agent',
            action: 'Facebook Ad Campaign',
            description: 'Create and launch a $100 Facebook ad campaign targeting business owners in tech industry',
            impact: 'Medium',
            cost: '$100',
            timeRequested: new Date(Date.now() - 5 * 60 * 1000)
          },
          {
            id: '2',
            agent: 'Business Growth Agent',
            action: 'Email Outreach',
            description: 'Send introductory emails to 23 qualified leads from LinkedIn research',
            impact: 'Low',
            cost: 'Free',
            timeRequested: new Date(Date.now() - 12 * 60 * 1000)
          }
        ].map((approval) => (
          <Card key={approval.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {approval.agent.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-semibold">{approval.action}</h3>
                      <p className="text-gray-400 text-sm">{approval.agent} • {formatTimeAgo(approval.timeRequested)}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{approval.description}</p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{approval.cost}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${
                        approval.impact === 'High' ? 'text-red-400' :
                        approval.impact === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {approval.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => setPendingApprovals(prev => Math.max(0, prev - 1))}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setPendingApprovals(prev => Math.max(0, prev - 1))}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Deny
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Task History</h2>
      
      <div className="space-y-4">
        {[
          {
            id: '1',
            agent: 'Customer Support',
            task: 'Responded to customer ticket #CS-442',
            result: 'Customer satisfied, issue resolved',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            status: 'success'
          },
          {
            id: '2',
            agent: 'Operations',
            task: 'Updated CRM with 15 new contacts',
            result: 'All contacts verified and categorized',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            status: 'success'
          },
          {
            id: '3',
            agent: 'Marketing',
            task: 'Social media post scheduled',
            result: 'LinkedIn post scheduled for 9 AM tomorrow',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            status: 'success'
          },
          {
            id: '4',
            agent: 'Business Growth',
            task: 'Lead qualification failed',
            result: 'Contact not responsive after 3 attempts',
            timestamp: new Date(Date.now() - 90 * 60 * 1000),
            status: 'warning'
          }
        ].map((task) => (
          <Card key={task.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  task.status === 'success' ? 'bg-green-500' :
                  task.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{task.task}</h3>
                    <span className="text-gray-400 text-sm">{formatTimeAgo(task.timestamp)}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{task.agent} Agent</p>
                  <p className="text-gray-300 text-sm">{task.result}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Agent Performance Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connectedAgents.map((agent) => (
          <Card key={agent.id} className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {agent.name} Weekly Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Tasks Completed</p>
                  <p className="text-white text-2xl font-bold">{agent.tasksToday * 7}</p>
                  <p className="text-green-400 text-xs">+12% vs last week</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-white text-2xl font-bold">94%</p>
                  <p className="text-green-400 text-xs">+2% vs last week</p>
                </div>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Monday</span>
                  <span className="text-white text-sm">{Math.floor(agent.tasksToday * 0.8)} tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Tuesday</span>
                  <span className="text-white text-sm">{Math.floor(agent.tasksToday * 1.2)} tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Today</span>
                  <span className="text-blue-400 text-sm">{agent.tasksToday} tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-approve low-risk tasks</p>
                <p className="text-gray-400 text-sm">Tasks under $10 automatically approved</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Require approval for emails</p>
                <p className="text-gray-400 text-sm">Review all outgoing communications</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Real-time activity alerts</p>
                <p className="text-gray-400 text-sm">Get notified of agent actions</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Daily summary email</p>
                <p className="text-gray-400 text-sm">Receive daily performance reports</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      
      {/* Top metrics bar */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{connectedAgents.length}</p>
                <p className="text-gray-400 text-sm">Active Agents</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{pendingApprovals}</p>
                <p className="text-gray-400 text-sm">Pending Approvals</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{connectedAgents.reduce((sum, agent) => sum + agent.tasksToday, 0)}</p>
                <p className="text-gray-400 text-sm">Tasks Today</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                extensionStatus?.paired && extensionStatus?.online && wsConnected
                  ? 'bg-green-600/20'
                  : 'bg-red-600/20'
              }`}>
                <Chrome className={`w-5 h-5 ${
                  extensionStatus?.paired && extensionStatus?.online && wsConnected
                    ? 'text-green-400'
                    : 'text-red-400'
                }`} />
              </div>
              <div>
                <p className={`font-semibold ${
                  extensionStatus?.paired && extensionStatus?.online && wsConnected
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {extensionStatus?.paired && extensionStatus?.online && wsConnected ? 'Live' : 'Offline'}
                </p>
                <p className="text-gray-400 text-sm">
                  {wsConnected ? 'Real-time Connected' : 'Extension'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main dashboard */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge className="bg-red-600 text-white px-2 py-1 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeView}
          >
            {renderMainContent()}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}