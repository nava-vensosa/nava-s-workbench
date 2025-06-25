import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function LabCalendar({ hedges, username, userid, setHedges, users, onBack }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHedges() {
      try {
        const res = await fetch(`${API_URL}/api/hedges`);
        const data = await res.json();
        setHedges(data);
      } catch (error) {
        console.error("Error fetching hedges:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHedges();
  }, [setHedges]);

  if (loading) {
    return (
      <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
        <h3>Loading Hedges...</h3>
      </div>
    );
  }

  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>← Back</button>
      <h3>Lab Calendar (All Hedges)</h3>
      <ul>
        {hedges.map(h => (
          <li key={h.id}>
            <b>{h.title}</b> ({h.calendar[0].date} {h.calendar[0].start}–{h.calendar[0].end})
          </li>
        ))}
      </ul>
    </div>
  );
}