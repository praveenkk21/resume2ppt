import { useState } from "react";
import StepIndicator from "./components/StepIndicator.jsx";
import UploadStep from "./components/UploadStep.jsx";
import ConfigStep from "./components/ConfigStep.jsx";
import DownloadStep from "./components/DownloadStep.jsx";
import { useConvert } from "./hooks/useConvert.js";

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 16px",
    background: "linear-gradient(135deg, #f0f2f5 0%, #e8edf5 100%)",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "40px",
    width: "100%",
    maxWidth: "600px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 32px 0",
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
  },
};

export default function App() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const { convert, loading, error, resultBlob } = useConvert();

  function handleFilesSelected(rf, tf) {
    setResumeFile(rf);
    setTemplateFile(tf);
    setStep(2);
  }

  async function handleConvert(provider, apiKey) {
    await convert({ resumeFile, templateFile, aiProvider: provider, apiKey });
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setResumeFile(null);
    setTemplateFile(null);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Resume → PPT</h1>
        <p style={styles.subtitle}>
          Upload your resume and a PowerPoint template. We'll fill it in for you.
        </p>
        <StepIndicator currentStep={step} />
        {step === 1 && <UploadStep onFilesSelected={handleFilesSelected} />}
        {step === 2 && (
          <ConfigStep
            onConvert={handleConvert}
            onBack={() => setStep(1)}
            loading={loading}
            error={error}
          />
        )}
        {step === 3 && resultBlob && (
          <DownloadStep resultBlob={resultBlob} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
