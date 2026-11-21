import re
import logging
from typing import Tuple, List, Dict

logger = logging.getLogger(__name__)

class DataSanitizerService:
    """
    Sensitive Data Identification & PII Redaction Scanner (Section IV.E).
    Scans ingested documents and outbound LLM generation to detect and mask
    credentials, API keys, cryptographic tokens, and high-risk PII.
    """

    def __init__(self):
        # High-risk patterns for redaction
        self.patterns = [
            # 1. AWS Access Keys
            (
                "AWS_ACCESS_KEY",
                re.compile(r"\b(AKIA[0-9A-Z]{16})\b"),
                "[REDACTED: AWS_ACCESS_KEY]"
            ),
            # 2. GitHub Personal Access Tokens
            (
                "GITHUB_TOKEN",
                re.compile(r"\b(ghp_[0-9a-zA-Z]{36})\b"),
                "[REDACTED: GITHUB_TOKEN]"
            ),
            # 3. Generic Bearer Tokens / API Secrets (>=24 alphanumeric)
            (
                "BEARER_TOKEN",
                re.compile(r"(?i)\b(Bearer\s+)([a-zA-Z0-9_\-\.]{24,})\b"),
                r"\1[REDACTED: API_TOKEN]"
            ),
            # 4. Private Cryptographic Keys
            (
                "PRIVATE_KEY",
                re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
                "[REDACTED: PRIVATE_KEY_BLOCK]"
            ),
            # 5. US Social Security Numbers (SSN)
            (
                "SSN",
                re.compile(r"\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b"),
                "[REDACTED: SSN]"
            ),
            # 6. Credit / Debit Cards (13-16 digits with common formats)
            (
                "CREDIT_CARD",
                re.compile(r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})(?:[\s-][0-9]{4})*\b"),
                "[REDACTED: PAYMENT_CARD]"
            ),
            # 7. Explicit Cleartext Password/Secret assignments in config
            (
                "PASSWORD_CONFIG",
                re.compile(r"(?i)\b(password|passwd|api_secret|client_secret)\s*[:=]\s*['\"]?([^\s'\"]{6,})['\"]?"),
                r"\1: [REDACTED: CREDENTIAL]"
            )
        ]

    def sanitize_text(self, text: str) -> Tuple[str, int, List[str]]:
        """
        Scans text, redacts sensitive tokens, and returns:
        (sanitized_text, total_redactions_count, categories_detected)
        """
        if not text:
            return text, 0, []

        sanitized = text
        total_redactions = 0
        categories_detected = []

        for category, pattern, replacement in self.patterns:
            matches = list(pattern.finditer(sanitized))
            if matches:
                count = len(matches)
                total_redactions += count
                categories_detected.append(category)
                sanitized = pattern.sub(replacement, sanitized)
                logger.info(f"[DATA_SANITIZER] Masked {count} instance(s) of {category}")

        return sanitized, total_redactions, categories_detected

sanitizer_service = DataSanitizerService()
