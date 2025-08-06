// CalendarVT.jsx
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CalendarVT({ visite, user }) {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchVTs = async () => {
      const res = await axios.get(`${API}/visites/techniques-planifiees`);
      const formatted = res.data.map(v => ({
        title: `[VT] ${v.nom_interlocuteur}`,
        start: v.date_visite_technique,
        end: new Date(new Date(v.date_visite_technique).getTime() + 60 * 60 * 1000), // +1h
        extendedProps: { visiteId: v.id }
      }));
      setEvents(formatted);
    };
    fetchVTs();
  }, []);

  const handleSelect = (info) => {
    const selected = new Date(info.start);
    selected.setHours(9, 0, 0, 0);
    const isoDate = new Date(selected.getTime() - selected.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setSelectedDate(isoDate);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    const date = new Date(selectedDate);

    await axios.put(`${API}/visites/${visite.id}/planifier-vt`, {
      date_visite_technique: date.toISOString(),
      user: user.name
    });

    setEvents([...events, {
      title: `[VT] ${visite.nom_interlocuteur}`,
      start: date.toISOString(),
      end: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
    }]);

    toast.success("Visite technique planifiée !");
    setShowModal(false);
    window.location.reload();
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow dark:bg-[#1d2125]">
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, multiMonthPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay'
        }}
        views={{
          multiMonthYear: { type: 'multiMonth', duration: { months: 12 }, titleFormat: { year: 'numeric' } }
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
        events={events}
        select={handleSelect}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[360px] shadow-lg dark:bg-[#1d2125] dark:text-white">
            <h2 className="text-lg font-bold mb-4 text-center">Planifier la Visite Technique</h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block">Nom du client</label>
                <input type="text" value={visite.nom_interlocuteur} readOnly className="w-full px-3 py-2 bg-gray-100 dark:text-black" />
              </div>

              <div>
                <label className="block">Date & heure</label>
                <input
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 dark:text-black"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setShowModal(false)} className="text-sm text-gray-600 hover:text-red-500">Annuler</button>
              <button onClick={handleConfirm} className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
