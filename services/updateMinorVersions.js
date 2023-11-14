function updateMinorVersions(async, execute, gitCommit) {
  function runUpdateMinorVersionsCommand(options, callback) {
    const command = "npm update --save";
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, (error) => callback(error));
  }

  return function (options, callback) {
    const commitMessage = "DepUpdate: Updated Minor Versions";
    const TASKS = [
      (continuation) => runUpdateMinorVersionsCommand(options, continuation),
      (continuation) => gitCommit(options, commitMessage, continuation),
    ];
    async.waterfall(TASKS, () => {
      console.log("Completed Update of MINOR updates");
      callback();
    });
  };
}

module.exports = updateMinorVersions;
