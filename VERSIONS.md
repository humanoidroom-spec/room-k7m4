# ROOM website versions

| Design | Location | Preservation |
| --- | --- | --- |
| Version 1 | `archive/versions/v1/` (offline) | Independent copy of the first validated static build |
| Version 2 | `/` (password required) | Current silver-blue design |

## Version 1 source

- Git tag: `v1`
- Full source commit: `09a2dbf41b0501d0ee42eb20b05de3229df97ec6`
- Snapshot directory: `archive/versions/v1/`
- Original snapshot index SHA-256: `c6624bd8cb12a7e013310c6731cea29f56c28fe305ec98ea3e7c4d6cc2eda4a7`
- Original Sites saved version: version 1

The snapshot was made before any version 2 source or styling edits. Its static assets, original PDF, fonts and JavaScript are self-contained. The snapshot is now outside the web assets and is excluded from every public deployment. It remains available locally for comparison. Do not run a new build directly into that directory.

To inspect the old source without changing the current working directory, use `git show v1:path/to/file`. To continue work from version 1, create a separate Git worktree from `v1`.

The shared V2 uses server-side password protection and omits the manuscript download. All paper-sourced quantitative data remain unchanged. V1 and every PDF path return 404 even after password authentication.
