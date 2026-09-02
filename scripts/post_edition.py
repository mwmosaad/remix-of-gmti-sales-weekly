#!/usr/bin/env python3
"""Publish a GMTI Fleet Intelligence edition to the newsletter site.

Copy this file into the gmti-fleet-intel repository (scripts/post_edition.py)
and add this step to .github/workflows/weekly.yml after "Build edition":

    - name: Publish edition to the newsletter site
      env:
        GMTI_INGEST_URL: https://project--1e2c0170-1b98-4683-bead-f4d0c1f3adc0.lovable.app/api/public/editions/ingest
        GMTI_INGEST_TOKEN: ${{ secrets.GMTI_INGEST_TOKEN }}
      run: python scripts/post_edition.py output/gmti-edition-*.json

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
