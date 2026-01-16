import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy } from 'lucide-react';
const navItems = [{
  name: 'Home',
  path: '/'
}, {
  name: 'Team Sports',
  path: '/team-sports'
}, {
  name: 'Individual Sports',
  path: '/individual-sports'
}, {
  name: 'Minor Sports',
  path: '/minor-sports'
}, {
  name: 'Schedule',
  path: '/schedule'
}];
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  return <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="font-display text-xl tracking-wider text-primary">
              SPANDAN '26
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => <Link key={item.path} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
                {item.name}
              </Link>)}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map(item => <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                  {item.name}
                </Link>)}
            </div>
          </div>}
      </div>
    </nav>;
}