import { useEffect, useState } from "react";
import type { ComponentType } from "react";

type Point = { semester: string; gpa: number };

export function GpaChart({ data }: { data: Point[] }) {
  const [Chart, setChart] = useState<ComponentType<{ data: Point[] }> | null>(null);

  useEffect(() => {
    let active = true;
    void import("@/components/gpa-chart-inner").then((mod) => {
      if (active) setChart(() => mod.GpaChartInner);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!Chart) {
    return <div className="h-56 bg-sunken r-md" role="img" aria-label="Loading sample GPA chart" />;
  }
  return <Chart data={data} />;
}
