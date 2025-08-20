import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-dark">Replivo</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`${location === "/" ? "text-primary" : "text-secondary"} hover:text-primary transition-colors font-medium`}>
              Agents
            </Link>
            <Link href="/marketplace" className={`${location === "/marketplace" ? "text-primary" : "text-secondary"} hover:text-primary transition-colors`}>
              Marketplace
            </Link>
            <Link href="/custom-agent" className={`${location === "/custom-agent" ? "text-primary" : "text-secondary"} hover:text-primary transition-colors`}>
              Custom Builder
            </Link>
            <Button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Get Started
            </Button>
          </div>

          <button className="md:hidden p-2">
            <i className="fas fa-bars text-dark"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
