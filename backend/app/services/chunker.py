import re
from typing import List, Tuple
from app.config import settings

class TextChunker:
    @staticmethod
    def chunk_extracted_sections(
        sections: List[Tuple[str, str]],
        chunk_size: int = settings.CHUNK_SIZE,
        chunk_overlap: int = settings.CHUNK_OVERLAP
    ) -> List[Tuple[int, str, str]]:
        """
        Takes list of (source_reference, text) and produces:
        list of (chunk_index, chunk_text, source_reference)
        """
        chunks: List[Tuple[int, str, str]] = []
        global_chunk_idx = 0

        for source_ref, section_text in sections:
            # Clean up whitespace
            cleaned_text = re.sub(r'\s+', ' ', section_text).strip()
            if not cleaned_text:
                continue

            # If text is smaller than chunk size, emit as single chunk
            if len(cleaned_text) <= chunk_size:
                chunks.append((global_chunk_idx, cleaned_text, source_ref))
                global_chunk_idx += 1
                continue

            # Slide window with overlap
            start = 0
            text_len = len(cleaned_text)

            while start < text_len:
                end = min(start + chunk_size, text_len)
                
                # Try not to break in the middle of a sentence if not at the end
                if end < text_len:
                    # look back up to 60 characters for punctuation
                    punct_pos = max(
                        cleaned_text.rfind('. ', start + chunk_size // 2, end),
                        cleaned_text.rfind('; ', start + chunk_size // 2, end),
                        cleaned_text.rfind('\n', start + chunk_size // 2, end)
                    )
                    if punct_pos != -1:
                        end = punct_pos + 1

                chunk_text = cleaned_text[start:end].strip()
                if chunk_text:
                    chunks.append((global_chunk_idx, chunk_text, source_ref))
                    global_chunk_idx += 1

                if end >= text_len:
                    break

                # Advance start with overlap
                start = max(end - chunk_overlap, start + 1)

        return chunks

