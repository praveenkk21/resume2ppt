import re
import io
from typing import Optional
from app.models import ResumeData, ExperienceEntry, EducationEntry


# Section header keywords
SECTION_KEYWORDS = {
    "summary": ["summary", "objective", "profile", "about", "professional summary"],
    "experience": ["experience", "work history", "employment", "work experience", "professional experience"],
    "education": ["education", "academic", "qualifications", "academic background"],
    "skills": ["skills", "technical skills", "core competencies", "competencies", "technologies", "expertise"],
    "certifications": ["certifications", "certificates", "certification", "licenses"],
    "languages": ["languages", "language proficiency"],
}

DATE_PATTERN = re.compile(
    r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,\.]*\d{4}"
    r"|(\d{1,2}/\d{4})"
    r"|\d{4}\s*[-–—]\s*(\d{4}|present|current|now)",
    re.IGNORECASE,
)

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"[\+]?[\d][\d\s\-\(\)\.]{6,}[\d]")
LINKEDIN_RE = re.compile(r"linkedin\.com/in/[\w\-]+", re.IGNORECASE)
LOCATION_RE = re.compile(r"\b[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


def extract_text_from_docx(file_bytes: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def _detect_section(line: str) -> Optional[str]:
    stripped = line.strip().lower().rstrip(":").strip()
    for section, keywords in SECTION_KEYWORDS.items():
        if stripped in keywords:
            return section
        # Also match all-caps variants
        if line.strip().isupper() and any(kw in stripped for kw in keywords):
            return section
    return None


def _parse_contact_block(lines: list[str]) -> dict:
    contact = {}
    scan = "\n".join(lines[:20])

    email_m = EMAIL_RE.search(scan)
    if email_m:
        contact["email"] = email_m.group(0)

    phone_m = PHONE_RE.search(scan)
    if phone_m:
        raw = phone_m.group(0).strip()
        # Filter out years like "2020" which match loosely
        if len(re.sub(r"\D", "", raw)) >= 7:
            contact["phone"] = raw

    linkedin_m = LINKEDIN_RE.search(scan)
    if linkedin_m:
        contact["linkedin"] = "https://www." + linkedin_m.group(0)

    loc_m = LOCATION_RE.search(scan)
    if loc_m:
        contact["location"] = loc_m.group(0)

    return contact


def _split_into_sections(lines: list[str]) -> dict:
    sections: dict = {"_preamble": []}
    current = "_preamble"
    for line in lines:
        detected = _detect_section(line)
        if detected:
            current = detected
            sections.setdefault(current, [])
        else:
            sections.setdefault(current, [])
            sections[current].append(line)
    return sections


def _parse_experience(lines: list[str]) -> list[ExperienceEntry]:
    entries = []
    current: Optional[ExperienceEntry] = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        has_date = bool(DATE_PATTERN.search(stripped))
        is_bullet = stripped.startswith(("•", "-", "*", "·", "▪", "◦"))

        if has_date and not is_bullet:
            if current:
                entries.append(current)
            current = ExperienceEntry(dates=stripped)
        elif is_bullet:
            if current:
                current.bullets.append(stripped.lstrip("•-*·▪◦ ").strip())
        elif current is not None:
            # Lines after the date line fill title/company
            if not current.title:
                current.title = stripped
            elif not current.company:
                current.company = stripped
        else:
            # First non-bullet, non-date line may be title
            current = ExperienceEntry(title=stripped)

    if current:
        entries.append(current)

    return entries


def _parse_education(lines: list[str]) -> list[EducationEntry]:
    entries = []
    current: Optional[EducationEntry] = None
    degree_keywords = re.compile(
        r"\b(bachelor|master|b\.?s\.?|m\.?s\.?|m\.?b\.?a\.?|ph\.?d\.?|associate|diploma|b\.?a\.?|m\.?a\.?)\b",
        re.IGNORECASE,
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        has_date = bool(DATE_PATTERN.search(stripped))
        has_degree = bool(degree_keywords.search(stripped))

        if has_degree:
            if current:
                entries.append(current)
            current = EducationEntry(degree=stripped)
        elif has_date and current:
            current.dates = stripped
        elif current is not None:
            if not current.school:
                current.school = stripped
        else:
            current = EducationEntry(school=stripped)

    if current:
        entries.append(current)

    return entries


def _parse_skills(lines: list[str]) -> list[str]:
    combined = " ".join(line.strip() for line in lines if line.strip())
    # Split on common delimiters: comma, pipe, semicolon, bullet chars
    parts = re.split(r"[,|;•·▪◦]\s*", combined)
    return [p.strip() for p in parts if p.strip()]


def _parse_structured(raw_text: str) -> ResumeData:
    lines = raw_text.splitlines()
    non_empty = [l for l in lines if l.strip()]

    name = non_empty[0].strip() if non_empty else None

    contact = _parse_contact_block(lines)

    sections = _split_into_sections(lines)

    summary_lines = sections.get("summary", [])
    summary = " ".join(l.strip() for l in summary_lines if l.strip()) or None

    experience = _parse_experience(sections.get("experience", []))
    education = _parse_education(sections.get("education", []))
    skills = _parse_skills(sections.get("skills", []))
    certifications = _parse_skills(sections.get("certifications", []))
    languages = _parse_skills(sections.get("languages", []))

    return ResumeData(
        name=name,
        email=contact.get("email"),
        phone=contact.get("phone"),
        linkedin=contact.get("linkedin"),
        location=contact.get("location"),
        summary=summary,
        experience=experience,
        education=education,
        skills=skills,
        certifications=certifications,
        languages=languages,
        raw_text=raw_text,
    )


def parse_resume(file_bytes: bytes, filename: str) -> ResumeData:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        raw = extract_text_from_pdf(file_bytes)
    elif ext == "docx":
        raw = extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported format: {ext}")
    return _parse_structured(raw)
