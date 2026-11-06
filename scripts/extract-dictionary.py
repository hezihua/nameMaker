#!/usr/bin/env python3
"""Extract 《简易起名字典》 into JSON for the nameMaker app."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

PDF = Path(
    "/mnt/c/Users/zhe/Documents/xwechat_files/wxid_yaeold910wpj22_245c/msg/file/2026-11/简易起名字典+好名李.pdf"
)
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "dictionary.json"

WUXING_ATTR = re.compile(r"^(金|木|水|火|土)属性\s*$")
STROKE_HDR = re.compile(r"^([一二三四五六七八九十百]+)画\s*$")
COMBO_HDR = re.compile(r"^(金|木|水|火|土)(金|木|水|火|土)组合\s*$")
CJK_ONE = re.compile(r"^[\u4e00-\u9fff]$")
TOC_LINE = re.compile(r"^[\u4e00-\u9fff]\.{3,}")

CN_NUM = {
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
}


def cn_strokes(s: str) -> int | None:
    if s in CN_NUM:
        return CN_NUM[s]
    if s == "十一":
        return 11
    if s == "十二":
        return 12
    if s == "十三":
        return 13
    if s == "十四":
        return 14
    if s == "十五":
        return 15
    if s == "十六":
        return 16
    if s == "十七":
        return 17
    if s == "十八":
        return 18
    if s == "十九":
        return 19
    if s == "二十":
        return 20
    return None


def clean_lines(text: str) -> list[str]:
    lines: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("《简易起名字典》") or line.startswith("好名李"):
            continue
        lines.append(line)
    return lines


def parse_pdf(path: Path) -> dict:
    reader = PdfReader(str(path))
    chars: dict[str, dict] = {}
    current_wx: str | None = None
    current_strokes: int | None = None
    current_char: str | None = None
    current_combo: str | None = None
    in_meaning = False

    def ensure_char(ch: str) -> dict:
        if ch not in chars:
            chars[ch] = {
                "char": ch,
                "wuxing": current_wx or "土",
                "strokes": current_strokes,
                "combinations": {},
            }
        rec = chars[ch]
        if current_wx:
            rec["wuxing"] = current_wx
        if current_strokes is not None:
            rec["strokes"] = current_strokes
        return rec

    for page in reader.pages[40:]:  # skip front matter / TOC
        for line in clean_lines(page.extract_text() or ""):
            if line == "其余吉字":
                current_char = None
                current_combo = None
                in_meaning = False
                continue

            m = WUXING_ATTR.match(line)
            if m:
                current_wx = m.group(1)
                current_strokes = None
                current_char = None
                current_combo = None
                in_meaning = False
                continue

            m = STROKE_HDR.match(line)
            if m:
                current_strokes = cn_strokes(m.group(1))
                continue

            m = COMBO_HDR.match(line)
            if m:
                current_combo = m.group(1) + m.group(2)
                in_meaning = False
                continue

            if line == "基本字义":
                in_meaning = True
                continue

            if in_meaning and not current_combo:
                if CJK_ONE.match(line):
                    current_char = line
                    ensure_char(line)
                    in_meaning = False
                continue

            if CJK_ONE.match(line) and not TOC_LINE.match(line):
                current_char = line
                ensure_char(line)
                current_combo = None
                in_meaning = False
                continue

            if current_char and current_combo:
                for token in line.split():
                    if len(token) < 2:
                        continue
                    if token[0] == current_char and len(token) == 2:
                        suffix = token[1]
                        if CJK_ONE.match(suffix):
                            rec = ensure_char(current_char)
                            rec["combinations"].setdefault(current_combo, []).append(
                                suffix
                            )
                    elif token.endswith(current_char) and len(token) == 2:
                        prefix = token[0]
                        if CJK_ONE.match(prefix):
                            rec = ensure_char(current_char)
                            rec["combinations"].setdefault(current_combo, []).append(
                                prefix
                            )

    # dedupe combination suffixes
    for rec in chars.values():
        for k, v in list(rec["combinations"].items()):
            rec["combinations"][k] = sorted(set(v))

    return {
        "source": "简易起名字典（好名李）",
        "charCount": len(chars),
        "chars": chars,
    }


def main() -> int:
    if not PDF.is_file():
        print(f"PDF not found: {PDF}", file=sys.stderr)
        return 1
    data = parse_pdf(PDF)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(f"Wrote {data['charCount']} chars -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
