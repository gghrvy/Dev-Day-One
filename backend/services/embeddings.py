import os
import tempfile
from collections.abc import Mapping

from fastembed import TextEmbedding

_model: TextEmbedding | None = None


def default_cache_dir(os_name: str = os.name, env: Mapping[str, str] = os.environ) -> str:
    if env.get("FASTEMBED_CACHE_DIR"):
        return env["FASTEMBED_CACHE_DIR"]
    # Short path avoids Windows long-path / symlink issues with deep user dirs
    if os_name == "nt":
        return "C:\\fastembed_cache"
    return os.path.join(tempfile.gettempdir(), "fastembed_cache")


def get_embedder() -> TextEmbedding:
    """Lazy singleton — model download (~70MB) happens on first call, not import."""
    global _model
    if _model is None:
        _model = TextEmbedding("BAAI/bge-small-en-v1.5", cache_dir=default_cache_dir())
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [e.tolist() for e in get_embedder().embed(texts)]
