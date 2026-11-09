import io
from typing import List, Tuple
from pypdf import PdfReader
from docx import Document as DocxDocument

class DocumentExtractor:
    @staticmethod
    def extract(content: bytes, filename: str) -> List[Tuple[str, str]]:
        """
        Extracts text from file content.
        Returns a list of (section_or_page_reference, text_content).
        """
        filename_lower = filename.lower()
        extracted_sections: List[Tuple[str, str]] = []

        if filename_lower.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(content))
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    extracted_sections.append((f"Page {page_idx + 1}", page_text.strip()))

        elif filename_lower.endswith(".docx"):
            doc = DocxDocument(io.BytesIO(content))
            current_heading = "General"
            current_buffer = []

            for paragraph in doc.paragraphs:
                text = paragraph.text.strip()
                if not text:
                    continue
                if paragraph.style.name.startswith("Heading"):
                    if current_buffer:
                        extracted_sections.append((current_heading, "\n".join(current_buffer)))
                        current_buffer = []
                    current_heading = text
                else:
                    current_buffer.append(text)

            if current_buffer:
                extracted_sections.append((current_heading, "\n".join(current_buffer)))

        else:
            # Plain text fallback (.txt, .md, etc.)
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                text = content.decode("latin-1", errors="replace")

            # Split by double newlines or headers if available
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            if paragraphs:
                for idx, para in enumerate(paragraphs):
                    extracted_sections.append((f"Section {idx + 1}", para))
            else:
                extracted_sections.append(("Full Document", text.strip()))

        return extracted_sections

