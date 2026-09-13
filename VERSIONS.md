# ROOM website versions

| Design | Location | Preservation |
| --- | --- | --- |
| Version 1 | `archive/versions/v1/` (offline) | Independent copy of the first validated static build |
| Version 2 | `archive/versions/v2/` (offline) | Protected Worker snapshot; source tagged `v2` |
| Version 3 | `/` (password required) | Current warm household design |

## Version 1 source

- Git tag: `v1`
- Full source commit: `09a2dbf41b0501d0ee42eb20b05de3229df97ec6`
- Snapshot directory: `archive/versions/v1/`
- Original snapshot index SHA-256: `c6624bd8cb12a7e013310c6731cea29f56c28fe305ec98ea3e7c4d6cc2eda4a7`
- Original Sites saved version: version 1

The snapshot was made before any version 2 source or styling edits. Its static assets, original PDF, fonts and JavaScript are self-contained. The snapshot is now outside the web assets and is excluded from every public deployment. It remains available locally for comparison. Do not run a new build directly into that directory.

To inspect the old source without changing the current working directory, use `git show v1:path/to/file`. To continue work from version 1, create a separate Git worktree from `v1`.

The shared current design uses server-side password protection and omits the manuscript download. All paper-sourced quantitative data remain unchanged. All archived versions and every PDF path return 404 even after password authentication.

## Version 2 source

- Git tag: `v2`
- Full source commit: `bbd1b037c3c4113a1e156241a41641fec516a5c9`
- Snapshot: `archive/versions/v2/room-v2-worker.tar.gz`

The snapshot contains the complete protected Worker and hosting manifest from the validated V2 build. Runtime secrets are external and are not included. It was saved before V3 implementation and is never packaged into the shared website.

## Version 3

V3 uses an inviting ROOM identity, a bright household photograph, cream and wood tones, a centered research introduction and a four-task gallery. The initial teal V3 remains in Git history at `88b8e8ffb964ef91471fea64dd843307430d73c0`. The scientific data, server-side password, asset protection and manuscript exclusion are retained. The existing shared password is unchanged.
