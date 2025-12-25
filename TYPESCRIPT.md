# TypeScript Documentation - DapsiWow

## Configuration
This project uses **Strict TypeScript** configuration to ensure high code quality and reliability. Key features enabled in `tsconfig.json`:
- `strict: true`: Enables all strict type-checking options.
- `noImplicitAny: true`: Prevents variables from defaulting to `any`.
- `strictNullChecks: true`: Ensures null/undefined are handled explicitly.

## Shared Type Interfaces
All core type definitions and interfaces are centralized for consistency:

- **General Calculator Types**: `client/src/types/calculator.types.ts`
  - Interfaces for generic inputs, results, and common structures (YearlyBreakdown, WhatIfScenario).
- **Health-Specific Types**: `client/src/types/health-tool.types.ts`
  - Enums and interfaces for health tools (UnitSystem, Gender, ActivityLevel).
- **Text-Specific Types**: `client/src/types/text-tool.types.ts`
  - Interfaces for text processing results and options.

## Typing Conventions for New Tools
When adding new tools or calculators, follow these patterns:

1.  **Define Interfaces**: Create specific input/result interfaces in the appropriate `types/` file.
    ```typescript
    export interface NewToolInputs extends BaseInputs { ... }
    export interface NewToolResult extends BaseResult { ... }
    ```
2.  **Use Generic Function Types**: Define a calculator function type using the generic `CalculatorFunction<T>`.
    ```typescript
    export type NewToolFunction = CalculatorFunction<NewToolResult>;
    ```
3.  **Engine Implementation**: Implement the logic in a separate engine file (`client/src/lib/calculators/`).
4.  **Component Integration**: Use the defined types in React components for state and props.
    ```typescript
    const [result, setResult] = useState<NewToolResult | null>(null);
    ```

## Local Type Checking
To run the TypeScript compiler and check for errors across the entire project, use:

```bash
npm run check
```

This runs `tsc` and will report any violations of the strict type policy. It is recommended to run this before any major refactor or deployment.