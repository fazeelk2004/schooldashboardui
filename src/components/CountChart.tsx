"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";


const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Total",
      count: boys+girls,
      fill: "rgb(var(--surface-subtle))",
    },
    {
      name: "Girls",
      count: girls,
      fill: "#8b5cf6",
    },
    {
      name: "Boys",
      count: boys,
      fill: "#4f75ff",
    },
  ];
  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={24}
          data={data}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
      <Image
        src="/maleFemale.png"
        alt=""
        width={50}
        height={50}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80"
      />
    </div>
  );
};

export default CountChart;
