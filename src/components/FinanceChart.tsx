"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Jan",
    income: 4000,
    expense: 2400,
  },
  {
    name: "Feb",
    income: 3000,
    expense: 1398,
  },
  {
    name: "Mar",
    income: 2000,
    expense: 9800,
  },
  {
    name: "Apr",
    income: 2780,
    expense: 3908,
  },
  {
    name: "May",
    income: 1890,
    expense: 4800,
  },
  {
    name: "Jun",
    income: 2390,
    expense: 3800,
  },
  {
    name: "Jul",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Aug",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Sep",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Oct",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Nov",
    income: 3490,
    expense: 4300,
  },
  {
    name: "Dec",
    income: 3490,
    expense: 4300,
  },
];

const FinanceChart = () => {
  return (
    <div className="dashboard-card h-full w-full rounded-[22px] border border-line/75 bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <span className="dashboard-section-kicker">Financial health</span>
          <h2 className="mt-1 text-base font-bold text-ink">Finance</h2>
          <p className="text-xs text-ink-subtle">Monthly income vs expense</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="4 6" stroke="rgb(var(--line))" opacity={0.7} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "rgb(var(--ink-subtle))", fontSize: 11 }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tick={{ fill: "rgb(var(--ink-subtle))", fontSize: 11 }} tickLine={false}  tickMargin={20}/>
          <Tooltip contentStyle={{ borderRadius: "14px", borderColor: "rgb(var(--line))", background: "rgb(var(--surface))", color: "rgb(var(--ink))" }} />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#4f75ff"
            strokeWidth={3}
            dot={false}
          />
          <Line type="monotone" dataKey="expense" stroke="#a78bfa" strokeWidth={3} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
