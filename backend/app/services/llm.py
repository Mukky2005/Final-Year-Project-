import logging
import requests
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.ollama_chat_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"
        self.model = settings.CHAT_MODEL

    def generate_grounded_answer(
        self,
        tenant_name: str,
        user_role_name: str,
        question: str,
        authorized_contexts: List[Dict[str, Any]]
    ) -> str:
        """
        Generates an answer from authorized context chunks.
        PRD Rule: System prompt reminds model of role & strict context adherence,
        but security filtering was already enforced in the database retrieval step.
        """
        # If no authorized contexts exist, fail closed immediately
        if not authorized_contexts:
            return "I do not have sufficient information in your permitted knowledge scope to answer this question."

        # Format context blocks
        context_blocks = []
        for i, ctx in enumerate(authorized_contexts, start=1):
            source_title = ctx.get("document_title", "Document")
            source_ref = ctx.get("source_reference", "")
            text = ctx.get("snippet", "")
            context_blocks.append(f"--- [Source {i}: {source_title} ({source_ref})] ---\n{text}")

        joined_context = "\n\n".join(context_blocks)

        system_instruction = (
            f"You are the Enterprise Knowledge Assistant for company '{tenant_name}'.\n"
            f"The authenticated employee's active role is: '{user_role_name}'.\n\n"
            "SECURITY & GROUNDING RULES:\n"
            "1. You must answer the user's question solely and strictly using the AUTHORIZED EVIDENCE provided below.\n"
            "2. If the authorized evidence does not provide enough factual information to answer the question, you MUST explicitly respond:\n"
            "'I do not have sufficient information in your permitted knowledge scope to answer this question.'\n"
            "3. Do NOT make up information, guess, or extrapolate beyond the provided authorized documents.\n"
            "4. Cite the source documents (e.g. [Source 1: Document Name]) when referencing specific rules or facts."
        )

        user_prompt = (
            f"QUESTION:\n{question}\n\n"
            f"AUTHORIZED EVIDENCE:\n{joined_context}\n\n"
            "Please provide a clear, accurate answer based strictly on the authorized evidence above:"
        )

        # Call Ollama /api/chat
        try:
            resp = requests.post(
                self.ollama_chat_url,
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.1,  # Low temperature for factual precision
                        "top_p": 0.9
                    }
                },
                timeout=30
            )
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get("message", {}).get("content", "").strip()
                if msg:
                    return msg
        except Exception as e:
            logger.warning(f"Ollama chat generation failed or timed out: {e}")

        # Grounded extraction fallback (in case Ollama server is busy or cold-starting)
        logger.info("Executing grounded context synthesis fallback.")
        return self._grounded_fallback_synthesis(question, authorized_contexts)

    def _grounded_fallback_synthesis(self, question: str, contexts: List[Dict[str, Any]]) -> str:
        """
        Pure deterministic extraction if LLM is cold-starting or unavailable.
        Extracts relevant sentences from the authorized chunks.
        """
        if not contexts:
            return "I do not have sufficient information in your permitted knowledge scope to answer this question."

        keywords = [w.lower() for w in question.split() if len(w) > 3]
        relevant_sentences = []
        for ctx in contexts:
            doc_title = ctx.get("document_title", "Document")
            text = ctx.get("snippet", "")
            sentences = [s.strip() for s in text.replace('\n', ' ').split('.') if s.strip()]
            for s in sentences:
                matches = sum(1 for kw in keywords if kw in s.lower())
                if matches > 0:
                    relevant_sentences.append((matches, s, doc_title))

        if relevant_sentences:
            relevant_sentences.sort(key=lambda x: x[0], reverse=True)
            top_findings = relevant_sentences[:3]
            answer_parts = [f"Based on **{src}**: \"{s}.\"" for _, s, src in top_findings]
            return " ".join(answer_parts)

        # First chunk snippet if keywords didn't directly match
        first = contexts[0]
        return f"Based on authorized source **{first.get('document_title')}**: {first.get('snippet')[:250]}..."

llm_service = LLMService()

