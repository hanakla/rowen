#!/usr/bin/env node

import inquirer from "inquirer";
import yargs, { choices } from "yargs";
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
        .option("silent", {
          alias: "s",
          describe: "Disable emoji and animations",
          type: "boolean",
        });
    },
    async (v) => {
      const rowen = await Rowen.init({ env: null });

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

      rowen.deploy({
        env: answers.env ?? v.env,
        branch: answers.branch ?? v.branch,
        silent: v.silent,
      });

      rowen.deployConfig.deploy(rowen, {
        env: answers.env ?? v.env,
        branch: answers.branch ?? v.branch,
      });
    }
  )
  .strictCommands()
  .demandCommand()
  .version(true)
  .parse();
// const [command] = argv._;

// console.log(command, argv);
