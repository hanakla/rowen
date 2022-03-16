### How to get deployment context / options

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
