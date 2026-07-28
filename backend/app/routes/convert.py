import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse

from app.services.resume_parser import parse_resume
from app.services.ppt_handler import extract_shape_inventory, apply_mapping
from app.services.ai_mapper import map_resume_to_ppt, map_resume_to_docx
from app.services.resume_exporter import export_as_docx, export_as_pdf
from app.services.docx_handler import extract_paragraph_inventory, apply_docx_mapping

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@router.post("/preview-shapes")
async def preview_shapes(template: UploadFile = File(...)):
    if not template.filename.lower().endswith(".pptx"):
        raise HTTPException(status_code=422, detail="Template must be a .pptx file.")
    pptx_bytes = await template.read()
    inventory = extract_shape_inventory(pptx_bytes)
    return JSONResponse({"slides": inventory})


@router.post("/convert")
async def convert(
    resume: UploadFile = File(...),
    template: UploadFile = File(...),
    ai_provider: str = Form(default="none"),
    api_key: str = Form(default=""),
):
    # Validate resume format
    resume_ext = resume.filename.rsplit(".", 1)[-1].lower() if resume.filename else ""
    if resume_ext not in ("pdf", "docx"):
        raise HTTPException(
            status_code=422,
            detail="Unsupported resume format. Please upload a .pdf or .docx file.",
        )

    # Validate template format
    if not template.filename.lower().endswith(".pptx"):
        raise HTTPException(status_code=422, detail="Template must be a .pptx file.")

    # Validate AI config
    provider = ai_provider.lower().strip()
    key = api_key.strip()
    if provider in ("claude", "openai") and not key:
        raise HTTPException(
            status_code=422,
            detail=f"AI provider '{provider}' requires an API key.",
        )

    resume_bytes = await resume.read()
    pptx_bytes = await template.read()

    # Step 1: Parse resume into structured data
    try:
        resume_data = parse_resume(resume_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {str(e)}")

    # Step 2: Extract PPT shape inventory
    try:
        inventory = extract_shape_inventory(pptx_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read PPT template: {str(e)}")

    # Step 3: Map resume data to PPT shapes via AI or heuristic
    try:
        mapping = map_resume_to_ppt(
            resume=resume_data,
            inventory=inventory,
            provider=provider,
            api_key=key or None,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI mapping failed: {str(e)}")

    # Step 4: Apply mapping to PPT, preserving all formatting
    try:
        filled_bytes = apply_mapping(pptx_bytes, mapping)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply mapping to PPT: {str(e)}")

    return StreamingResponse(
        io.BytesIO(filled_bytes),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": "attachment; filename=filled_resume.pptx"},
    )


@router.post("/convert-resume")
async def convert_resume_format(
    resume: UploadFile = File(...),
    output_format: str = Form(...),
):
    fmt = output_format.lower().strip()
    if fmt not in ("docx", "pdf"):
        raise HTTPException(
            status_code=422,
            detail="output_format must be 'docx' or 'pdf'.",
        )

    resume_ext = resume.filename.rsplit(".", 1)[-1].lower() if resume.filename else ""
    if resume_ext not in ("pdf", "docx"):
        raise HTTPException(
            status_code=422,
            detail="Unsupported resume format. Please upload a .pdf or .docx file.",
        )

    resume_bytes = await resume.read()

    try:
        resume_data = parse_resume(resume_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {str(e)}")

    try:
        if fmt == "docx":
            output_bytes = export_as_docx(resume_data)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = "resume.docx"
        else:
            output_bytes = export_as_pdf(resume_data)
            media_type = "application/pdf"
            filename = "resume.pdf"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

    return StreamingResponse(
        io.BytesIO(output_bytes),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/convert-docx")
async def convert_docx_template(
    resume: UploadFile = File(...),
    template: UploadFile = File(...),
    ai_provider: str = Form(default="none"),
    api_key: str = Form(default=""),
):
    resume_ext = resume.filename.rsplit(".", 1)[-1].lower() if resume.filename else ""
    if resume_ext not in ("pdf", "docx"):
        raise HTTPException(
            status_code=422,
            detail="Unsupported resume format. Please upload a .pdf or .docx file.",
        )
    if not template.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=422, detail="Template must be a .docx file.")

    provider = ai_provider.lower().strip()
    key = api_key.strip()
    if provider in ("claude", "openai") and not key:
        raise HTTPException(
            status_code=422,
            detail=f"AI provider '{provider}' requires an API key.",
        )

    resume_bytes = await resume.read()
    docx_bytes = await template.read()

    try:
        resume_data = parse_resume(resume_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {str(e)}")

    try:
        inventory = extract_paragraph_inventory(docx_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read DOCX template: {str(e)}")

    try:
        mapping = map_resume_to_docx(
            resume=resume_data,
            inventory=inventory,
            provider=provider,
            api_key=key or None,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI mapping failed: {str(e)}")

    try:
        filled_bytes = apply_docx_mapping(docx_bytes, mapping)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply mapping to DOCX: {str(e)}")

    return StreamingResponse(
        io.BytesIO(filled_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=filled_resume.docx"},
    )
