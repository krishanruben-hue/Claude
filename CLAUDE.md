# CLAUDE.md — AI Assistant Guide

This file provides instructions and context for AI assistants (Claude Code and others) working in this repository. Keep this document accurate and up to date as the project evolves.

---

## Repository Overview

> **Status**: This repository is newly initialized. Update this section once the project purpose, technology stack, and structure are established.

| Field | Value |
|-------|-------|
| Project name | `Claude` |
| Owner | `krishanruben-hue` |
| Remote | `krishanruben-hue/Claude` |
| Primary language | _TBD_ |
| Framework / runtime | _TBD_ |

---

## Quick-Start Checklist

When first working in this repo, verify the following:

1. Confirm which branch to develop on (see [Branch Conventions](#branch-conventions))
2. Install dependencies (see [Setup](#setup))
3. Run the test suite to confirm a green baseline
4. Read any open issues or PR descriptions for context

---

## Directory Structure

```
Claude/
├── CLAUDE.md          # This file — AI assistant guide
├── README.md          # Human-facing project overview (create when project is defined)
└── .git/              # Git metadata
```

> Update this tree whenever significant directories or files are added.

---

## Setup

> Fill in the actual commands once the project stack is chosen.

```bash
# Example for a Node.js project
npm install

# Example for a Python project
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Example for a Rust project
cargo build
```

---

## Development Workflow

### Making Changes

1. **Always work on the designated branch** — never commit directly to `main` or `master` without explicit permission.
2. Read the relevant source files before editing them.
3. Keep changes focused — one logical concern per commit.
4. Run tests and linters before committing.

### Running Tests

> Fill in once a test framework is chosen.

```bash
# Examples — replace with actual commands
npm test
pytest
cargo test
go test ./...
```

### Linting and Formatting

> Fill in once linters/formatters are configured.

```bash
# Examples
npm run lint
ruff check . && ruff format .
cargo clippy && cargo fmt
```

---

## Branch Conventions

| Branch type | Pattern | Purpose |
|-------------|---------|---------|
| Claude AI work | `claude/<slug>` | Branches created by Claude Code sessions |
| Feature work | `feat/<short-description>` | New features |
| Bug fixes | `fix/<short-description>` | Bug fixes |
| Chores / docs | `chore/<short-description>` | Non-functional changes |

### Rules

- **Claude Code branches** must follow the pattern `claude/<slug>` where the slug ends with the session ID provided in the system prompt.
- Push with `-u` to set upstream: `git push -u origin <branch-name>`.
- Never force-push to `main`/`master`.
- Do not skip pre-commit hooks (`--no-verify`) unless explicitly instructed.

---

## Commit Message Style

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer / session URL]
```

**Types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`

**Examples**:
```
feat(auth): add JWT refresh token support
fix(api): handle null response from upstream service
docs: add CLAUDE.md with project conventions
chore(deps): upgrade eslint to v9
```

- Summary line: imperative mood, ≤72 characters, no trailing period.
- Body: explain *why*, not *what* (the diff shows what).
- Always append the Claude Code session URL in the footer when committing as an AI assistant.

---

## Code Style Conventions

> These are general defaults. Override with project-specific rules once the stack is decided.

### General

- Prefer clarity over cleverness.
- Avoid over-engineering — minimum complexity for the current task.
- Do not add comments to code that is self-evident; only comment non-obvious logic.
- Do not add docstrings, type annotations, or error handling to code you did not change.

### Security

- Never commit secrets, API keys, or credentials. Use environment variables.
- Validate all input at system boundaries (user input, external APIs).
- Be aware of OWASP Top 10 vulnerabilities (injection, XSS, broken auth, etc.).
- Do not generate or guess URLs unless confident they are correct.

### File Hygiene

- Do not create files unless absolutely necessary.
- Prefer editing existing files over creating new ones.
- Delete unused code rather than commenting it out or adding `_unused` suffixes.
- Do not add backwards-compatibility shims for removed code.

---

## Testing Conventions

> Update with project-specific patterns once established.

- Write tests for new features and bug fixes.
- Tests live alongside source code or in a dedicated `tests/` / `__tests__/` directory.
- Test file naming: `<module>.test.ts`, `test_<module>.py`, `<module>_test.go`, etc.
- Aim for deterministic, isolated unit tests; integration tests clearly labelled.
- A failing test suite must be fixed before merging.

---

## Pull Request Guidelines

When creating a PR as an AI assistant:

```markdown
## Summary
- <bullet point describing what changed and why>

## Test plan
- [ ] Tests pass (`<test command>`)
- [ ] Linter passes (`<lint command>`)
- [ ] Manually verified <specific behaviour>

<Claude Code session URL>
```

- Title: ≤70 characters, descriptive, imperative mood.
- Reference any related issues with `Closes #<issue-number>`.
- Request review from appropriate team members.

---

## Environment Variables

> Document required and optional environment variables here as they are introduced.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| _TBD_ | — | — | — |

Store secrets in a `.env` file (gitignored) locally, and in the CI/CD secrets store in production.

---

## CI / CD

> Fill in once CI is configured.

| Stage | Trigger | Command |
|-------|---------|---------|
| Lint | PR / push | _TBD_ |
| Test | PR / push | _TBD_ |
| Build | Push to main | _TBD_ |
| Deploy | Release tag | _TBD_ |

---

## AI-Specific Instructions

These rules apply specifically to Claude Code and other AI assistants:

1. **Read before editing** — always read a file before modifying it.
2. **Minimal changes** — only change what is necessary; do not refactor surrounding code opportunistically.
3. **No hallucinated URLs** — never fabricate links; only use URLs present in the codebase or provided by the user.
4. **Confirm before destructive actions** — deleting files, force-pushing, dropping data, or modifying CI pipelines requires explicit user approval.
5. **One task at a time** — use the TodoWrite tool to track progress on multi-step tasks; mark each item complete immediately after finishing it.
6. **Branch discipline** — always develop on the branch specified in the system prompt; never push to a different branch without permission.
7. **Session URL in commits** — append the Claude Code session URL to every commit footer.
8. **Ask when uncertain** — use AskUserQuestion rather than guessing when requirements are ambiguous.

---

## Maintenance

Update this file whenever:

- The tech stack or framework changes.
- New tooling (linters, test frameworks, CI) is added.
- Directory structure changes significantly.
- New conventions are agreed upon by the team.

---

*Last updated: 2026-03-09 | Auto-generated by Claude Code*
