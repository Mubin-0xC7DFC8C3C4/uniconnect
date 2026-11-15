import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function useToken(name: string) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const read = () => {
      setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", read);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", read);
    };
  }, [name]);
  return value;
}

export function GpaChartInner({ data }: { data: { semester: string; gpa: number }[] }) {
  const ink = useToken("--text");
  const muted = useToken("--text-faint");
  const grid = useToken("--border");
  const surface = useToken("--surface");
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!ink) return <div className="h-56 bg-sunken r-md" />;

  return (
    <div className="h-56 w-full" role="img" aria-label="Sample semester GPA from semester 1 to 6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="semester"
            tickFormatter={(value) => `Sem ${value}`}
            tick={{ fill: muted, fontSize: 12 }}
            axisLine={{ stroke: grid }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 2, 3, 4]}
            tick={{ fill: muted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(2), "Sample GPA"]}
            labelFormatter={(label) => `Semester ${label}`}
            contentStyle={{
              background: surface,
              border: `1px solid ${grid}`,
              borderRadius: 10,
              color: ink,
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="gpa"
            stroke={ink}
            strokeWidth={2}
            dot={{ r: 3, fill: surface, stroke: ink }}
            isAnimationActive={!reduce}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
