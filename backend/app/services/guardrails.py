import re
import logging
from typing import NamedTuple, Optional, List, Tuple

logger = logging.getLogger(__name__)

class GuardrailResult(NamedTuple):
    is_safe: bool
    category: Optional[str] = None
    matched_pattern: Optional[str] = None
    reason: Optional[str] = None

class InputGuardrailService:
    """
    Pre-Retrieval Input Security & Prompt Injection Guardrail (Section IV.D, IV.F).
    Intercepts adversarial prompt injections, jailbreaks, and system overrides
    BEFORE vector database retrieval occurs.
    """

    def __init__(self):
        # Categorized adversarial patterns compiled for sub-millisecond execution
        self.rules: List[Tuple[str, str, re.Pattern]] = [
            # 1. Direct Instruction Overrides
            (
                "INSTRUCTION_OVERRIDE",
                "Instruction override or rule cancellation attempt",
                re.compile(
                    r"(?i)\b("
                    r"ignore\s+(all\s+)?(previous|prior|above|former)\s+(instructions|prompts|rules|guidelines)|"
                    r"disregard\s+(all\s+)?(previous|prior|above|safety|security)\s+(instructions|rules|prompts|guidelines)|"
                    r"forget\s+(all\s+)?(previous|prior|above|system)\s+(instructions|rules|prompts)|"
                    r"reset\s+(all\s+)?(instructions|rules|system\s+prompts)|"
                    r"do\s+not\s+follow\s+any\s+(previous|prior|system)\s+rules"
                    r")\b"
                )
            ),
            # 2. System Prompt & Context Exfiltration
            (
                "SYSTEM_PROMPT_EXFILTRATION",
                "System prompt or internal context extraction attempt",
                re.compile(
                    r"(?i)\b("
                    r"(reveal|print|show|output|dump|repeat|display|leak)\s+(the\s+|your\s+)?(system\s+prompt|developer\s+prompt|initial\s+prompt|hidden\s+instructions|system\s+instructions)|"
                    r"what\s+(is|are)\s+your\s+(exact\s+)?(system\s+prompt|hidden\s+instructions|developer\s+instructions)|"
                    r"dump\s+(all\s+)?(documents|chunks|database|memory|contexts)\s+in\s+memory|"
                    r"print\s+entire\s+prompt\s+above"
                    r")\b"
                )
            ),
            # 3. Adversarial Jailbreak Personas & Parameter Overrides
            (
                "JAILBREAK_ATTEMPT",
                "Adversarial jailbreak or unconstrained persona activation",
                re.compile(
                    r"(?i)\b("
                    r"dan\s+mode|you\s+are\s+now\s+dan|do\s+anything\s+now|"
                    r"developer\s+mode\s+(enabled|activated)|"
                    r"unrestricted\s+(ai|assistant|mode)|"
                    r"bypass\s+(all\s+)?(safety|security|policy|restrictions)|"
                    r"act\s+as\s+(an\s+unfiltered|an\s+unrestricted|a\s+rogue)\s+ai|"
                    r"override\s+(security|authorization|tenant)\s+parameters"
                    r")\b"
                )
            ),
            # 4. Context Delimiter & Provenance Hijacking
            (
                "DELIMITER_HIJACKING",
                "RAG context delimiter or structural tag injection",
                re.compile(
                    r"(?i)("
                    r"---\s*\[source\s*\d+:.*\]\s*---|\[system\s+instruction\]|<\/system>|<system>|"
                    r"\[admin_override\]|\[authorized_context\]|\[authorized_evidence\]"
                    r")"
                )
            )
        ]

    def validate_query(self, query: str) -> GuardrailResult:
        """
        Validates query string against adversarial prompt injection rules.
        Returns GuardrailResult with evaluation verdict.
        """
        if not query:
            return GuardrailResult(is_safe=True)

        clean_query = query.strip()

        for category, description, pattern in self.rules:
            match = pattern.search(clean_query)
            if match:
                matched_snippet = match.group(0)
                logger.warning(
                    f"[GUARDRAIL_BLOCKED] Category={category} Pattern='{matched_snippet}' Query='{clean_query[:100]}'"
                )
                return GuardrailResult(
                    is_safe=False,
                    category=category,
                    matched_pattern=matched_snippet,
                    reason=f"Security Guardrail Alert: Intercepted {description} ('{matched_snippet}'). Access blocked prior to vector search."
                )

        return GuardrailResult(is_safe=True)

guardrail_service = InputGuardrailService()
