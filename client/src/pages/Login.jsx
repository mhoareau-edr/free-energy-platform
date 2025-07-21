import { useState } from "react";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const API_URL = "http://10.10.2.106:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/users`);
      const users = await res.json();

      const foundUser = users.find(
        (user) => user.name === username && user.password === password
      );

      if (foundUser) {
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        onLoginSuccess(foundUser);
        toast.success("Connecté(e) !");
      } else {
        setError("Identifiants incorrects.");
        toast.error("Identifiants incorrects !");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#121417] ">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md space-y-4 text-center dark:bg-[#21252b]"
      >
        <div className="flex justify-center items-center px-3 py-4 h-32">
          <img src={logo} alt="Logo" className="h-20" />
        </div>

        <input
          className="form-input dark:bg-[#121417] dark:border-0"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="form-input dark:bg-[#121417] dark:border-0"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button className="primary-button">Se connecter</button>
      </form>
    </div>
  );
}
