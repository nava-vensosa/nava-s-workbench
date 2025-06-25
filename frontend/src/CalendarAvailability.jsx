export default function CalendarAvailability({ username, userid, availability, setAvailability, onBack }) {
  // Placeholder: Render a message and back button
  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>← Back</button>
      <h3>Edit Calendar Availability</h3>
      <p>(Week-view calendar UI coming soon!)</p>
    </div>
  );
}
