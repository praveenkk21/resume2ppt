const steps = ["Upload Files", "Configure AI", "Download PPT", "Export Resume"];

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "36px",
    gap: "0",
  },
  stepGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  circle: (active, done) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    background: done ? "#4f46e5" : active ? "#4f46e5" : "#e5e7eb",
    color: done || active ? "#fff" : "#6b7280",
    border: active ? "3px solid #a5b4fc" : "3px solid transparent",
    transition: "all 0.3s",
    zIndex: 1,
  }),
  label: (active, done) => ({
    marginTop: "6px",
    fontSize: "11px",
    fontWeight: active ? "600" : "400",
    color: active || done ? "#4f46e5" : "#9ca3af",
    whiteSpace: "nowrap",
  }),
  connector: (done) => ({
    width: "60px",
    height: "3px",
    background: done ? "#4f46e5" : "#e5e7eb",
    marginBottom: "24px",
    transition: "background 0.3s",
  }),
};

export default function StepIndicator({ currentStep }) {
  return (
    <div style={styles.wrapper}>
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.stepGroup}>
              <div style={styles.circle(active, done)}>
                {done ? "✓" : stepNum}
              </div>
              <span style={styles.label(active, done)}>{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div style={styles.connector(done)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
