#!/usr/bin/env python3
"""Parse cangjie5.dict.yaml, merge with frequency data, and generate src/data/cangjieChars.ts."""

import json
import re
import time
import urllib.request
from pathlib import Path

DICT_URL = "https://raw.githubusercontent.com/rime/rime-cangjie/master/cangjie5.dict.yaml"
FREQ_JD_URL = "https://lingua.mtsu.edu/chinese-computing/statistics/char/download.php?Which=MO"
FREQ_ZHIHU_URL = "https://raw.githubusercontent.com/forfudan/chinese-characters-frequency/main/tables/%E5%85%AD%E5%84%84%E7%9F%A5%E4%B9%8E%E8%AA%9E%E6%96%99%E9%80%9A%E8%A6%8F%E6%BC%A2%E5%AD%97%E5%AD%97%E9%A0%BB%E8%A1%A8.csv"
FREQ_FANTI_MAP_URL = "https://raw.githubusercontent.com/jaywcjlove/table-of-general-standard-chinese-characters/main/data/traditional.convert.json"
MAX_CHARS = 6000
OUTPUT = Path("src/data/cangjieChars.ts")

UA = "CangjieBot/1.0"


def fetch(url, encoding=None):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                if encoding:
                    return data.decode(encoding)
                return data.decode("utf-8")
        except Exception as e:
            print(f"  Retry {attempt+1}/3 for {url}: {e}")
            time.sleep(5)
    raise RuntimeError(f"Failed to fetch {url}")


def load_junda_freq():
    """Load Jun Da Modern Chinese frequency list. Returns {char: frequency}."""
    print("Loading Jun Da frequency list ...")
    text = fetch(FREQ_JD_URL, encoding="gb18030")
    freq = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("/*"):
            continue
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        try:
            char = parts[1]
            f = int(parts[2])
            if char and len(char) == 1:
                freq[char] = f
        except (ValueError, IndexError):
            continue
    print(f"  Loaded {len(freq)} characters")
    return freq


def load_zhihu_freq():
    """Load Chinese character frequency from Zhihu corpus (600M chars)."""
    print("Loading Zhihu frequency list ...")
    try:
        text = fetch(FREQ_ZHIHU_URL, encoding="utf-8")
    except RuntimeError:
        print("  Unavailable, skipping")
        return {}
    freq = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "char" in line.lower():
            continue
        parts = line.replace(",", "\t").split("\t")
        if len(parts) >= 2:
            char = parts[0].strip().strip('"')
            try:
                f = int(parts[1].strip().strip('"'))
                if len(char) == 1:
                    freq[char] = f
            except (ValueError, IndexError):
                continue
    print(f"  Loaded {len(freq)} characters")
    return freq


# --- Load or cache frequency data ---
freq_cache = Path("/tmp/cangjie-freq-cache.txt")
if freq_cache.exists():
    freq = {}
    with open(freq_cache) as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) == 2:
                freq[parts[0]] = int(parts[1])
    print(f"Loaded {len(freq)} characters from frequency cache")
else:
    jd = load_junda_freq()
    zhihu = load_zhihu_freq()

    # Load traditional-to-simplified mapping for cross-referencing
    print("Loading traditional-to-simplified mapping ...")
    try:
        fanti_text = fetch(FREQ_FANTI_MAP_URL, encoding="utf-8")
        fanti_map = json.loads(fanti_text)
        print(f"  Loaded {len(fanti_map)} mappings")
    except (RuntimeError, json.JSONDecodeError) as e:
        print(f"  Unavailable ({e}), skipping")
        fanti_map = {}

    # Build frequency map
    freq = {}
    all_chars = set(jd) | set(zhihu)
    for char in all_chars:
        jd_f = jd.get(char, 0)
        zh_f = zhihu.get(char, 0)
        freq[char] = max(jd_f, zh_f)

    # Extend frequency to traditional characters via simplified equivalents
    extended = 0
    for tc, sc in fanti_map.items():
        sc_freq = freq.get(sc, 0)
        if sc_freq > 0:
            old = freq.get(tc, 0)
            if sc_freq > old:
                freq[tc] = sc_freq
                extended += 1
    print(f"  Extended frequency to {extended} traditional characters")

    print(f"Merged {len(freq)} unique characters with frequency data")

    with open(freq_cache, "w") as f:
        for char, score in sorted(freq.items(), key=lambda x: -x[1]):
            f.write(f"{char}\t{score}\n")
    print(f"Saved frequency cache to {freq_cache}")


# --- Load Cangjie dictionary ---
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
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        char = parts[0]
        code = parts[1]
        if "'" in code:
            continue
        if not re.fullmatch(r"[a-z]{1,5}", code):
            continue
        entries.append((char, code))

print(f"Parsed {len(entries)} Cangjie entries")

# --- Sort by frequency (default for unknown chars) ---
DEFAULT_FREQ = 500
entries.sort(key=lambda x: -freq.get(x[0], DEFAULT_FREQ))

# --- Apply manual fixes for known incorrect codes ---
FIXES = {
    "聚": "seoho",
}

for char, correct_code in FIXES.items():
    for i, (c, code) in enumerate(entries):
        if c == char:
            if code != correct_code:
                print(f"  Fixing {char}: {code} → {correct_code}")
            entries[i] = (char, correct_code)

# --- Deduplicate: keep first occurrence for each character ---
seen = set()
entries = [e for e in entries if e[0] not in seen and not seen.add(e[0])]

# --- Take top MAX_CHARS ---
entries = entries[:MAX_CHARS]
print(f"Selected top {len(entries)} by frequency")

# Show sample
print("  Top 20:")
for char, code in entries[:20]:
    print(f"    {char} {code} (freq: {freq.get(char, 0)})")
print("  Bottom 10:")
for char, code in entries[-10:]:
    print(f"    {char} {code} (freq: {freq.get(char, 0)})")


# --- Generate TypeScript ---
lines = []
lines.append("export interface CodeEntry {")
lines.append("  char: string;")
lines.append("  code: string;")
lines.append("}")
lines.append("")
lines.append("export const CODE_CHARS: CodeEntry[] = [")

for char, code in entries:
    escaped = char.replace("\\", "\\\\").replace("'", "\\'")
    lines.append(f"  {{ char: '{escaped}', code: '{code}' }},")

lines.append("];")
lines.append("")
lines.append(f"export const CODE_TOTAL = {len(entries)};")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Written to {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")
