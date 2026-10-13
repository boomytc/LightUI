# GenUI contract

Machine-readable catalog of native components an external agent may emit.
The current protocol version is **v0**.

LightAgent reads this directory from disk. It does not import the TypeScript
registry, and the implementation must not generate these files at export time.

## Layout

```
contract/v0/components.json
```

`components.json` fields:

| Field | Rule |
| --- | --- |
| `protocol` | Always `lightui.genui`. |
| `version` | The directory name (`v0`). Must match `PROTOCOL_VERSION` in `src/registry.ts`. |
| `components` | Native components. `name` is PascalCase and unique. |
| `components[].props` | JSON Schema draft 2020-12 for that component's props. `type` is `object`, `additionalProperties` is `false`. |

## Version rules

- The version is the directory name. Consumers pin `contract/<version>/`.
- **v0** may grow in place only by adding a component or an optional property.
- Removing or renaming a component, changing a property's type, or turning an
  optional property into a required one is a new directory (`contract/v1/`).
  Leave the published version's files as they were.
- `src/registry.ts` is the implementation copy of the current version. `npm test`
  fails when that registry and `contract/<PROTOCOL_VERSION>/components.json`
  disagree. Do not satisfy the test by importing the JSON into the registry.
