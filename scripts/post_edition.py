#!/usr/bin/env python3
"""Publish a GMTI Fleet Intelligence edition to the newsletter site.

Copy this file into the gmti-fleet-intel repository (scripts/post_edition.py),
and copy scripts/weekly.yml from the site repo over
.github/workflows/weekly.yml — it schedules the build + publish for every
Monday at 08:00 New York time (EST/EDT) and includes this publish step.

The endpoint upserts on week_ending, so re-running a week is safe.
"""

import glob
import json
import os
import sys
import urllib.error
import urllib.request

def main() -> int:
    patterns = sys.argv[1:] or ["output/gmti-edition-*.json"]
    paths = sorted({p for pattern in patterns for p in glob.glob(pattern)})
    if not paths:
        print(f"no edition file matched {patterns}", file=sys.stderr)
        return 1

    url = os.environ["GMTI_INGEST_URL"]
    token = os.environ["GMTI_INGEST_TOKEN"]

    for path in paths:
        with open(path, "rb") as handle:
            payload = json.load(handle)

        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-GMTI-Token": token},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                print(path, response.status, response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            print(path, error.code, error.read().decode("utf-8"), file=sys.stderr)
            return 1

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
