import { useState, useEffect } from "react";
import { BsSunFill, BsMoonStarsFill } from "react-icons/bs";

export default function ThemeToggleButton() {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="flex items-center justify-center p-4">
      <button
  onClick={() => setDarkMode(!darkMode)}
  className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-500 ${
    darkMode ? "bg-primary" : "bg-gray-300"
  }`}
>
  <div
    className={`absolute left-0.5 transition-all duration-300 ease-in-out transform ${
      darkMode ? "translate-x-6" : "translate-x-0"
    }`}
  >
    <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-yellow-400 text-sm">
      {darkMode ? <BsMoonStarsFill /> : <BsSunFill />}
    </div>
  </div>
</button>

    </div>
  );
}
