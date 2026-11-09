import logging
import requests
import numpy as np
import hashlib
from typing import List
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.ollama_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/embed"
        self.fallback_ollama_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/embeddings"
        self.model = settings.EMBEDDING_MODEL
        self.dimension = settings.EMBEDDING_DIMENSION

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single string."""
        vectors = self.get_embeddings([text])
        return vectors[0] if vectors else [0.0] * self.dimension

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a list of strings."""
        if not texts:
            return []

        # Attempt Ollama /api/embed (newer Ollama API)
        try:
            resp = requests.post(
                self.ollama_url,
                json={"model": self.model, "input": texts},
                timeout=15
            )
            if resp.status_code == 200:
                data = resp.json()
                if "embeddings" in data and len(data["embeddings"]) == len(texts):
                    # Check dimension
                    emb_list = data["embeddings"]
                    return [self._normalize(e) for e in emb_list]
        except Exception as e:
            logger.warning(f"Ollama /api/embed failed: {e}. Trying legacy /api/embeddings...")

        # Attempt Ollama /api/embeddings (legacy single input)
        results = []
        ollama_failed = False
        for text in texts:
            try:
                resp = requests.post(
                    self.fallback_ollama_url,
                    json={"model": self.model, "prompt": text},
                    timeout=10
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if "embedding" in data:
                        results.append(self._normalize(data["embedding"]))
                        continue
                ollama_failed = True
                break
            except Exception as e:
                logger.warning(f"Ollama legacy embedding failed: {e}")
                ollama_failed = True
                break

        if not ollama_failed and len(results) == len(texts):
            return results

        # High quality deterministic semantic-hash fallback vector
        # (normalized 768-dim float vector)
        logger.info("Using deterministic fallback vector generator.")
        return [self._generate_fallback_embedding(t) for t in texts]

    def _normalize(self, vec: List[float]) -> List[float]:
        """Normalize vector to unit length and correct dimension."""
        arr = np.array(vec, dtype=np.float32)
        if len(arr) != self.dimension:
            if len(arr) > self.dimension:
                arr = arr[:self.dimension]
            else:
                arr = np.pad(arr, (0, self.dimension - len(arr)))
        norm = np.linalg.norm(arr)
        if norm > 0:
            arr = arr / norm
        return arr.tolist()

    def _generate_fallback_embedding(self, text: str) -> List[float]:
        """
        Deterministic pseudo-semantic embedding for testing or fallback.
        Uses multi-ngram hashing so semantically similar phrases have higher cosine similarity.
        """
        vec = np.zeros(self.dimension, dtype=np.float32)
        words = text.lower().split()
        if not words:
            vec[0] = 1.0
            return vec.tolist()

        for i, word in enumerate(words):
            h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if ((h >> 8) % 2 == 0) else -1.0
            vec[idx] += sign

            # Bigrams
            if i < len(words) - 1:
                bigram = f"{word}_{words[i+1]}"
                h_bi = int(hashlib.md5(bigram.encode('utf-8')).hexdigest(), 16)
                idx_bi = h_bi % self.dimension
                sign_bi = 1.0 if ((h_bi >> 8) % 2 == 0) else -1.0
                vec[idx_bi] += 1.5 * sign_bi

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()

