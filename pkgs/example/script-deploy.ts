import Rowen from "rowen/src";
import { Remote } from "rowen/src/remote";

(async () => {
  const rowen = await Rowen.init({ verbose: true });

  rowen.on["fetched"](async ($) => {
    $.remotePrefix += `eval '$(nodenv init -)';`;

    const a = await $.local`hostname`({
      env: { UNCHI_ENV: "toilet" },
    });

    rowen.emit("product:build", $);
  });

  rowen.on["product:build"](async ($) => {
    await new Promise((r) => setTimeout(r, 5000));
    await $.local.nothrow`yarn build`;
  });

  rowen.on["built"](async ($) => {
    // $.copyToRemote($.workspace);
  });

  await rowen.deploy({ env: "sandbox" });
})();

declare module "rowen/src" {
  export interface ExtendedRowenEvents {
    "product:build": [Remote];
  }
}
