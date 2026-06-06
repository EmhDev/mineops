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

## [Unreleased] - Fase 5 Completada

### Añadido (Fase 5: Arquitectura de Servidor gRPC)
- **Definición de Esquemas `.proto`:** Nuevo archivo `cpm.proto` que expone los mensajes `ActivityMessage`, `RelationshipMessage`, `CalendarMessage` y el servicio universal `RunCpm`.
- **Servidor Headless Asíncrono:** Usando `tokio` y `tonic`, el binario de la aplicación ahora arranca un servidor gRPC en el puerto `50051` en segundo plano cada vez que se abre MineSight. 
- **Compatibilidad Extrema:** Este motor headless permite inyectar cronogramas gigantes desde scripts Python o microservicios, procesar el algoritmo CPM de MineSight y devolver los resultados estructurados sin tocar la interfaz gráfica (Tauri).
- **Auto-compilación de Protobufs:** Se integró el crate `protoc-bin-vendored` en `build.rs` para asegurar la compilación transparente del archivo `.proto` a binarios nativos de Rust en entornos Windows (y otros OS) sin requerir instalación manual de dependencias de Google.

## [Anterior] - Fase 4 Completada

### Añadido (Fase 4: Relaciones Visuales y UX)
- **Edición en Línea:** Las actividades en la tabla ahora permiten editar su nombre directamente haciendo clic en ellas (comportamiento tipo Excel), guardándose instantáneamente en el store global.
- **Relaciones (Flechas) en Gantt:** El motor Canvas del Diagrama de Gantt ahora procesa la lista global de dependencias (relaciones Finish-to-Start) y dibuja conexiones ortogonales (codos) de forma dinámica entre el fin de la predecesora y el inicio de la sucesora.
- **Optimización Extrema de Renderizado:** El algoritmo del Canvas pre-calcula geometrías en memoria y filtra las flechas, dibujando únicamente las líneas cuyas barras origen o destino se encuentran actualmente visibles en el Viewport, permitiendo hacer scroll a través de 10,000 flechas a 60 FPS fijos.
- **Diferenciación Visual:** Las relaciones que conectan tareas críticas se renderizan en Rojo, mientras que las relaciones no críticas se dibujan en Azul claro.

## [Anterior] - Fase 3.2 Completada

### Añadido (Fase 3.2: Recursos y Costos)
- **Diccionario de Recursos:** Creación de componente visual interactivo para visualizar los recursos estándar (Labor, NonLabor, Material).
- **Asignaciones Masivas:** Generador de `MockData` ahora inyecta entre 1 y 2 recursos aleatorios a cada una de las 10,000 actividades.
- **Cálculo Dinámico de Costos:** Se agregaron las columnas `Resources` y `Total Cost` a la `ActivityTable`. El costo en $ es calculado en tiempo real basándose en unidades requeridas × la tarifa de cada recurso, manteniendo los 60 FPS de la tabla virtualizada.

## [Anterior] - Fase 3.1 Completada

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
