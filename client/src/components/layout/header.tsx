import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  return (
    <nav className="bg-black/95 backdrop-blur-md shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg border border-gray-600">
              <i className="fas fa-robot text-gray-300 text-lg"></i>
            </div>
            <span className="text-2xl font-neiko font-black text-white">REPLIVO</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`${location === "/" ? "text-white font-bold" : "text-gray-400 hover:text-white"} transition-colors font-medium text-lg font-neiko`}>
              AGENTS
            </Link>
            <Link href="/marketplace" className={`${location === "/marketplace" ? "text-white font-bold" : "text-gray-400 hover:text-white"} transition-colors font-medium text-lg font-neiko`}>
              MARKETPLACE
            </Link>
            <Link href="/custom-agent" className={`${location === "/custom-agent" ? "text-white font-bold" : "text-gray-400 hover:text-white"} transition-colors font-medium text-lg font-neiko`}>
              CUSTOM BUILDER
            </Link>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-neiko font-bold text-lg shadow-lg transition-all transform hover:scale-105 border border-gray-700">
              <i className="fas fa-rocket mr-2"></i>
              GET STARTED
            </Button>
          </div>

          <button className="md:hidden p-3 hover:bg-gray-800 rounded-xl transition-colors">
            <i className="fas fa-bars text-gray-300 text-xl"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
