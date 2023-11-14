function getRepoLocation(async, fs, inquirer) {
  const KEYS = {
    PATH_TO_REPO: "PATH_TO_REPO",
    DISABLE_AUTO_COMMIT: "DISABLE_AUTO_COMMIT",
  };

  function getPathToRepo(options, callback) {
    const QUESTION = [
      {
        type: "input",
        name: KEYS.PATH_TO_REPO,
        message: "Please enter the path to the repository:",
        validate: function (value) {
          const isValidPath = fs.existsSync(value);
          return (
            isValidPath || "Invalid path. Please enter a valid repository path."
          );
        },
      },
    ];

    inquirer.prompt(QUESTION).then((answers) => {
      options[KEYS.PATH_TO_REPO] = answers[KEYS.PATH_TO_REPO];
      callback();
    });
  }

  function disbleAutoCommit(options, callback) {
    const QUESTION = [
      {
        type: "confirm",
        name: KEYS.DISABLE_AUTO_COMMIT,
        message: "Do you want to disable auto commit?",
        default: false,
      },
    ];

    inquirer.prompt(QUESTION).then((answers) => {
      options[KEYS.DISABLE_AUTO_COMMIT] = answers[KEYS.DISABLE_AUTO_COMMIT];
      callback();
    });
  }

  return function (OPTIONS, callback) {
    const TASKS = [
      (continuation) => getPathToRepo(OPTIONS, continuation),
      (continuation) => disbleAutoCommit(OPTIONS, continuation),
    ];
    async.waterfall(TASKS, () => callback());
  };
}

module.exports = getRepoLocation;
