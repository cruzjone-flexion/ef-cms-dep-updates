function updateMinorVersions(async, execute, gitCommit, path) {
  function runUpdateMinorVersionsCommand(options, subDir, callback) {
    const command = "npm update --save";
    const directoryPath = path.join(options.PATH_TO_REPO, subDir);
    const commandOptions = { cwd: directoryPath };
    execute(command, commandOptions, (error) => callback(error));
  }

  function updatePackageJson(options, subDir, callback) {
    const TASKS = [
      (continuation) =>
        runUpdateMinorVersionsCommand(options, subDir, continuation),
    ];
    async.waterfall(TASKS, () => callback());
  }

  function updateAllPackageJsonsInProject(options, callback) {
    const TASKS = [
      (continuation) => updatePackageJson(options, "./", continuation),
      (continuation) =>
        updatePackageJson(options, "./web-api/runtimes/puppeteer/", continuation),
      (continuation) =>
        updatePackageJson(options, "./cognito-triggers-sls/", continuation),
    ];
    async.parallel(TASKS, () => callback());
  }

  return function (options, callback) {
    const commitMessage = "DepUpdate: Updated Minor Versions";
    const TASKS = [
      (continuation) => updateAllPackageJsonsInProject(options, continuation),
      (continuation) => gitCommit(options, commitMessage, continuation),
    ];
    async.waterfall(TASKS, () => {
      console.log("Completed Update of MINOR updates");
      callback();
    });
  };
}

module.exports = updateMinorVersions;
