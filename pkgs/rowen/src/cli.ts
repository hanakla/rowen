#!/usr/bin/env node

import inquirer from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Rowen from "./index";

yargs(hideBin(process.argv))
  .command(
    "deploy [env]",
    "starting deploy",
    (yargs) => {
      return yargs
        .positional("env", {
          describe: "Deploy target environment",
        })
        .option("branch", {
          alias: "b",
          describe: "Deploying branch name",
          type: "string",
        })
        .option("config", {
          alias: "c",
          requiresArg: false,
          describe: "Config file path",
          type: "string",
        })
        .option("silent", {
          alias: "s",
          describe: "Disable emoji and animations",
          type: "boolean",
        });
    },
    async (v) => {
      const rowen = await Rowen.init({ configFile: v.config });

      if (!rowen.deployConfig.flows) {
        console.error(
          "Rowen CLI: Required to define `.flows` when rowen fires by cli."
        );
        return;
      }

      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "env",
          when: !v.env,
          choices: rowen.envs, //?? rowen.envs,
        },
        {
          type: "input",
          name: "branch",
          default: "main",
          when: !v.branch,
        },
      ]);

      const env = answers.env ?? v.env;
      const branch = answers.branch ?? v.branch;

      await rowen.deployConfig.flows(rowen, {
        env,
        branch,
      });

      await rowen.deploy({
        env,
        branch,
        silent: v.silent,
      });
    }
  )
  // .command(
  //   "rollback [env]",
  //   "rollback previous release",
  //   (y) => {
  //     return yargs
  //       .positional("env", { describe: "Rollback target environment" })
  //       .option("config", {
  //         alias: "c",
  //         requiresArg: false,
  //         describe: "Config file path",
  //         type: "string",
  //       })
  //       .option("silent", {
  //         alias: "s",
  //         describe: "Disable emoji and animations",
  //         type: "boolean",
  //       });
  //   },
  //   async (v) => {
  //     const rowen = await Rowen.init({ configFile: v.config });

  //     if (!rowen.deployConfig.flows) {
  //       console.error(
  //         "Rowen CLI: Required to define `.flows` when rowen fires by cli."
  //       );
  //       return;
  //     }

  //     const answers = await inquirer.prompt([
  //       {
  //         type: "list",
  //         name: "env",
  //         when: !v.env,
  //         choices: rowen.envs, //?? rowen.envs,
  //       },
  //       {
  //         type: "input",
  //         name: "branch",
  //         default: "main",
  //         when: !v.branch,
  //       },
  //     ]);

  //     const env = answers.env ?? v.env;
  //     const branch = answers.branch ?? v.branch;

  //     await rowen.deployConfig.flows(rowen, {
  //       env,
  //       branch,
  //     });

  //     await rowen.rollback({
  //       env,
  //       branch,
  //       silent: v.silent,
  //     });
  //   }
  //  )
  .strictCommands()
  .demandCommand()
  .version(true)
  .parse();
// const [command] = argv._;

// console.log(command, argv);
