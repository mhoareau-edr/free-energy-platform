import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import DashboardAdmin from "./pages/Dashboard";
import DashboardUtilisateur from "./pages/DashboardUtilisateur";
import DashboardTechnique from "./pages/DashboardTechnique";
import ChatFullScreen from "./components/Chat/ChatFullScreen";
import ChatRouteWrapper from "./ChatRouteWrapper";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {!currentUser ? (
          <Route
            path="*"
            element={
              <Login
                onLoginSuccess={(user) => {
                  localStorage.setItem("currentUser", JSON.stringify(user));
                  setCurrentUser(user);
                }}
              />
            }
          />
        ) : (
          <>
            <Route
              path="/"
              element={
                currentUser.role === "Admin" ? (
                  <DashboardAdmin user={currentUser} onLogout={handleLogout} />
                ) : currentUser.role === "Technique" ? (
                  <DashboardTechnique user={currentUser} onLogout={handleLogout} />
                ) : (
                  <DashboardUtilisateur user={currentUser} onLogout={handleLogout} />
                )
              }
            />
            <Route
              path="/messages/:id"
              element={<ChatRouteWrapper user={currentUser} />}
            />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  );
}
