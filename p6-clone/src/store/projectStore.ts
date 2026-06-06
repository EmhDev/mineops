import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Activity {
  id: string;
  name: string;
  duration: number;
  calendar_id: string | null;
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

export interface Calendar {
  id: string;
  name: string;
  work_days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
}

export interface Resource {
  id: string;
  name: string;
  type: 'Labor' | 'NonLabor' | 'Material';
  standard_rate: number;
}

export interface Assignment {
  id: string;
  activity_id: string;
  resource_id: string;
  planned_units: number;
}

interface ProjectState {
  activities: Activity[];
  relationships: Relationship[];
  calendars: Calendar[];
  resources: Resource[];
  assignments: Assignment[];
  isCalculating: boolean;
  loadMockData: () => void;
  calculateCPM: () => Promise<void>;
  updateDuration: (id: string, newDuration: number) => void;
  updateName: (id: string, newName: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  activities: [],
  relationships: [],
  calendars: [{
    id: "DEFAULT",
    name: "Standard 5-Day Workweek",
    work_days: [true, true, true, true, true, false, false],
  }],
  resources: [],
  assignments: [],
  isCalculating: false,

  loadMockData: () => {
    // Generar 5 Recursos
    const mockResources: Resource[] = [
      { id: 'R1', name: 'Project Manager', type: 'Labor', standard_rate: 100 },
      { id: 'R2', name: 'Software Engineer', type: 'Labor', standard_rate: 80 },
      { id: 'R3', name: 'QA Tester', type: 'Labor', standard_rate: 60 },
      { id: 'R4', name: 'Server Instance', type: 'NonLabor', standard_rate: 10 },
      { id: 'R5', name: 'Software License', type: 'Material', standard_rate: 500 },
    ];

    // Generar un mock de 10,000 actividades para probar el rendimiento
    const acts: Activity[] = [];
    const rels: Relationship[] = [];
    const assigns: Assignment[] = [];
    
    // Crear cadena simple A -> B -> C...
    for (let i = 0; i < 10000; i++) {
      acts.push({
        id: `A${i}`,
        name: `Task ${i}`,
        duration: Math.floor(Math.random() * 5) + 1,
        calendar_id: "DEFAULT",
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

      // Asignar aleatoriamente 1 o 2 recursos a cada actividad
      const numAssigns = Math.floor(Math.random() * 2) + 1;
      for(let j=0; j<numAssigns; j++) {
        const resId = `R${Math.floor(Math.random() * 5) + 1}`;
        assigns.push({
          id: `AS_${i}_${j}`,
          activity_id: `A${i}`,
          resource_id: resId,
          planned_units: Math.floor(Math.random() * 40) + 8, // Entre 8 y 48 horas/unidades
        });
      }
    }

    set({ activities: acts, relationships: rels, resources: mockResources, assignments: assigns });
  },

  calculateCPM: async () => {
    const { activities, relationships, calendars } = get();
    set({ isCalculating: true });
    
    try {
      const start = performance.now();
      const updatedActivities = await invoke<Activity[]>('calculate_cpm', {
        activities,
        relationships,
        calendars,
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
  },

  updateName: (id: string, newName: string) => {
    set((state) => ({
      activities: state.activities.map(act => 
        act.id === id ? { ...act, name: newName } : act
      )
    }));
  }
}));
