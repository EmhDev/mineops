import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Activity {
  id: string;
  name: string;
  duration: number;
  early_start: number | null;
  early_finish: number | null;
  late_start: number | null;
  late_finish: number | null;
  total_float: number | null;
  free_float: number | null;
}

export interface Relationship {
  source_id: string;
  target_id: string;
  rel_type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

interface ProjectState {
  activities: Activity[];
  relationships: Relationship[];
  isCalculating: boolean;
  loadMockData: () => void;
  calculateCPM: () => Promise<void>;
  updateDuration: (id: string, newDuration: number) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  activities: [],
  relationships: [],
  isCalculating: false,

  loadMockData: () => {
    // Generar un mock de 10,000 actividades para probar el rendimiento
    const acts: Activity[] = [];
    const rels: Relationship[] = [];
    
    // Crear cadena simple A -> B -> C...
    for (let i = 0; i < 10000; i++) {
      acts.push({
        id: `A${i}`,
        name: `Task ${i}`,
        duration: Math.floor(Math.random() * 5) + 1,
        early_start: null,
        early_finish: null,
        late_start: null,
        late_finish: null,
        total_float: null,
        free_float: null,
      });

      if (i > 0) {
        rels.push({
          source_id: `A${i - 1}`,
          target_id: `A${i}`,
          rel_type: 'FS',
          lag: 0,
        });
      }
    }

    set({ activities: acts, relationships: rels });
  },

  calculateCPM: async () => {
    const { activities, relationships } = get();
    set({ isCalculating: true });
    
    try {
      const start = performance.now();
      const updatedActivities = await invoke<Activity[]>('calculate_cpm', {
        activities,
        relationships,
      });
      const end = performance.now();
      console.log(`CPM Calculated in ${end - start} ms`);
      
      set({ activities: updatedActivities, isCalculating: false });
    } catch (e) {
      console.error("Failed to calculate CPM:", e);
      set({ isCalculating: false });
    }
  },

  updateDuration: (id: string, newDuration: number) => {
    set((state) => ({
      activities: state.activities.map(act => 
        act.id === id ? { ...act, duration: newDuration } : act
      )
    }));
  }
}));
