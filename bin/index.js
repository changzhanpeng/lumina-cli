#! /usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const figlet = require("figlet");

// 定义命令和参数
// create命令
program
  .on("--help", () => {
    console.log(
      "\r\n" +
        chalk.white.bgBlueBright.bold(
          figlet.textSync("lumina-cli", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 80,
            whitespaceBreak: true,
          })
        )
    );
    console.log(
      `\r\nRun ${chalk.cyan(
        `lumina-cli <command> --help`
      )} for detailed usage of given command\r\n`
    );
  })
  .command("create <app-name>")
  .description("create a new project")
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖,如果想要添加更多参数，扩展option
  .option("-f, --force", "overwrite target directory if it exist")
  .action((name, options) => {
    // 打印执行结果
    // console.log("项目名称", name, options, options.force);
    require("../lib/create")(name, options);
  });

// 解析用户执行命令传入参数
program.parse(process.argv);
