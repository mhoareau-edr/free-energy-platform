import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import multiMonthPlugin from '@fullcalendar/multimonth';

export default function CalendarPose({ visite, user }) {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customTitle, setCustomTitle] = useState(visite.nom_interlocuteur);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [techniciens, setTechniciens] = useState(1);

  useEffect(() => {
    const fetchPlanifications = async () => {
      const API = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${API}/visites/planifiees`);
      const formattedEvents = res.data.map((p) => ({
        title: p.nom_interlocuteur,
        start: p.date_debut_pose,
        end: p.date_fin_pose,
        extendedProps: { visiteId: p.id }
      }));
      setEvents(formattedEvents);
    };
    fetchPlanifications();
  }, []);

  const handleDateSelect = (selectInfo) => {
    const defaultStart = new Date(selectInfo.start);
    const defaultEnd = new Date(selectInfo.end);

    if (
      selectInfo.end.getHours?.() === 0 &&
      selectInfo.end.getMinutes?.() === 0 &&
      selectInfo.end.getSeconds?.() === 0
    ) {
      defaultEnd.setDate(defaultEnd.getDate() - 1);
    }

    defaultStart.setHours(9, 0, 0, 0);
    defaultEnd.setHours(9, 0, 0, 0);


    const stockage = parseInt(visite.stockage_text || "0", 10);
    const recommended = stockage > 3000 ? 2 : 1;
    const localStart = new Date(defaultStart.getTime() - defaultStart.getTimezoneOffset() * 60000);
    const localEnd = new Date(defaultEnd.getTime() - defaultEnd.getTimezoneOffset() * 60000);

    setSelectedSlot(selectInfo);
    setCustomTitle(visite.nom_interlocuteur);
    setStartDateTime(localStart.toISOString().slice(0, 16));
    setEndDateTime(localEnd.toISOString().slice(0, 16));
    setTechniciens(recommended);
    setShowModal(true);
  };


  const handleConfirm = async () => {
    const API = import.meta.env.VITE_API_URL;
    const dateDebut = new Date(startDateTime);
    const dateFin = new Date(endDateTime);

    await axios.put(`${API}/visites/${visite.id}/planifier-pose`, {
      date_debut_pose: dateDebut.toISOString(),
      date_fin_pose: dateFin.toISOString(),
      techniciens_recommandes: techniciens,
      user: user.name
    });

    setEvents([
      ...events,
      {
        title: customTitle,
        start: dateDebut.toISOString(),
        end: dateFin.toISOString(),
        extendedProps: { visiteId: visite.id }
      }
    ]);

    toast.success("Pose planifiée !");
    setShowModal(false);
    setSelectedSlot(null);
    window.location.reload();
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow relative dark:bg-[#1d2125] dark:border-0">

      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, multiMonthPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date()}

        views={{
          multiMonthYear: {
            type: 'multiMonth',
            duration: { months: 12 },
            titleFormat: { year: 'numeric' }
          }
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay'
        }}
        buttonText={{
          today: "Aujourd'hui",
          multiMonthYear: "Année",
          month: "Mois",
          week: "Semaine",
          day: "Jour"
        }}
        locale="fr"
        selectable={true}
        editable={false}
        events={events}
        select={handleDateSelect}
        navLinks={true}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 ">
          <div className="bg-white p-6 rounded-xl w-[360px] shadow-lg dark:bg-[#1d2125] dark:border-0">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center dark:text-white">Planifier la pose</h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-700 font-medium dark:text-white">Nom du client</label>
                <input
                  type="text"
                  value={customTitle}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed dark:text-black"
                />
              </div>


              <div>
                <label className="block text-gray-700 font-medium dark:text-white">Début</label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:text-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium dark:text-white">Fin</label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:text-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium dark:text-white">Nombre de techniciens recommandé</label>
                <input
                  type="number"
                  min="1"
                  value={techniciens}
                  onChange={(e) => setTechniciens(e.target.value)}
                  className="w-full border rounded px-3 py-2  dark:text-black"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-600 hover:text-red-500 dark:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
