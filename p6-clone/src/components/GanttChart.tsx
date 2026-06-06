import React, { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';

interface GanttChartProps {
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const GanttChart: React.FC<GanttChartProps> = ({ scrollRef }) => {
  const { activities, relationships } = useProjectStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Escala simple: 1 unidad de tiempo (ej. día) = 30 píxeles
    const timeScale = 30;
    const rowHeight = 32;

    const draw = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Obtener el scroll actual de la tabla
      const scrollTop = scrollRef.current?.scrollTop || 0;
      const height = canvas.height;

      // Dibujar líneas de tiempo (Grilla vertical)
      ctx.strokeStyle = '#3f3f46'; // p6border
      ctx.lineWidth = 1;
      for(let i=0; i<100; i++) {
        ctx.beginPath();
        ctx.moveTo(i * timeScale, 0);
        ctx.lineTo(i * timeScale, height);
        ctx.stroke();
      }

      // Obtener qué tareas se deben renderizar en el viewport
      const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
      const endIndex = Math.min(activities.length, startIndex + Math.ceil(height / rowHeight) + 10);

      // Pre-calcular geometrías para facilitar el dibujado de líneas
      const actGeom = new Map<string, {x: number, y: number, w: number, i: number, critical: boolean}>();
      for(let i=0; i<activities.length; i++) {
        const act = activities[i];
        if (act.early_start !== null && act.early_finish !== null) {
          const y = (i * rowHeight) - scrollTop + 8;
          const x = act.early_start * timeScale;
          const w = (act.early_finish - act.early_start) * timeScale;
          actGeom.set(act.id, { x, y, w: Math.max(w, 4), i, critical: act.total_float === 0 });
        }
      }

      // 1. Dibujar Líneas de Dependencia (Debajo de las barras)
      ctx.lineWidth = 1.5;
      for (const rel of relationships) {
         const source = actGeom.get(rel.source_id);
         const target = actGeom.get(rel.target_id);
         if (source && target) {
            // Optimización: Solo dibujar si alguna de las dos barras es visible
            const isSourceVisible = source.i >= startIndex && source.i <= endIndex;
            const isTargetVisible = target.i >= startIndex && target.i <= endIndex;
            
            if (isSourceVisible || isTargetVisible) {
               // Color rojo si ambas tareas son críticas, azul si no
               ctx.strokeStyle = (source.critical && target.critical) ? '#f87171' : '#60a5fa';
               
               // Línea Ortogonal (Finish-to-Start)
               const startX = source.x + source.w;
               const startY = source.y + 8; // Centro de la barra (alto es 16)
               const endX = target.x;
               const endY = target.y + 8;
               
               ctx.beginPath();
               ctx.moveTo(startX, startY);
               // Mover a la derecha
               const cornerX = startX + 5;
               ctx.lineTo(cornerX, startY);
               // Bajar/Subir hasta el objetivo Y
               ctx.lineTo(cornerX, endY);
               // Mover a la derecha hasta el objetivo X
               ctx.lineTo(endX, endY);
               
               // Dibujar la punta de flecha simple
               ctx.lineTo(endX - 4, endY - 4);
               ctx.moveTo(endX, endY);
               ctx.lineTo(endX - 4, endY + 4);
               
               ctx.stroke();
            }
         }
      }

      // 2. Dibujar Barras del Gantt virtualizadas (Encima de las líneas)
      for(let i=startIndex; i<endIndex; i++) {
        const act = activities[i];
        const geom = actGeom.get(act.id);
        if (geom) {
          ctx.fillStyle = geom.critical ? '#f87171' : '#3b82f6';
          ctx.beginPath();
          ctx.roundRect(geom.x, geom.y, geom.w, 16, 4);
          ctx.fill();
        }
      }
    };

    let animationFrameId: number;
    const renderLoop = () => {
      draw();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // ResizeObserver para mantener el canvas del mismo tamaño que su contenedor
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [activities, scrollRef]);

  return (
    <div className="w-1/2 h-full flex flex-col bg-p6bg">
      {/* Cabecera del Gantt (Escala de tiempo) */}
      <div className="flex h-8 bg-zinc-800 border-b border-p6border items-center px-2 shrink-0 overflow-hidden">
        <div className="text-xs text-gray-400 font-mono">Timeline (1 Day = 30px)</div>
      </div>
      
      {/* Contenedor del Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMiI+PHBhdGggZD0iTTAgMzJMMzAgMzIiIHN0cm9rZT0iIzM4MzgzOCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]">
         <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>
    </div>
  );
};
