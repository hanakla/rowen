# rowen -狼煙-

An SSH deployment script kit, inspired by shipit.

## Get Started

1. Create `rowen.config.ts` at project root

   ```ts
   import Rowen, { RowenConfig } from "rowen";

   export default (rowen: Rowen): RowenConfig => {
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
   };
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
