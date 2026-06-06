# Changelog

Todas las versiones notables de este proyecto serán documentadas en este archivo.

## [Unreleased] - 2026-06-06

### Añadido (Fase 1)
- Proyecto base usando Tauri (Frontend en React + TypeScript).
- Estructuras de datos (Models) en Rust para Actividades y Relaciones (`models.rs`).
- Motor de cálculo CPM (Método de la Ruta Crítica) escrito en Rust utilizando la teoría de Grafos (`petgraph`).
- Detección de ciclos/bucles de dependencias.
- Cálculo de *Early Start*, *Early Finish*, *Late Start*, *Late Finish*, *Total Float* y *Free Float*.
- Comando IPC de Tauri `calculate_cpm` expuesto hacia el Frontend.
- Pruebas unitarias básicas para validar el flujo del Forward y Backward pass.

### Arreglado
- Error del compilador de Rust ("Borrow Checker") al calcular las holguras en el *Backward Pass*.

## [Unreleased] - Fase 3.1 Completada

### Añadido (Fase 3.1: Calendarios)
- Soporte para **Calendarios Laborables** en el motor CPM (Rust). Ahora el algoritmo evita agendar tareas en días no laborables (ej. Sábados y Domingos).
- Métodos auxiliares `add_working_days` y `subtract_working_days` en `engine.rs` para cálculos precisos basados en horas/días laborables reales.
- El Frontend ahora inyecta dinámicamente el calendario "Estándar de 5 Días" por defecto a cada tarea generada.
- Componente `CalendarManager.tsx` añadido a la barra superior, permitiendo visualizar los días laborables de los calendarios disponibles en el proyecto.

## [Anterior] - Fase 2 Completada

### Añadido (Fase 2)
- Integración de **Tailwind CSS** para una interfaz moderna en Modo Oscuro.
- **Store global con Zustand** (`projectStore.ts`) para gestionar el ciclo de vida de los datos y mock data masivo (10,000 tareas).
- Componente de **ActivityTable** de alto rendimiento implementado con `@tanstack/react-virtual` para soportar 100,000 filas sin impacto en el DOM.
- Componente de **GanttChart** dibujado usando puro `HTML5 Canvas`, sincronizado de forma reactiva con el scroll vertical de la tabla de actividades.
- Cálculos críticos renderizados en rojo y barras regulares en azul en el Gantt.
