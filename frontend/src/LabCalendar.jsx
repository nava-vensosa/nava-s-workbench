export default function LabCalendar({ hedges, username, userid, setHedges, users, onBack }) {
  // Placeholder: Render a list of hedges and back button
  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>← Back</button>
      <h3>Lab Calendar (All Hedges)</h3>
      <ul>
        {hedges.map(h => (
          <li key={h.id}><b>{h.title}</b> ({h.calendar[0].date} {h.calendar[0].start}–{h.calendar[0].end})</li>
        ))}
      </ul>
    </div>
  );
}
