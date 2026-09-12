# ROOM design V2 — offline snapshot

`room-v2-worker.tar.gz` preserves the validated protected V2 build before V3 edits. Source tag: `v2`, commit `bbd1b037c3c4113a1e156241a41641fec516a5c9`.

The archive contains `dist/server/index.js` and `dist/.openai/hosting.json`. Runtime secrets are not embedded. Use the tagged source and the local preview adapter to inspect V2 independently; do not extract or build into the current deployment directory. This directory is excluded from all shared builds.
