#!/usr/bin/env python3
"""Parse cangjie5.dict.yaml and generate src/data/cangjieChars.ts."""

import re
import urllib.request
from pathlib import Path

DICT_URL = "https://raw.githubusercontent.com/rime/rime-cangjie/master/cangjie5.dict.yaml"
MAX_CHARS = 6000
OUTPUT = Path("src/data/cangjieChars.ts")

yaml_path = Path("/tmp/cangjie5.dict.yaml")

if not yaml_path.exists():
    print(f"Downloading {DICT_URL} ...")
    urllib.request.urlretrieve(DICT_URL, yaml_path)
    print("Downloaded.")

in_data = False
entries = []

with open(yaml_path, encoding="utf-8") as f:
    for line in f:
        line = line.rstrip("\n")
        if not in_data:
            if line == "...":
                in_data = True
            continue

        # data format: char \t code
        if not line or line.startswith("#"):
            continue

        parts = line.split("\t")
        if len(parts) < 2:
            continue

        char = parts[0]
        code = parts[1]

        # Skip entries with ' (phrase encoding marker)
        if "'" in code:
            continue

        # Code must be 1-5 lowercase a-z
        if not re.fullmatch(r"[a-z]{1,5}", code):
            continue

        entries.append((char, code))
        if len(entries) >= MAX_CHARS:
            break

print(f"Parsed {len(entries)} entries")

# Generate TypeScript file
lines = []
lines.append("export interface CodeEntry {")
lines.append("  char: string;")
lines.append("  code: string;")
lines.append("}")
lines.append("")
lines.append("export const CODE_CHARS: CodeEntry[] = [")

for char, code in entries:
    # Escape backslash and single quote
    escaped = char.replace("\\", "\\\\").replace("'", "\\'")
    lines.append(f"  {{ char: '{escaped}', code: '{code}' }},")

lines.append("];")
lines.append("")
lines.append(f"export const CODE_TOTAL = {len(entries)};")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Written to {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")
