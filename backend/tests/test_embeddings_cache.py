import tempfile

from services.embeddings import default_cache_dir


def test_linux_cache_dir_uses_temp_dir_not_windows_path():
    path = default_cache_dir("posix", {})
    assert path != "C:\\fastembed_cache"
    assert path.startswith(tempfile.gettempdir())


def test_windows_keeps_short_cache_path():
    assert default_cache_dir("nt", {}) == "C:\\fastembed_cache"


def test_env_var_overrides_default():
    assert default_cache_dir("posix", {"FASTEMBED_CACHE_DIR": "/data/fe"}) == "/data/fe"
