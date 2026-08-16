#!/usr/bin/env python3
"""Fetch the Medium RSS feed and write it to static/assets/data/blog-posts.json."""

import json
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

MEDIUM_USER = "@abhishek.mondal0202"
FEED_URL = f"https://medium.com/feed/{MEDIUM_USER}"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "static" / "assets" / "data" / "blog-posts.json"
CONTENT_NS = {"content": "http://purl.org/rss/1.0/modules/content/"}


def fetch_feed(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (portfolio-blog-sync)"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def parse_items(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    items = []
    for item in root.findall("./channel/item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub_date = (item.findtext("pubDate") or "").strip()
        description = item.findtext("content:encoded", namespaces=CONTENT_NS)
        if not description:
            description = item.findtext("description") or ""
        if not title or not link:
            continue
        items.append({
            "title": title,
            "link": link,
            "pubDate": pub_date,
            "description": description,
        })
    return items


def main() -> int:
    try:
        xml_bytes = fetch_feed(FEED_URL)
        items = parse_items(xml_bytes)
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to fetch/parse Medium feed: {exc}", file=sys.stderr)
        return 1

    if not items:
        print("No items found in feed; leaving existing file untouched.", file=sys.stderr)
        return 1

    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "items": items,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} post(s) to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
