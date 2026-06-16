from services.code_chunker import CHUNK_LINES, OVERLAP_LINES, chunk_file


def test_empty_file_yields_no_chunks():
    assert chunk_file("a.py", "") == []


def test_short_file_yields_single_chunk():
    content = "line1\nline2\nline3"
    chunks = chunk_file("a.py", content)
    assert len(chunks) == 1
    assert chunks[0]["content"] == content
    assert chunks[0]["file_path"] == "a.py"
    assert chunks[0]["metadata"] == {"start_line": 1, "end_line": 3}


def test_long_file_chunks_with_overlap():
    lines = [f"line{i}" for i in range(1, 121)]  # 120 lines
    chunks = chunk_file("b.py", "\n".join(lines))
    assert len(chunks) == 3  # 1-60, 51-110, 101-120 (step = 60-10 = 50)
    assert chunks[0]["metadata"] == {"start_line": 1, "end_line": 60}
    assert chunks[1]["metadata"] == {"start_line": 51, "end_line": 110}
    assert chunks[2]["metadata"] == {"start_line": 101, "end_line": 120}
    # overlap: last OVERLAP_LINES of chunk 0 == first OVERLAP_LINES of chunk 1
    tail = chunks[0]["content"].splitlines()[-OVERLAP_LINES:]
    head = chunks[1]["content"].splitlines()[:OVERLAP_LINES]
    assert tail == head


def test_exact_chunk_size_single_chunk():
    lines = [f"l{i}" for i in range(CHUNK_LINES)]
    chunks = chunk_file("c.py", "\n".join(lines))
    assert len(chunks) == 1
