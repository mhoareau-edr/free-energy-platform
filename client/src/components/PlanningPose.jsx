import { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import moment from "moment-timezone";
import "moment/locale/fr";

moment.locale("fr");
const localizer = momentLocalizer(moment);

export default function PlanningPose({ user, onClose }) {
  const [planifications, setPlanifications] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPlanifications = async () => {
      try {
        const response = await axios.get(`${API}/visites/planifiees`);

        const mapped = [];

          response.data.forEach((p) => {
            const startGlobal = moment.utc(p.date_debut_pose).tz("Indian/Reunion");
            const endGlobal = moment.utc(p.date_fin_pose).tz("Indian/Reunion");

            const nbJours = endGlobal.diff(startGlobal, 'days') + 1;

            for (let i = 0; i < nbJours; i++) {
              const day = startGlobal.clone().add(i, 'days');
              const hour = startGlobal.hour();
              const minute = startGlobal.minute();

              const eventStart = day.clone().set({ hour, minute });
              const eventEnd = eventStart.clone().add(1, 'hour');

              mapped.push({
                id: `${p.id}-${i}`,
                title: p.nom_interlocuteur || "Pose",
                start: eventStart.toDate(),
                end: eventEnd.toDate(),
                allDay: false,
              });
            }
          });
        setPlanifications(mapped);
      } catch (err) {
        console.error("Erreur lors du chargement des poses planifiées", err);
      }
    };

    fetchPlanifications();
  }, []);

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow dark:bg-[#121417] dark:text-white">
      <button onClick={onClose} className="mb-4 w-[300px] bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded">
        ← Revenir à la liste
      </button>

      <h2 className="text-xl font-bold text-primary mb-4 dark:text-white">Planning des poses</h2>
      <div style={{ height: "80vh", minHeight: "600px"}}>
        <Calendar
          localizer={localizer}
          events={planifications}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          startAccessor="start"
          endAccessor="end"
          min={moment().startOf("day").set({ hour: 6, minute: 0 }).toDate()}
          max={moment().startOf("day").set({ hour: 20, minute: 0 }).toDate()}
          style={{ height: "80vh" }}
          popup
          showMultiDayTimes={true}
          longPressThreshold={1}
          dayLayoutAlgorithm="no-overlap"
          messages={{
            today: "Aujourd'hui",
            previous: "Précédent",
            next: "Suivant",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
          }}
        />
      </div>
    </div>
  );
}