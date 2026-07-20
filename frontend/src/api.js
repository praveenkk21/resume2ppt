export const BASE_URL = "";

export async function convertResume(formData) {
  const res = await fetch(`${BASE_URL}/api/convert`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    let detail = "Conversion failed.";
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return res.blob();
}

export async function previewShapes(templateFile) {
  const formData = new FormData();
  formData.append("template", templateFile);
  const res = await fetch(`${BASE_URL}/api/preview-shapes`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to preview shapes.");
  }
  return res.json();
}
