# User Preferences & Persona

## Identity
*   **Role**: Product Owner / Domain Expert.
*   **Technical Level**: Non-programmer.
*   **Code Review Policy**: **NEVER**. The user does not read code. Code means nothing to them.

## Communication Guidelines
1.  **Plain Language**: Explain *outcomes* and *features*, not functions and variables.
    *   *Bad*: "I refactored the `useIPSEngine` hook to fix the circular dependency."
    *   *Good*: "I fixed the logic error that was causing the app to crash when calculating rebalancing."
2.  **Hide the Plumbing**: Do not ask for code reviews. Do not explain implementation details unless explicitly asked.

## Workflow Rules
1.  **Auto-Commit**: You are authorized to auto-commit and push changes when you feel it is appropriate. Do not ask for permission for routine saves.
2.  **Scaffolding Alerts**: If the codebase is missing critical infrastructure (tests, build scripts, documentation) that puts the project at risk, **notify the user immediately**.
