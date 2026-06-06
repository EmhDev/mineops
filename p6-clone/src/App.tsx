import React, { useRef } from "react";
import { Layout } from "./components/Layout";
import { ActivityTable } from "./components/ActivityTable";
import { GanttChart } from "./components/GanttChart";
import "./App.css";

function App() {
  const tableScrollRef = useRef<HTMLDivElement>(null);

  return (
    <Layout>
      <ActivityTable scrollRef={tableScrollRef} />
      <GanttChart scrollRef={tableScrollRef} />
    </Layout>
  );
}

export default App;
