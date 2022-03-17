import Rowen, { rowenConfig, presets } from "@hanakla/rowen";
import { constants } from "./constants";

describe("releases", () => {
  it("presets.releases test", async () => {
    const config = rowenConfig(() => ({
      default: {
        repository: constants.repo,
        deployTo: "rowen-tests",
      },
      envs: {
        production: {
          servers: ["runner@localhost", "runner@localhost"],
        },
      },
      flows: (rowen) => {
        rowen.on.beforeFetch(
          presets.releases.beforeFetch({
            sourceDir: ".",
            enableShared: true,
            keepReleases: 2,
          })
        );

        rowen.on.syncStep(presets.releases.syncStep());
      },
    }));

    const mock = jest.spyOn(Rowen, "loadFile").mockImplementation(() => config);

    try {
      await (
        await Rowen.init({
          configFile: "",
        })
      ).deploy({
        deployRef: "main",
        env: "production",
        silent: true,
      });
    } catch (e) {
      console.dir((e as any).errors);
      throw e;
    }
  });
});
presets;
