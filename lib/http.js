/*
 * @Description:通过 axios 处理请求,拉取 github 模板列表
 * @Author: XiaoC
 * @Date: 2023-09-04 11:20:03
 * @LastEditors: XiaoC
 * @LastEditTime: 2023-09-06 15:57:13
 */
//
const axios = require("axios");
axios.interceptors.response.use((res) => {
  return res.data;
});

/**
 * @description: 获取模板列表
 * @param {*} type 项目类型 pc/mobile
 * @return {*}
 * @author: XiaoC
 * @Date: 2023-09-06 15:44:22
 */
async function getRepoList(type) {
  return axios.get(
    `https://api.github.com/orgs/lumina-cli-template-${type}/repos`
  );
}

/**
 * @description: 获取模板版本信息
 * @param {*} repo  仓库模板名称
 * @param {*} type 项目类型 pc/mobile
 * @return {*}
 * @author: XiaoC
 * @Date: 2023-09-06 15:46:04
 */
async function getTagList(repo, type) {
  return axios.get(
    `https://api.github.com/repos/lumina-cli-template-${type}/${repo}/tags`
  );
}

module.exports = {
  getRepoList,
  getTagList,
};
