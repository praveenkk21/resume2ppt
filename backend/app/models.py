from pydantic import BaseModel
from typing import Optional, List, Dict


class ShapeMeta(BaseModel):
    shape_id: int
    shape_name: str
    current_text: str
    bbox: dict


class SlideMeta(BaseModel):
    slide_index: int
    shapes: List[ShapeMeta]


class PPTInventory(BaseModel):
    slides: List[SlideMeta]


class ExperienceEntry(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    dates: Optional[str] = None
    bullets: List[str] = []


class EducationEntry(BaseModel):
    degree: Optional[str] = None
    school: Optional[str] = None
    dates: Optional[str] = None
    gpa: Optional[str] = None


class ResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experience: List[ExperienceEntry] = []
    education: List[EducationEntry] = []
    skills: List[str] = []
    certifications: List[str] = []
    languages: List[str] = []
    raw_text: str = ""


# Dict[slide_index_str, Dict[shape_id_str, new_text]]
AIMapping = Dict[str, Dict[str, str]]
