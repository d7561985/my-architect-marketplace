#!/usr/bin/env bash
# Deterministic giant-log fixture with 12 seeded needles.
# Usage: gen-fixture.sh <outfile> [lines]   (600000 lines ~= 55-60 MB)
set -euo pipefail
OUT="${1:?usage: gen-fixture.sh <outfile> [lines]}"
LINES="${2:-600000}"
awk -v total="$LINES" 'BEGIN {
  split("auth billing catalog gateway search", svc, " ")
  split("INFO DEBUG WARN", lvl, " ")
  # 12 needles, deterministic positions as fractions of total:
  # A: 4x PANIC ledger drift; B: 5-step suspicious session; C: 3x unsafe config override
  pa[1]=int(total*0.043); pa[2]=int(total*0.317); pa[3]=int(total*0.564); pa[4]=int(total*0.881)
  pb[1]=int(total*0.096); pb[2]=int(total*0.278); pb[3]=int(total*0.502); pb[4]=int(total*0.719); pb[5]=int(total*0.933)
  pc[1]=int(total*0.155); pc[2]=int(total*0.611); pc[3]=int(total*0.842)
  split("login elevate-privileges export-full-dump wipe-audit-trail logout", act, " ")
  for (i = 1; i <= total; i++) {
    ts = sprintf("2026-06-%02dT%02d:%02d:%02d", 1+i%28, i%24, i%60, (i*7)%60)
    printed = 0
    for (k=1; k<=4; k++) if (i==pa[k]) { printf "%s ERROR [payment-reconciler] PANIC: ledger drift detected txn=TXN-%04d\n", ts, k*1111; printed=1 }
    for (k=1; k<=5; k++) if (i==pb[k]) { printf "%s WARN [session-monitor] sess-77f3a9 action=%s\n", ts, act[k]; printed=1 }
    for (k=1; k<=3; k++) if (i==pc[k]) { printf "%s INFO [config-loader] override accepted: feature_flag=UNSAFE_DIRECT_WRITE source=env slot=%d\n", ts, k; printed=1 }
    if (!printed) printf "%s %s [%s] request rid=%d handled in %dms status=200\n", ts, lvl[1+i%3], svc[1+i%5], i, (i*13)%900
  }
}' > "$OUT"
wc -lc "$OUT"
