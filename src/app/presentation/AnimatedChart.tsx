"use client";
import { useRef, useEffect } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jun 24", uv: 400 },
  { name: "Jun 25", uv: 200 },
  { name: "Jun 26", uv: 800 },
  { name: "Jun 27", uv: 1500 },
  { name: "Jun 28", uv: 600 },
  { name: "Jun 29", uv: 300 },
  { name: "Jun 30", uv: 700 },
];

export default function AnimatedChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!chartRef.current) return;
      const rect = chartRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Calculate a value between 0 and 1 based on scroll position
      let progress = 1 - Math.max(0, Math.min(1, rect.top / windowHeight));
      // Animate chart up/down based on scroll
      chartRef.current.style.transform = `translateY(${(1 - progress) * 40}px)`;
      chartRef.current.style.opacity = String(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={chartRef} style={{ transition: "transform 0.6s cubic-bezier(.4,2,.3,1), opacity 0.6s" }}>
      <ChartContainer config={{uv: { color: "#fff" }}}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fff" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#fff" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#aaa" fontSize={12} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#222", border: "none", borderRadius: 8 }} />
            <Area type="monotone" dataKey="uv" stroke="#fff" fill="url(#colorUv)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
