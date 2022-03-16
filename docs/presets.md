# Presets

## `presets.releases`

Manage releases presets, likes `shipit-deploy`.

### Usage

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

### Options on `releases.beforeFetch`

- _`sourceDir: string`_ Default `"."`. Copying directory path on local
- _`keepReleases: number`_ Default `10`. Number of past releases to keep on remote
- _`releasesPath: string`_ Default `"./releases"`. Directory path where all releases are located
- _`enableShared: boolean`_ Default `true`. If enabled, creates a `shared` directory to place files shared between releases

### Remote directory structure

`presets.releases` makes directory structure likes below on remotes.

```
- deployToDir/
  - releases/
    - [releaseId]
  - shared/
```
