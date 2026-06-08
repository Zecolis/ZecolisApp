
import React from 'react';
import { View } from '../types';
import { Home, Search, MessageSquare, User, Plus } from 'lucide-react';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
  unreadCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, unreadCount = 0 }) => {
  const NavItem = ({ view, label, Icon, badge }: { view: View; label: string; Icon: React.ElementType; badge?: number }) => (
    <button
      onClick={() => setView(view)}
      className={`flex flex-col items-center gap-1 transition-colors relative ${currentView === view ? 'text-[#1D1D4B]' : 'text-gray-400'
        }`}
    >
      <div className="relative">
        <Icon size={22} strokeWidth={currentView === view ? 2.5 : 2} />
        {badge && badge > 0 ? (
          <div className="absolute -top-1.5 -right-1.5 bg-[#FF5722] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {badge > 9 ? '9+' : badge}
          </div>
        ) : null}
      </div>
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-6 pt-2 pb-3 flex items-center justify-between z-50 shadow-[0_-8px_25px_rgba(0,0,0,0.05)]">
      <NavItem view={View.HOME} label="Accueil" Icon={Home} />
      <NavItem view={View.SEARCH} label="Recherche" Icon={Search} />

      {/* Central Floating Action Button */}
      <div className="relative -top-5">
        <button
          onClick={() => setView(View.PUBLISH)}
          className="w-14 h-14 bg-[#FF5722] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-95 transition-transform"
        >
          <Plus size={30} />
        </button>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-400 tracking-tight whitespace-nowrap">Publier</span>
      </div>

      <NavItem view={View.MESSAGES} label="Messages" Icon={MessageSquare} badge={unreadCount} />
      <NavItem view={View.PROFILE} label="Profil" Icon={User} />
    </div>
  );
};

export default BottomNav;
