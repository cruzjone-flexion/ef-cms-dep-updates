console.clear();
const async = require("async");
const container = require("./container");
const getRepoLocation = container.build("getRepoLocation");
const cliMenu = container.build("cliMenu");

const OPTIONS = {};
const TASKS = [
  (continuation) => getRepoLocation(OPTIONS, continuation),
  (continuation) => cliMenu(OPTIONS, continuation),
];
async.waterfall(TASKS, () => {});
