# RAG Rules

## Task-level status
- `green`: completed or not due soon.
- `amber`: due within 2 hours, or overdue but still within grace window.
- `red`: overdue beyond grace window.

## Room rollup
- If any room task is red, room is red.
- Else if any room task is amber, room is amber.
- Else room is green.

## Household rollup
- V1: use worst room status across all active rooms.
- V2: add weighted scoring by room priority and number of overdue jobs.
