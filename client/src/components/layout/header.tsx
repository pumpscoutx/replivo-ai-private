import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <span className="text-2xl font-display font-black text-gray-900">Replivo</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`${location === "/" ? "text-purple-600 font-bold" : "text-gray-600 hover:text-purple-600"} transition-colors font-medium text-lg`}>
              Agents
            </Link>
            <Link href="/marketplace" className={`${location === "/marketplace" ? "text-purple-600 font-bold" : "text-gray-600 hover:text-purple-600"} transition-colors font-medium text-lg`}>
              Marketplace
            </Link>
            <Link href="/custom-agent" className={`${location === "/custom-agent" ? "text-purple-600 font-bold" : "text-gray-600 hover:text-purple-600"} transition-colors font-medium text-lg`}>
              Custom Builder
            </Link>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105">
              <i className="fas fa-rocket mr-2"></i>
              Get Started
            </Button>
          </div>

          <button className="md:hidden p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <i className="fas fa-bars text-gray-900 text-xl"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
