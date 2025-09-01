import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
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
                <span className="text-white capitalize">{activeTab}</span>
              </nav>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <Button
                onClick={() => setLocation('/')}
                  variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back to Home
              </Button>
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

        {/* Content Area */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to Your Dashboard!</h2>
          <p className="text-gray-300 mb-6">
            You're currently viewing the <strong>{activeTab}</strong> section.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-2">Quick Stats</h3>
              <p className="text-gray-400">Dashboard is working!</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-2">Agent Status</h3>
              <p className="text-gray-400">All systems operational</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-2">Recent Activity</h3>
              <p className="text-gray-400">No recent activity</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;