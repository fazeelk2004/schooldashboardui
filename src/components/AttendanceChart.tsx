"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AttendanceChart = ({
  data,
}: {
  data: { name: string; present: number; absent: number }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart width={500} height={300} data={data} barSize={20}>
        <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="rgb(var(--line))" opacity={0.75} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tick={{ fill: "rgb(var(--ink-subtle))", fontSize: 11 }}
          tickLine={false}
        />
        <YAxis axisLine={false} tick={{ fill: "rgb(var(--ink-subtle))", fontSize: 11 }} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgb(var(--brand) / .04)" }}
          contentStyle={{ borderRadius: "14px", borderColor: "rgb(var(--line))", background: "rgb(var(--surface))", color: "rgb(var(--ink))", boxShadow: "0 16px 35px rgb(15 23 42 / .12)" }}
        />
        <Legend
          align="left"
          verticalAlign="top"
          wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
        />
        <Bar
          dataKey="present"
          fill="#4f75ff"
          legendType="circle"
          radius={[10, 10, 0, 0]}
        />
        <Bar
          dataKey="absent"
          fill="#a78bfa"
          legendType="circle"
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
