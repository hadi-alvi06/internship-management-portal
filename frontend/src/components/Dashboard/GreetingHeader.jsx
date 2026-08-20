import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function useTypewriter(text, speed = 45) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function GreetingHeader({ stats }) {
  const { username } = useAuth();
  const firstName = username ? username.split(" ")[0] : "there";

  const greeting = `${getTimeGreeting()}, ${firstName}`;
  const typedGreeting = useTypewriter(greeting, 40);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  let subtitle = "Here's what's happening today.";
  if (stats) {
    if (stats.average_attendance >= 90) {
      subtitle = `Attendance is excellent today at ${stats.average_attendance}%.`;
    } else if (stats.average_attendance < 75 && stats.total_interns > 0) {
      subtitle = `Attendance is at ${stats.average_attendance}% — worth a look.`;
    } else if (stats.new_interns_this_week > 0) {
      subtitle = `${stats.new_interns_this_week} new intern${stats.new_interns_this_week > 1 ? "s" : ""} joined this week.`;
    }
  }

  return (
    <div className="greeting-header">
      <h1 className="greeting-typed">
        {typedGreeting}
        <span className="greeting-cursor">|</span>
      </h1>
      <p className="greeting-date">{today}</p>
      <p className="greeting-subtitle">{subtitle}</p>
    </div>
  );
}