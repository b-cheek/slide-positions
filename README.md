# React + Vite

## Optimizing slide-path weights

The slide-path calculation requires a `Weights` value. The current behavior is
available as `REFERENCE_WEIGHTS`. Application callers use the centralized
`ACTIVE_WEIGHTS` variable in `src/plotting/processing/types/weights.ts`, which
can be switched to another exported weight set.

To search for weights that produce editable ideal outputs, update
`IDEAL_CASES` and `REFERENCE_WEIGHT_RANGES` in
`src/plotting/processing/utils/weightOptimization.ts`, then run:

```sh
npm run optimize:weights
```

Each ideal case specifies raw parsed plot inputs such as `notesString` and
`valvesString`, plus the expected note, partial, tuning, and optionally slide
position for each selected output. The command randomly tries weights within
the configured ranges, up to its attempt limit. It retains the best candidate
using a lexicographic score: wrong, missing, or extra path entries first;
partial/tuning mismatches second; and slide-position error third. It prints the
candidate weights, score, and per-case mismatches. This makes incorrect or
incompatible golden cases diagnosable instead of producing only a generic
failure.

The command also writes the selected best candidate to
`src/plotting/processing/utils/optimizedWeights.json`. The application imports
that file for `OPTIMIZED_WEIGHTS`, so running the command automatically updates
the optimized set used when `ACTIVE_WEIGHTS` points to it.

The optimizer has a strict mode in its API for workflows that require an exact
solution. Best-effort mode is useful while developing cases because it returns
the closest candidate even when no exact set exists.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
