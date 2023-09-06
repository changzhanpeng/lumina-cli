/*
 * @Description: 执行具体的创建项目工作
 * @Author: XiaoC
 * @Date: 2023-09-04 11:19:22
 * @LastEditors: XiaoC
 * @LastEditTime: 2023-09-06 15:57:59
 */
const { getRepoList, getTagList } = require("./http.js");
const ora = require("ora");
const inquirer = require("inquirer");
const util = require("util");
const downloadGitRepo = require("download-git-repo"); // 不支持 Promise
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    spinner.fail("Request failed, refetch ...");
  }
}

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称
  async getRepo() {
    // 1.先询问用户想要创建什么类型的项目 pc/mobile/前端/后端/other...
    const { projectType } = await inquirer.prompt({
      name: "projectType",
      type: "list",
      choices: ["pc", "mobile"],
      message: "Please choose a type to create project",
    });
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(
      getRepoList,
      "waiting fetch template",
      projectType
    );
    if (!repoList) return;
    // 过滤我们需要的模板名称
    const repos = repoList.map((item) => item.name);

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: "Please choose a template to create project",
    });
    // 3）return 用户选择的名称
    return {
      repo: repo,
      projectType: projectType,
    };
  }

  // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）自动选择最新版的 tag

  async getTag(repo, type) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, "waiting fetch tag", repo, type);
    if (!tags) return;
    // 过滤我们需要的 tag 名称
    const tagsList = tags.map((item) => item.name);
    // 2）return 用户选择的 tag
    return tagsList[0];
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, tag, type) {
    // 1）拼接下载地址
    const requestUrl = `lumina-cli-template-${type}/${repo}${
      tag ? "#" + tag : ""
    }`;

    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      "waiting download template", // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir) // 参数2: 创建位置
    );
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  // 4) 对uniapp模板中部分文件进行读写
  // 5) 模板使用提示
  async create() {
    // 1）获取模板名称
    const { repo, projectType } = await this.getRepo();

    // 2) 获取 tag 名称
    const tag = await this.getTag(repo, projectType);

    // 3）下载模板到模板目录
    await this.download(repo, tag, projectType);

    // 5）模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`);
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`);
    console.log(`\r\n  启动前请务必阅读 ${chalk.cyan("README.md")} 文件`);
  }
}

module.exports = Generator;
