# Aerovia MVP

A runnable airline-management vertical slice. It keeps a persistent local world state, validates an aircraft before scheduling, deducts operational costs, progresses flights on the server, and settles revenue at arrival.

## Run

```bash
npm start
```

Open `http://localhost:4173`. The first request creates `data/world.json`; this local runtime state is intentionally ignored by Git.

## Current scope

- One airline and one aircraft based at Palma (PMI).
- Route analysis for four destinations.
- Persistent flight states: scheduled, boarding, in flight, turnaround and completed.
- Ledger entries for capital, operational cost, and flight settlement.
- Accelerated flight duration of 90 seconds for development.

This is a server-backed MVP foundation, not yet the intended production architecture. PostgreSQL, authentication, multiplayer broadcasts, and a durable job queue are the next implementation stages.
