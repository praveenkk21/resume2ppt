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
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 calc(50% - 8px)",
    minWidth: "160px",
    padding: "24px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "14px",
    background: "#fff",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
  },
  cardHover: {
    border: "2px solid #4f46e5",
    background: "#f5f3ff",
  },
  icon: { fontSize: "36px", marginBottom: "10px" },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 6px 0",
  },
  cardDesc: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: 0,
    lineHeight: "1.5",
  },
};

const MODES = [
  {
    key: "ppt",
    icon: "📊",
    label: "Fill a PPT Template",
    desc: "Upload resume + .pptx template.\nWe fill the slides for you.",
  },
  {
    key: "docx",
    icon: "📝",
    label: "Fill a DOCX Template",
    desc: "Upload resume + .docx template.\nWe fill the Word doc for you.",
  },
  {
    key: "convert",
    icon: "📄",
    label: "Export Resume",
    desc: "Convert your resume to\nDOCX or PDF format.",
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
            style={styles.card}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { border: "2px solid #e5e7eb", background: "#fff" })}
            onClick={() => onModeSelected(key)}
          >
            <div style={styles.icon}>{icon}</div>
            <p style={styles.cardTitle}>{label}</p>
            <p style={styles.cardDesc}>{desc.split("\n").map((l, i) => (
              <span key={i}>{l}{i === 0 && <br />}</span>
            ))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
