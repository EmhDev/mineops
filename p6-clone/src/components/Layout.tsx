import React from 'react';
import { Play, Save, Settings, FolderOpen } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { CalendarManager } from './CalendarManager';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loadMockData, calculateCPM, isCalculating } = useProjectStore();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-p6bg text-p6text font-sans">
      {/* Top Toolbar */}
      <header className="h-12 border-b border-p6border bg-p6panel flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-lg text-p6accent tracking-wider">MINESIGHT</div>
          <div className="h-6 w-px bg-p6border mx-2"></div>
          <button onClick={loadMockData} className="p-2 hover:bg-p6border rounded flex items-center space-x-1 transition-colors" title="Load Mock Project">
            <FolderOpen size={18} />
            <span className="text-sm">Load 10k Tasks</span>
          </button>
          <button onClick={calculateCPM} disabled={isCalculating} className="p-2 hover:bg-p6border rounded flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50" title="Calculate CPM">
            <Play size={18} />
            <span className="text-sm">{isCalculating ? 'Calculating...' : 'Run CPM'}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarManager />
          <button className="p-2 hover:bg-p6border rounded text-gray-300"><Save size={18} /></button>
          <button className="p-2 hover:bg-p6border rounded text-gray-300"><Settings size={18} /></button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
      
      {/* Status Bar */}
      <footer className="h-6 border-t border-p6border bg-p6panel flex items-center px-4 text-xs text-gray-400 shrink-0">
        Ready
      </footer>
    </div>
  );
};
