# Scripting to remotes

```ts
import Rowen from "rowen";

Rowen.script({ env: "staging", verbose: true }, ($) => {
  $.remote`hostname`;
});
```
