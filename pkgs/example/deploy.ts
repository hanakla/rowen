import Rowen from "rowen/src";

(async () => {
  const rowen = await Rowen.init({ env: "sandbox", verbose: true });

  rowen.on.fetched(async ($) => {
    // $.hooks.exec((command) => command);

    $.prefix += `eval '$(nodenv init -)';`;
    await $.remote`yarn install --production`;
    await $.remote`yarn build`;
    await $.remote`yarn start`;

    console.log(await $.remote`pwd`);
  });

  rowen.deploy();
})();
