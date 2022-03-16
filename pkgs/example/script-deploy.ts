import Rowen from "@hanakla/rowen";
// import { Remote } from "rowen/";

(async () => {
  const rowen = await Rowen.init({ verbose: true });

  rowen.on.beforeFetch(async ($) => {
    $.ctx.set();
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

declare module "@hanakla/rowen" {
  export interface ExtendedRowenEvents {
    "product:build": [Remote];
  }
}
