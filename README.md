# rowen -狼煙-

An SSH deployment script kit, inspired by shipit.

## Get Started

1. Create `rowen.config.ts` at project root

   ```ts
   import Rowen, { rowenConfig } from "rowen";

   export default rowenConfig(() => {
     return {
       default: {
         repository: "user@repo.com/your-codes.git",
         deployTo: "~/product/",
       },
       envs: {
         staging: {
           servers: ["deploy@server"],
         },
         production: {
           servers: ["deploy@prod-1", "deploy@prod-2"],
         },
       },
     };
   });
   ```

2. Write deploy script

   ```ts
   import Rowen from "rowen";

   const rowen = await Rowen.init({ env: process.env.DEPLOY_TARGET });

   rowen.on.fetched(async ($) => {
     $.local`yarn install`;
     $.local`yarn build`;

     $.remotes`rm -rf ~/product/current`;
     $.copyToRemote($.workspace, "~/product/current");
     $.remotes`yarn start`;
   });

   rowen.on.deployed(async () => {
     notify("Deploy completed");
   });

   await rowen.fetch();
   await rowen.deploy();
   ```

## Presets

### presets.releases

Manage releases presets, likes `shipit-deploy`.

#### Usage

```ts
// rowen.config.ts
import { presets } from "rowen";

export default rowenConfig(() => {
  return {
    // ... options
    flows: async (rowen) => {
      rowen.on.caughtError(releases.caughtError());

      rowen.on.beforeFetch(
        releases.beforeFetch({
          sourceDir: "./",
          keepReleases: 2,
        })
      );

      rowen.on.buildStep(async ($) => {
        // building scripts write your own
      });

      rowen.on.syncStep(releases.syncStep());
    },
  };
});
```

#### Options on `releases.beforeFetch`

- _`sourceDir: string`_ Default `"."`. Copying directory path on local
- _`keepReleases: number`_ Default `10`. Number of past releases to keep on remote
- _`releasesPath: string`_ Default `"./releases"`. Directory path where all releases are located
- _`enableShared: boolean`_ Default `true`. If enabled, creates a `shared` directory to place files shared between releases

#### Remote directory structure

`presets.releases` makes directory structure likes below on remotes.

```
- deployToDir/
  - releases/
    - [releaseId]
  - shared/
```

## More details

### Rowen context

If deploy context/status you want, it can be get via `$.ctx` method.

```ts
rowenConfig(async () => {
  return {
    // ...options,
    flows: (rowen) => {
      rowen.on.beforeFetch(async ($) => {
        const context = $.ctx(Rowen.ctx);
        const releaseContext = $.ctx(presets.releases.ctx);
      });
    },
  };
});
```

### Extend Rowen

Rowen can be extend by your own, supports custom events and contexts.

#### Custom events example

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

#### Custom context example

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
