import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";

export default function WelcomeBanner({ user }) {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const currentDate = capitalize(format(new Date(), "EEEE dd MMMM yyyy", { locale: fr }));


  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,61,20,0.7), rgba(255,55,0,0.6))",
        color: "white",
        borderRadius: "1rem",
        padding: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backdropFilter: "blur(10px)",
        width: "100%",
      }}
      className="shadow-md"
    >
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
          Bonjour, {user.displayName || user.name}
        </h1>
        
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)" }}>
          Bonne journée de travail !
        </p>
        <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "15px" }}>
          <FaCalendarAlt />
          <span style={{ fontSize: "0.875rem" }}>{currentDate}</span>
        </div>
      </div>
    </div>
  );
}