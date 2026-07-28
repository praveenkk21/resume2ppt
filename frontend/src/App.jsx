import { useState } from "react";
import StepIndicator from "./components/StepIndicator.jsx";
import ModeStep from "./components/ModeStep.jsx";
import UploadStep from "./components/UploadStep.jsx";
import ConfigStep from "./components/ConfigStep.jsx";
import DownloadStep from "./components/DownloadStep.jsx";
import DocxDownloadStep from "./components/DocxDownloadStep.jsx";
import ResumeFormatStep from "./components/ResumeFormatStep.jsx";
import { useConvert } from "./hooks/useConvert.js";
import { useConvertDocx } from "./hooks/useConvertDocx.js";

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
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);

  const { convert, loading: pptLoading, error: pptError, resultBlob: pptBlob } = useConvert();
  const { convertDocx, loading: docxLoading, error: docxError, resultBlob: docxBlob } = useConvertDocx();

  function handleModeSelected(selectedMode) {
    setMode(selectedMode);
    setStep(1);
  }

  function handleFilesSelected(rf, tf) {
    setResumeFile(rf);
    setTemplateFile(tf);
    setStep(2);
  }

  async function handlePptConvert(provider, apiKey) {
    await convert({ resumeFile, templateFile, aiProvider: provider, apiKey });
    setStep(3);
  }

  async function handleDocxConvert(provider, apiKey) {
    await convertDocx({ resumeFile, templateFile, aiProvider: provider, apiKey });
    setStep(3);
  }

  function handleReset() {
    setMode(null);
    setStep(1);
    setResumeFile(null);
    setTemplateFile(null);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Resume → PPT / DOCX</h1>
        <p style={styles.subtitle}>
          Fill a PowerPoint or Word template, or convert your resume to a new format.
        </p>

        {mode !== null && <StepIndicator currentStep={step} mode={mode} />}

        {/* Landing */}
        {mode === null && <ModeStep onModeSelected={handleModeSelected} />}

        {/* PPT mode: steps 1–4 */}
        {mode === "ppt" && step === 1 && (
          <UploadStep onFilesSelected={handleFilesSelected} resumeOnly={false} />
        )}
        {mode === "ppt" && step === 2 && (
          <ConfigStep
            onConvert={handlePptConvert}
            onBack={() => setStep(1)}
            loading={pptLoading}
            error={pptError}
          />
        )}
        {mode === "ppt" && step === 3 && pptBlob && (
          <DownloadStep
            resultBlob={pptBlob}
            onReset={handleReset}
            onNext={() => setStep(4)}
          />
        )}
        {mode === "ppt" && step === 4 && (
          <ResumeFormatStep resumeFile={resumeFile} onReset={handleReset} />
        )}

        {/* DOCX mode: steps 1–3 */}
        {mode === "docx" && step === 1 && (
          <UploadStep
            onFilesSelected={handleFilesSelected}
            resumeOnly={false}
            templateLabel="DOCX Template (.docx)"
            templateAccept=".docx"
          />
        )}
        {mode === "docx" && step === 2 && (
          <ConfigStep
            onConvert={handleDocxConvert}
            onBack={() => setStep(1)}
            loading={docxLoading}
            error={docxError}
          />
        )}
        {mode === "docx" && step === 3 && docxBlob && (
          <DocxDownloadStep resultBlob={docxBlob} onReset={handleReset} />
        )}

        {/* Convert mode: steps 1–2 */}
        {mode === "convert" && step === 1 && (
          <UploadStep onFilesSelected={handleFilesSelected} resumeOnly={true} />
        )}
        {mode === "convert" && step === 2 && (
          <ResumeFormatStep resumeFile={resumeFile} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
