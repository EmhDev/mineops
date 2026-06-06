import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Calendar as CalendarIcon, X } from 'lucide-react';

export const CalendarManager: React.FC = () => {
  const { calendars } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-2 rounded flex items-center space-x-1 transition-colors ${isOpen ? 'bg-p6border text-white' : 'hover:bg-p6border text-gray-300'}`} 
        title="Manage Calendars"
      >
        <CalendarIcon size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-zinc-800 border border-p6border shadow-xl rounded-md z-50 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-p6border bg-zinc-900 rounded-t-md">
            <h3 className="font-semibold text-sm">Project Calendars</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-400"><X size={16}/></button>
          </div>
          <div className="p-3 max-h-96 overflow-y-auto">
            {calendars.map(cal => (
              <div key={cal.id} className="mb-2 bg-zinc-900 p-3 rounded border border-p6border">
                <div className="font-semibold text-sm text-p6accent mb-2">{cal.name}</div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['M','T','W','T','F','S','S'].map((day, i) => (
                    <div key={i} className={`py-1 rounded font-bold ${cal.work_days[i] ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
