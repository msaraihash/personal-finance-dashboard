---
description: Verify CSV Parsers using Unit Tests
---

# Verify CSV Parsers

The browser-based approach can be slow. Use unit tests for fast feedback.

## Run all parser tests

```bash
npm test src/services/csvParsers/
```

## Run specific parser test

```bash
npm test src/services/csvParsers/wealthsimpleCardParser.test.ts
```

## Watch mode

Vitest runs in watch mode by default. Press `q` to exit.
