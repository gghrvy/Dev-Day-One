CHUNK_LINES = 60
OVERLAP_LINES = 10


def chunk_file(file_path: str, content: str) -> list[dict]:
    """Split file content into overlapping line-window chunks."""
    lines = content.splitlines()
    if not lines:
        return []
    chunks = []
    step = CHUNK_LINES - OVERLAP_LINES
    for start in range(0, len(lines), step):
        window = lines[start : start + CHUNK_LINES]
        chunks.append({
            "file_path": file_path,
            "content": "\n".join(window),
            "metadata": {"start_line": start + 1, "end_line": start + len(window)},
        })
        if start + CHUNK_LINES >= len(lines):
            break
    return chunks
