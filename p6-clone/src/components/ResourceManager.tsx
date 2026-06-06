import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Users, X } from 'lucide-react';

export const ResourceManager: React.FC = () => {
  const { resources } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-2 rounded flex items-center space-x-1 transition-colors ${isOpen ? 'bg-p6border text-white' : 'hover:bg-p6border text-gray-300'}`} 
        title="Resource Dictionary"
      >
        <Users size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-zinc-800 border border-p6border shadow-xl rounded-md z-50 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-p6border bg-zinc-900 rounded-t-md">
            <h3 className="font-semibold text-sm">Resource Dictionary</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-400"><X size={16}/></button>
          </div>
          <div className="p-3 max-h-96 overflow-y-auto space-y-2">
            {resources.length === 0 && <div className="text-xs text-gray-400">No resources defined.</div>}
            {resources.map(res => (
              <div key={res.id} className="bg-zinc-900 p-2 rounded border border-p6border flex justify-between items-center text-sm">
                <div>
                  <div className="font-semibold text-p6text">{res.id} - {res.name}</div>
                  <div className="text-xs text-gray-400">{res.type}</div>
                </div>
                <div className="text-green-400 font-mono">${res.standard_rate.toLocaleString()}/u</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
