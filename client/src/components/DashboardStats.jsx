import {
  FaChartLine,
  FaTimesCircle,
  FaHourglassHalf,
  FaCheckCircle,
} from "react-icons/fa";

export default function DashboardStats({ total, nonCommences, enCours, termines, onFilterClick }) {
  const stats = [
    {
      title: "Dossiers totaux",
      value: total,
      icon: <FaChartLine />,
      gradient: "from-blue-500 to-blue-400",
      filter: []
    },
    {
      title: "Dossiers à commencer",
      value: nonCommences,
      icon: <FaTimesCircle />,
      gradient: "from-red-400 to-red-300",
      filter: ["Demande de VT"]
    },
    {
      title: "Dossiers en cours",
      value: enCours,
      icon: <FaHourglassHalf />,
      gradient: "from-orange-400 to-orange-300",
      filter: ["Visite Technique", "EDF", "Consuel", "DP", "RAC", "VAD", "Pose", "En attente de documents pour la DP"]
    },
    {
      title: "Dossiers terminés",
      value: termines,
      icon: <FaCheckCircle />,
      gradient: "from-green-500 to-green-400",
      filter: ["Terminé"]
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          onClick={() => onFilterClick(stat.filter)}
          className={`cursor-pointer bg-gradient-to-r ${stat.gradient} text-white rounded-xl px-5 py-4 h-32
                      backdrop-blur-md bg-opacity-40 border-white/20
                      flex flex-col justify-between transform transition-all duration-300 hover:scale-105 shadow-md`}
        >
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>{stat.title}</span>
            <span className="text-lg">{stat.icon}</span>
          </div>
          <div className="text-3xl font-bold mt-2">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
