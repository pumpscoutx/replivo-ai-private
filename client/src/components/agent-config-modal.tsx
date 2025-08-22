import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Zap, CheckCircle2, AlertCircle, Bot } from "lucide-react";

interface AgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentType: string;
  agentName: string;
  userId: string;
}

export default function AgentConfigModal({ 
  isOpen, 
  onClose, 
  agentType, 
  agentName, 
  userId 
}: AgentConfigModalProps) {
  const [activeTab, setActiveTab] = useState("tasks");
  
  const { data: agentConfig, isLoading } = useQuery({
    queryKey: [`/api/agent-config/${userId}/${agentType}`],
    enabled: isOpen,
    select: (data: any) => data.config
  });

  const { data: detectedTools } = useQuery({
    queryKey: [`/api/device-tools/${userId}`],
    enabled: isOpen,
    select: (data: any) => data.tools || []
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/agent-config/${userId}/${agentType}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agent-config/${userId}/${agentType}`] });
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", `/api/agent-config/${userId}/${agentType}/toggle-task`, taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agent-config/${userId}/${agentType}`] });
    }
  });

  const handleTaskToggle = (task: any, fromLevel: string, toLevel: string) => {
    toggleTaskMutation.mutate({
      taskId: task.id,
      fromLevel,
      toLevel,
      enabled: toLevel !== 'disabled'
    });
  };

  const handleToolPermission = (toolName: string, allowed: boolean) => {
    const currentTools = agentConfig?.allowedTools || [];
    const updatedTools = allowed 
      ? [...currentTools, toolName]
      : currentTools.filter((t: string) => t !== toolName);
    
    updateConfigMutation.mutate({ allowedTools: updatedTools });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const TaskSection = ({ tasks, level, title, description, color }: any) => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Badge variant="outline" className={`${color} text-xs`}>
            {title}
          </Badge>
        </h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {tasks?.map((task: any) => (
          <Card key={task.id} className="border-l-4 border-l-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{task.name}</h4>
                    {task.enabled && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                    {task.tools?.map((tool: string) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={task.enabled}
                    onCheckedChange={(enabled) => 
                      handleTaskToggle(task, level, enabled ? level : 'disabled')
                    }
                  />
                  
                  <select
                    value={task.autonomyLevel}
                    onChange={(e) => handleTaskToggle(task, level, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                    disabled={!task.enabled}
                  >
                    <option value="autonomous">Autonomous</option>
                    <option value="confirm">Confirm</option>
                    <option value="suggest">Suggest</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Configure {agentName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks">Task Settings</TabsTrigger>
              <TabsTrigger value="tools">Tool Access</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="tasks" className="space-y-6">
                <TaskSection 
                  tasks={agentConfig?.autonomousTasks}
                  level="autonomous"
                  title="Autonomous Tasks"
                  description="Tasks the agent can perform without asking permission"
                  color="bg-green-100 text-green-800"
                />
                
                <TaskSection 
                  tasks={agentConfig?.confirmTasks}
                  level="confirm"
                  title="Confirm Tasks"
                  description="Tasks that require your approval before execution"
                  color="bg-yellow-100 text-yellow-800"
                />
                
                <TaskSection 
                  tasks={agentConfig?.suggestTasks}
                  level="suggest"
                  title="Suggest Tasks"
                  description="Tasks the agent can only suggest but not execute"
                  color="bg-blue-100 text-blue-800"
                />
              </TabsContent>

              <TabsContent value="tools" className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Tool Permissions</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control which tools and applications this agent can access on your device.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detectedTools?.map((tool: any) => (
                    <Card key={tool.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{tool.toolName}</h4>
                              {tool.installed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              {tool.isLoggedIn && <Badge variant="outline" className="text-xs">Logged In</Badge>}
                            </div>
                            <p className="text-sm text-gray-500 capitalize">{tool.category}</p>
                            <div className="mt-2">
                              {tool.permissions?.map((perm: string) => (
                                <Badge key={perm} variant="secondary" className="text-xs mr-1 mb-1">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Switch 
                            checked={agentConfig?.allowedTools?.includes(tool.toolName) || false}
                            onCheckedChange={(checked) => handleToolPermission(tool.toolName, checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Working Hours</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Enable working hours restriction</span>
                      <Switch 
                        checked={agentConfig?.workingHours?.enabled || false}
                        onCheckedChange={(enabled) => 
                          updateConfigMutation.mutate({ 
                            workingHours: { ...agentConfig?.workingHours, enabled } 
                          })
                        }
                      />
                    </div>
                    
                    {agentConfig?.workingHours?.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Start Time</label>
                          <input 
                            type="time" 
                            value={agentConfig?.workingHours?.start || '09:00'}
                            className="w-full mt-1 p-2 border rounded"
                            onChange={(e) => 
                              updateConfigMutation.mutate({
                                workingHours: { ...agentConfig?.workingHours, start: e.target.value }
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">End Time</label>
                          <input 
                            type="time" 
                            value={agentConfig?.workingHours?.end || '17:00'}
                            className="w-full mt-1 p-2 border rounded"
                            onChange={(e) => 
                              updateConfigMutation.mutate({
                                workingHours: { ...agentConfig?.workingHours, end: e.target.value }
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Task completion notifications</span>
                      <Switch 
                        checked={agentConfig?.notifications?.taskCompletion || false}
                        onCheckedChange={(taskCompletion) => 
                          updateConfigMutation.mutate({ 
                            notifications: { ...agentConfig?.notifications, taskCompletion } 
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Error alerts</span>
                      <Switch 
                        checked={agentConfig?.notifications?.errorAlerts || false}
                        onCheckedChange={(errorAlerts) => 
                          updateConfigMutation.mutate({ 
                            notifications: { ...agentConfig?.notifications, errorAlerts } 
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Daily summary</span>
                      <Switch 
                        checked={agentConfig?.notifications?.dailySummary || false}
                        onCheckedChange={(dailySummary) => 
                          updateConfigMutation.mutate({ 
                            notifications: { ...agentConfig?.notifications, dailySummary } 
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}