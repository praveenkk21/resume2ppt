const styles = {
  center: { textAlign: "center", padding: "8px 0 24px" },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 28px 0",
  },
  cards: {
    display: "flex",
    gap: "16px",
  },
  card: (selected) => ({
    flex: 1,
    padding: "24px 16px",
    border: `2px solid ${selected ? "#4f46e5" : "#e5e7eb"}`,
    borderRadius: "14px",
    background: selected ? "#f5f3ff" : "#fff",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
  }),
  icon: { fontSize: "40px", marginBottom: "10px" },
  cardTitle: (selected) => ({
    fontSize: "14px",
    fontWeight: "700",
    color: selected ? "#4f46e5" : "#1a1a2e",
    margin: "0 0 6px 0",
  }),
  cardDesc: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: 0,
    lineHeight: "1.5",
  },
  btn: (disabled) => ({
    marginTop: "24px",
    width: "100%",
    padding: "13px",
    background: disabled ? "#d1d5db" : "#4f46e5",
    color: disabled ? "#9ca3af" : "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s",
  }),
};

const MODES = [
  {
    key: "ppt",
    icon: "📊",
    label: "Fill a PPT Template",
    desc: "Upload your resume and a .pptx template.\nWe'll fill in all text boxes for you.",
  },
  {
    key: "convert",
    icon: "📄",
    label: "Convert Resume Format",
    desc: "Upload your resume (PDF or DOCX)\nand download it as DOCX or PDF.",
  },
];

export default function ModeStep({ onModeSelected }) {
  return (
    <div style={styles.center}>
      <h2 style={styles.title}>What do you want to do?</h2>
      <p style={styles.subtitle}>Choose a mode to get started.</p>
      <div style={styles.cards}>
        {MODES.map(({ key, icon, label, desc }) => (
          <div
            key={key}
            style={styles.card(false)}
            onClick={() => onModeSelected(key)}
          >
            <div style={styles.icon}>{icon}</div>
            <p style={styles.cardTitle(false)}>{label}</p>
            <p style={styles.cardDesc}>{desc.split("\n").map((l, i) => (
              <span key={i}>{l}{i === 0 && <br />}</span>
            ))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
