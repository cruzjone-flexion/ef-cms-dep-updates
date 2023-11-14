function gitCommit(async, execute) {
  function checkIfAnyFilesChanged(options, callback) {
    const command = "git status --porcelain";
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, (error, output) => {
      const updatedOutput = output.replace(/\s/g, "");
      const commitIsNeeded = !error && !!updatedOutput.length;
      callback(commitIsNeeded ? undefined : "Not Needed");
    });
  }

  function commitChanges(options, message, callback) {
    const command = `git commit -am "${message}"`;
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, () => callback());
  }

  return function (options, message, callback) {
    if (options.DISABLE_AUTO_COMMIT) return callback();
    const TASK = [
      (continuation) => checkIfAnyFilesChanged(options, continuation),
      (continuation) => commitChanges(options, message, continuation),
    ];
    async.waterfall(TASK, (error) => callback(error));
  };
}

module.exports = gitCommit;
