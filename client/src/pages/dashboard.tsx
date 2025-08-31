import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Bell, 
  Settings, 
  Plus, 
  Filter, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MoreVertical,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  DollarSign,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Globe,
  Mail,
  MessageSquare,
  Star,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Download as DownloadIcon,
  Upload,
  CreditCard,
  Shield,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Mock data for demonstration
const MOCK_AGENTS = [
  {
    id: 1,
    name: 'Content Creator Pro',
    avatar: '✍️',
    status: 'working',
    currentTask: 'Writing blog post about AI trends',
    progress: 75,
    rating: 4.9,
    tasksCompleted: 47,
    hoursWorked: 23.5,
    productivity: 94,
    lastActive: '2 minutes ago',
    type: 'content'
  },
  {
    id: 2,
    name: 'SEO Optimizer',
    avatar: '📈',
    status: 'idle',
    currentTask: 'Waiting for assignment',
    progress: 0,
    rating: 4.8,
    tasksCompleted: 32,
    hoursWorked: 18.2,
    productivity: 89,
    lastActive: '15 minutes ago',
    type: 'seo'
  },
  {
    id: 3,
    name: 'Social Media Manager',
    avatar: '📱',
    status: 'available',
    currentTask: 'Creating Instagram posts',
    progress: 45,
    rating: 4.7,
    tasksCompleted: 28,
    hoursWorked: 21.8,
    productivity: 91,
    lastActive: '5 minutes ago',
    type: 'social'
  }
];

const MOCK_TASKS = [
  { id: 1, title: 'Write Q4 marketing strategy', status: 'in-progress', priority: 'high', agent: 'Content Creator Pro', dueDate: '2024-01-15', progress: 60 },
  { id: 2, title: 'Optimize homepage SEO', status: 'review', priority: 'medium', agent: 'SEO Optimizer', dueDate: '2024-01-12', progress: 90 },
  { id: 3, title: 'Create social media calendar', status: 'todo', priority: 'low', agent: 'Social Media Manager', dueDate: '2024-01-20', progress: 0 },
  { id: 4, title: 'Design email campaign', status: 'complete', priority: 'high', agent: 'Content Creator Pro', dueDate: '2024-01-10', progress: 100 }
];

const MOCK_ANALYTICS = {
  totalSavings: 15420,
  productivityIncrease: 67,
  contentQuality: 94,
  responseTime: 1.2,
  monthlyUsage: 89,
  topPerformingAgent: 'Content Creator Pro',
  recentTrends: [
    { date: '2024-01-01', productivity: 85, tasks: 12 },
    { date: '2024-01-02', productivity: 92, tasks: 15 },
    { date: '2024-01-03', productivity: 88, tasks: 11 },
    { date: '2024-01-04', productivity: 95, tasks: 18 },
    { date: '2024-01-05', productivity: 91, tasks: 14 }
  ]
};

