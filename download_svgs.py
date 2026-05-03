#!/usr/bin/env python3
"""Download Cangjie auxiliary shape SVGs from Wikimedia Commons."""

import os
import re
import sys
import time
import urllib.request
from pathlib import Path

DATA_DIR = Path("public/data")
URL_CACHE = Path("/tmp/svg-urls.txt")
DELAY = 8
USER_AGENT = "CangjieBot/1.0 (https://github.com)"

if not URL_CACHE.exists():
    print(f"ERROR: URL cache not found at {URL_CACHE}")
    sys.exit(1)

url_map = {}
with open(URL_CACHE) as f:
    for line in f:
        line = line.strip()
        if "\t" in line:
            filename, url = line.split("\t", 1)
            url_map[filename] = url

print(f"Loaded {len(url_map)} URLs")

# classify by key
key_patterns = [
    (r"^cjrm-([a-z])\d+[a-z]?\.svg$", 1),
    (r"^cjem-([a-z])\d+-\d+\.svg$", 1),
    (r"^cjr5m-([a-z])\d+\.svg$", 1),
    (r"^cjem-5([a-z])-\d+\.svg$", 1),
]

files_by_key = {}
skipped = 0
for filename in url_map:
    fname_lower = filename.lower()
    key = None
    for pattern, group in key_patterns:
        m = re.match(pattern, fname_lower)
        if m:
            key = m.group(group).upper()
            break
    if not key or key < "A" or key > "Y":
        skipped += 1
        continue
    files_by_key.setdefault(key, []).append(filename)

for k in sorted(files_by_key):
    files_by_key[k].sort()

total = sum(len(v) for v in files_by_key.values())
print(f"Files to download: {total} (skipped: {skipped})")

for k in sorted(files_by_key):
    (DATA_DIR / k).mkdir(parents=True, exist_ok=True)

done = skip = fail = 0

for key in sorted(files_by_key):
    for filename in files_by_key[key]:
        target = DATA_DIR / key / filename
        if target.exists():
            skip += 1
            continue

        url = url_map[filename]
        attempt = 0
        ok = False
        while attempt < 5:
            try:
                r = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
                with urllib.request.urlopen(r, timeout=30) as resp:
                    if resp.status == 200:
                        target.write_bytes(resp.read())
                        ok = True
                        done += 1
                        break
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    wait = (attempt + 1) * 10
                    if attempt == 0:
                        print(f"  [429] rate limit, wait {wait}s ({key}/{filename})")
                    time.sleep(wait)
                    attempt += 1
                    continue
                else:
                    print(f"  [HTTP {e.code}] {key}/{filename}")
                    break
            except Exception as e:
                print(f"  [err] {key}/{filename}: {e}")
                break
            attempt += 1

        if not ok:
            fail += 1
            if target.exists():
                target.unlink()

        if (done + skip) % 20 == 0 and done > 0:
            print(f"  ... {done + skip}/{total} (ok:{done} skip:{skip} fail:{fail})")

        time.sleep(DELAY)

print(f"\nDone! ok:{done} skip:{skip} fail:{fail}")

for k in sorted(files_by_key):
    d = DATA_DIR / k
    if d.is_dir():
        count = len(list(d.glob("*.svg")))
        print(f"  {k}/: {count} files")
