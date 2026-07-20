import { useState } from "react";

const PROVIDERS = [
  { value: "none", label: "No AI", description: "Keyword-based matching (no API key needed)" },
  { value: "claude", label: "Claude (Anthropic)", description: "Best quality — uses claude-opus-4-5" },
  { value: "openai", label: "OpenAI", description: "Uses gpt-4o" },
];

const styles = {
  radioGroup: { marginBottom: "20px" },
  radioLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "10px",
  },
  radioOption: (selected) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "8px",
    border: `2px solid ${selected ? "#4f46e5" : "#e5e7eb"}`,
    background: selected ? "#f5f3ff" : "#fff",
    cursor: "pointer",
    marginBottom: "8px",
    transition: "all 0.15s",
  }),
  radioText: {
    flex: 1,
  },
  radioTitle: (selected) => ({
    fontSize: "13px",
    fontWeight: "600",
    color: selected ? "#4f46e5" : "#1f2937",
    margin: 0,
  }),
  radioDesc: {
    fontSize: "11px",
    color: "#6b7280",
    margin: "2px 0 0 0",
  },
  keySection: { marginBottom: "20px" },
  keyLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  keyInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "2px solid #d1d5db",
    fontSize: "13px",
    fontFamily: "monospace",
    outline: "none",
    boxSizing: "border-box",
  },
  note: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "6px",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    padding: "12px 14px",
    marginBottom: "16px",
    fontSize: "13px",
    color: "#b91c1c",
  },
  btnRow: { display: "flex", gap: "10px", marginTop: "28px" },
  backBtn: {
    flex: "0 0 auto",
    padding: "12px 20px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  convertBtn: (disabled) => ({
    flex: 1,
    padding: "12px",
    background: disabled ? "#d1d5db" : "#4f46e5",
    color: disabled ? "#9ca3af" : "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s",
  }),
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginRight: "8px",
    verticalAlign: "middle",
  },
};

export default function ConfigStep({ onConvert, onBack, loading, error }) {
  const [provider, setProvider] = useState("none");
  const [apiKey, setApiKey] = useState("");

  const needsKey = provider === "claude" || provider === "openai";
  const canConvert = !loading && (!needsKey || apiKey.trim().length > 0);

  function handleConvert() {
    onConvert(provider, apiKey.trim());
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.radioGroup}>
        <span style={styles.radioLabel}>AI Provider</span>
        {PROVIDERS.map((p) => (
          <div
            key={p.value}
            style={styles.radioOption(provider === p.value)}
            onClick={() => setProvider(p.value)}
          >
            <input
              type="radio"
              checked={provider === p.value}
              onChange={() => setProvider(p.value)}
              style={{ marginTop: "2px", accentColor: "#4f46e5" }}
            />
            <div style={styles.radioText}>
              <p style={styles.radioTitle(provider === p.value)}>{p.label}</p>
              <p style={styles.radioDesc}>{p.description}</p>
            </div>
          </div>
        ))}
      </div>

      {needsKey && (
        <div style={styles.keySection}>
          <span style={styles.keyLabel}>
            {provider === "claude" ? "Anthropic API Key" : "OpenAI API Key"}
          </span>
          <input
            type="password"
            style={styles.keyInput}
            placeholder={provider === "claude" ? "sk-ant-..." : "sk-..."}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
          />
          <p style={styles.note}>
            Your API key is sent directly to the AI provider and is never stored on our server.
          </p>
        </div>
      )}

      {error && <div style={styles.errorBox}>Error: {error}</div>}

      <div style={styles.btnRow}>
        <button style={styles.backBtn} onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button
          style={styles.convertBtn(!canConvert)}
          disabled={!canConvert}
          onClick={handleConvert}
        >
          {loading ? (
            <>
              <span style={styles.spinner} />
              Converting...
            </>
          ) : (
            "Convert"
          )}
        </button>
      </div>
    </div>
  );
}
