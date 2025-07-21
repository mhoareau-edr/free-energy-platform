import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#fa1515", "#fb923c", "#16a34a"];

const renderCustomizedLabel = ({ percent, x, y, cx, cy }) => {
  const radius = 40;
  const RADIAN = Math.PI / 180;
  const angle = Math.atan2(y - cy, x - cx);
  const labelX = cx + radius * Math.cos(angle);
  const labelY = cy + radius * Math.sin(angle);

  return (
    <text
      x={labelX}
      y={labelY}
      fill="#333"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};

export default function CamembertStats({ nonCommences, enCours, termines }) {
  const data = [
    { name: "Non commencés", value: nonCommences },
    { name: "En cours", value: enCours },
    { name: "Terminés", value: termines }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 w-full h-[400px] dark:bg-[#1d2125] dark:text-white">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">
        Répartition des dossiers
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Legend
            verticalAlign="top"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", marginBottom: "8px" }}
          />
          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} dossiers`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