const MOCK_BILLING = {
  currentPlan: 'Pro',
  monthlyCost: 299,
  usage: 89,
  credits: 1120,
  nextBilling: '2024-02-01',
  invoices: [
    { id: 'INV-001', date: '2024-01-01', amount: 299, status: 'paid' },
    { id: 'INV-002', date: '2023-12-01', amount: 299, status: 'paid' }
  ]
};

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedWidgets, setExpandedWidgets] = useState(new Set(['overview', 'agents']));

  useEffect(() => {
    // Initialize dashboard
    document.title = 'Dashboard - AI Agent Management';
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'idle': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'available': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const toggleWidget = (widgetId: string) => {
    const newExpanded = new Set(expandedWidgets);
    if (newExpanded.has(widgetId)) {
      newExpanded.delete(widgetId);
    } else {
      newExpanded.add(widgetId);
    }
    setExpandedWidgets(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-navy-900 to-black text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Breadcrumbs */}
            <div className="flex items-center gap-6">
              <motion.div 
                className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                REPLIVO AI
              </motion.div>
              <nav className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white capitalize">{activeTab}</span>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search agents, tasks, content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {darkMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </motion.button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Notifications</h3>
                        <button className="text-sm text-cyan-400 hover:text-cyan-300">Mark all read</button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Task completed</p>
                            <p className="text-xs text-gray-400">Content Creator Pro finished "Q4 Marketing Strategy"</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">New content ready</p>
                            <p className="text-xs text-gray-400">3 new blog posts are ready for review</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar */}
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-white font-semibold">JD</span>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-1">
          {['overview', 'agents', 'tasks', 'analytics', 'billing'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Overview Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Savings', value: `$${MOCK_ANALYTICS.totalSavings.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', change: '+12%', trend: 'up' },
                  { label: 'Productivity', value: `${MOCK_ANALYTICS.productivityIncrease}%`, icon: TrendingUp, color: 'from-blue-500 to-cyan-600', change: '+8%', trend: 'up' },
                  { label: 'Active Agents', value: MOCK_AGENTS.filter(a => a.status === 'working').length, icon: Users, color: 'from-purple-500 to-pink-600', change: '+2', trend: 'up' },
                  { label: 'Tasks Completed', value: MOCK_TASKS.filter(t => t.status === 'complete').length, icon: CheckCircle, color: 'from-orange-500 to-red-600', change: '+15', trend: 'up' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Agent Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Agent Status Cards */}
                <motion.div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Agent Status</h3>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">View All</button>
                  </div>
                  <div className="space-y-4">
                    {MOCK_AGENTS.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                          {agent.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{agent.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(agent.status)}`}>
                              {agent.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{agent.currentTask}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{agent.productivity}%</div>
                          <div className="text-xs text-gray-400">Productivity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Recent Activity</h3>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">View All</button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { action: 'Task completed', details: 'Q4 Marketing Strategy', time: '2 minutes ago', icon: CheckCircle, color: 'text-green-400' },
                      { action: 'Content created', details: 'Blog post about AI trends', time: '15 minutes ago', icon: FileText, color: 'text-blue-400' },
                      { action: 'SEO optimization', details: 'Homepage keywords updated', time: '1 hour ago', icon: TrendingUp, color: 'text-purple-400' },
                      { action: 'Social media post', details: 'Instagram content scheduled', time: '2 hours ago', icon: Image, color: 'text-pink-400' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className={`w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ${activity.color}`}>
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-400">{activity.details}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Assign Task', icon: Plus, color: 'from-cyan-500 to-blue-600' },
                    { label: 'Create Content', icon: FileText, color: 'from-purple-500 to-pink-600' },
                    { label: 'View Analytics', icon: BarChart3, color: 'from-green-500 to-emerald-600' },
                    { label: 'Manage Billing', icon: CreditCard, color: 'from-orange-500 to-red-600' }
                  ].map((action, index) => (
                    <motion.button
                      key={action.label}
                      className="p-4 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300 text-center"
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-sm font-medium">{action.label}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Agent Management Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Agent Management</h2>
                  <p className="text-gray-400">Monitor and manage your AI workforce</p>
                </div>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Hire New Agent
                </motion.button>
              </div>

              {/* Agent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_AGENTS.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    {/* Agent Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl">
                        {agent.avatar}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Agent Info */}
                    <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{agent.currentTask}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{agent.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-lg font-bold text-white">{agent.tasksCompleted}</div>
                        <div className="text-xs text-gray-400">Tasks</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-lg font-bold text-white">{agent.hoursWorked}</div>
                        <div className="text-xs text-gray-400">Hours</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
                        Assign Task
                      </button>
                      <button className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all duration-300">
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Task Management Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Task Management</h2>
                  <p className="text-gray-400">Organize and track your content workflow</p>
                </div>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Create Task
                </motion.button>
              </div>

              {/* Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['todo', 'in-progress', 'review', 'complete'].map((status, columnIndex) => (
                  <div key={status} className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold capitalize">{status.replace('-', ' ')}</h3>
                      <span className="text-sm text-gray-400">
                        {MOCK_TASKS.filter(task => task.status === status).length}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {MOCK_TASKS.filter(task => task.status === status).map((task, taskIndex) => (
                        <motion.div
                          key={task.id}
                          className="p-4 bg-white/5 rounded-xl border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: columnIndex * 0.1 + taskIndex * 0.05 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <div className="text-xs text-gray-400">{task.progress}%</div>
                          </div>
                          
                          <h4 className="font-medium mb-2">{task.title}</h4>
                          <p className="text-sm text-gray-400 mb-3">Assigned to {task.agent}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Due: {task.dueDate}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>2 days</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Analytics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
                  <p className="text-gray-400">Track performance and ROI metrics</p>
                </div>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last year</option>
                  </select>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'ROI', value: `${MOCK_ANALYTICS.productivityIncrease}%`, description: 'Return on investment', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
                  { label: 'Content Quality', value: `${MOCK_ANALYTICS.contentQuality}%`, description: 'Average quality score', icon: Star, color: 'from-blue-500 to-cyan-600' },
                  { label: 'Response Time', value: `${MOCK_ANALYTICS.responseTime}s`, description: 'Average response time', icon: Zap, color: 'from-purple-500 to-pink-600' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <metric.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                    <div className="text-lg font-medium text-white mb-1">{metric.label}</div>
                    <div className="text-gray-400">{metric.description}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Productivity Trends */}
                <motion.div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-6">Productivity Trends</h3>
                  <div className="space-y-4">
                    {MOCK_ANALYTICS.recentTrends.map((trend, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-sm text-gray-400">{trend.date}</div>
                        <div className="flex-1">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${trend.productivity}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm font-medium">{trend.productivity}%</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Performance Breakdown */}
                <motion.div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold mb-6">Performance Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Content Creation', value: 45, color: 'from-blue-500 to-cyan-600' },
                      { label: 'SEO Optimization', value: 30, color: 'from-green-500 to-emerald-600' },
                      { label: 'Social Media', value: 25, color: 'from-purple-500 to-pink-600' }
                    ].map((item, index) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.label}</span>
                            <span className="text-sm text-gray-400">{item.value}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Billing Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Billing & Usage</h2>
                  <p className="text-gray-400">Manage your subscription and monitor usage</p>
                </div>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CreditCard className="w-5 h-5" />
                  Upgrade Plan
                </motion.button>
              </div>

              {/* Current Plan & Usage */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Plan */}
                <motion.div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-xl font-bold mb-4">Current Plan</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{MOCK_BILLING.currentPlan}</div>
                    <div className="text-2xl font-bold text-cyan-400 mb-2">${MOCK_BILLING.monthlyCost}/month</div>
                    <div className="text-gray-400 mb-4">Billed monthly</div>
                    <button className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                      Change Plan
                    </button>
                  </div>
                </motion.div>

                {/* Usage Meter */}
                <motion.div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold mb-4">Usage This Month</h3>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-white mb-2">{MOCK_BILLING.usage}%</div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${MOCK_BILLING.usage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="text-sm text-gray-400">
                      {MOCK_BILLING.credits} credits remaining
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Next billing date</div>
                    <div className="text-lg font-medium">{MOCK_BILLING.nextBilling}</div>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Invoice
                    </button>
                    <button className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Methods
                    </button>
                    <button className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Get Support
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Invoice History */}
              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-bold mb-6">Invoice History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_BILLING.invoices.map((invoice, index) => (
                        <motion.tr
                          key={invoice.id}
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <td className="py-3 px-4 font-medium">{invoice.id}</td>
                          <td className="py-3 px-4 text-gray-400">{invoice.date}</td>
                          <td className="py-3 px-4">${invoice.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              invoice.status === 'paid' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                              Download
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;