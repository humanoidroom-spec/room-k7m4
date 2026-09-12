# ROOM website versions

| Design | Location | Preservation |
| --- | --- | --- |
| Version 1 | `/versions/v1/` | Independent copy of the first validated static build |
| Version 2 | `/` | Current silver-blue design |

## Version 1 source

- Git tag: `v1`
- Full source commit: `09a2dbf41b0501d0ee42eb20b05de3229df97ec6`
- Snapshot directory: `public/versions/v1/`
- Original snapshot index SHA-256: `c6624bd8cb12a7e013310c6731cea29f56c28fe305ec98ea3e7c4d6cc2eda4a7`
- Original Sites saved version: version 1

The snapshot was made before any version 2 source or styling edits. Its static assets, original PDF, fonts and JavaScript are self-contained. The current build copies this directory unchanged, preserving the first design for comparison. Do not run a new build directly into that directory.

To inspect the old source without changing the current working directory, use `git show v1:path/to/file`. To continue work from version 1, create a separate Git worktree from `v1`.

Version 2 changes visual presentation and hero composition; all paper-sourced quantitative data remain in `src/data/project.ts` unchanged.
