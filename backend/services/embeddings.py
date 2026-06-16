from fastembed import TextEmbedding

_model: TextEmbedding | None = None

# Short path avoids Windows long-path / symlink issues with deep user dirs
_CACHE_DIR = "C:\\fastembed_cache"


def get_embedder() -> TextEmbedding:
    """Lazy singleton — model download (~70MB) happens on first call, not import."""
    global _model
    if _model is None:
        _model = TextEmbedding("BAAI/bge-small-en-v1.5", cache_dir=_CACHE_DIR)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [e.tolist() for e in get_embedder().embed(texts)]
