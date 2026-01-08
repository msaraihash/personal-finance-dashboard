---
description: Wrap up the coding session: verify, update docs, and commit.
---

1. Check the git status.
   ```bash
   git status
   ```


2. Review the contents of the `.agent/` directory.
   - **MUST** update `project_state.md` to reflect the latest progress (Roadmap/Focus).
   - Check `project_context.md` for architectural changes.
   - Check `coding_standards.md`, `architecture.md`, or `user_preferences.md` if new patterns or rules were established.


4. Run the full verification suite to ensure we aren't committing broken code.
   ```bash
   npm run lint && npm test
   ```

5. Stage all changes.
   // turbo
   ```bash
   git add .
   ```

6. Generate a concise, conventional commit message summarizing the session (e.g., `feat: implement philosophy engine scoring`, `docs: update roadmap for phase 4`).

7. Commit the changes.
   ```bash
   git commit -m "<YOUR_GENERATED_MESSAGE>"
   ```
