# Extend Rowen

Rowen can be extend by your own, supports custom events and contexts.

## Custom events example

```ts
// rowen.config.ts
import { externalTask } from "./external-task.ts";}

export default rowenConfig(() => {
  return {
    // ...options,
    flows: async rowen => {
      rowen.on.beforeFetch(async ($) => {
        // emit events
        await rowen.emit("startDeploy", $, arg2);

        const exteranlCtx = $.ctx(externalTask.ctx);
        console.log(externalCtx); // => { status: "sokosoko fine" }
      });

      rowen.on.startDeploy(($, arg2) => {
        // startDeploy events
      });
    }
  }
})

//

declare module "@hanakla/rowen" {
  export interface ExtendedRowenEvents {
    startDeploy: [PilotLight, Arg2];
  }
```

## Custom context example

```ts
// externalTask.ts

const ctx = Symbol();
export const externalTask = {
  // Expose context key as unique symbol
  ctx: ctx as typeof ctx,
  beforeFetch: ($: PilotLight, arg2: Arg2) => {
    $.ctx.set(externalTask.ctx, { status: "sokosoko fine" });
  },
};

declare module "@hanakla/rowen" {
  export interface ExtendedRowenContexts {
    [externalTask.ctx]: { status: string };
  }
}
```

```ts
// rowen.config.ts
import { externalTask } from "./externalTask.ts";

export default rowenConfig(() => {
  return {
    // ...options,
    flows: async (rowen) => {
      rowen.on.beforeFetch(externalTask.beforeFetch);

      rowen.on.beforeFetch(async ($) => {
        // Get context by `externalTask.ctx`
        const exteranlCtx = $.ctx(externalTask.ctx);
        console.log(externalCtx); // => { status: "sokosoko fine" }
      });
    },
  };
});
```
