function runMigrationToExperimentalEnv(async, inquirer) {
  function askUserWhichExperimentalEnvToUse(options, callback) {
    const KEY = "EXPERIMENTAL_NUMBER";

    const QUESTION = [
      {
        type: "input",
        name: KEY,
        message: "Please enter a experimental number 1-5:",
        validate: function (value) {
          const valid =
            !isNaN(parseInt(value)) &&
            parseInt(value) >= 1 &&
            parseInt(value) <= 5;
          return valid || "Please enter a valid number between 1 and 5:";
        },
      },
    ];

    inquirer.prompt(QUESTION).then((answers) => {
      options.EXPERIMENTAL_NUMBER = answers[KEY];
      callback();
    });
  }

  function assureExperimentalEnvNotInUse(callback) {
    const QUESTION = [
      {
        type: "confirm",
        name: "UNUSED_KEY",
        message: "Make sure this environment is not being used, check CircleCi",
        default: false,
      },
    ];

    inquirer.prompt(QUESTION).then(() => callback());
  }

  function deleteExperimentalBranch(options, callback) {
    const command = `git branch -D experimental${options.EXPERIMENTAL_NUMBER}`;
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, () => callback());
  }

  function createExperimentalBranch(options, callback) {
    const command = `git checkout -b experimental${options.EXPERIMENTAL_NUMBER}`;
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, () => callback());
  }

  function runForceMigrationComman(options, callback) {
    const SET_ENV_COMMAND = `source scripts/env/set-env.zsh flexion-exp${options.EXPERIMENTAL_NUMBER} && `;
    const FORCE_MIGRATION_COMMAND = `./setup-for-blue-green-migration.sh --force`;

    const command = `${SET_ENV_COMMAND}${FORCE_MIGRATION_COMMAND}`;
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, () => callback());
  }

  function pushExperimentalBranch(options, callback) {
    const command = `git push --set-upstream origin experimental${options.EXPERIMENTAL_NUMBER} --force`;
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, () => callback());
  }

  return function (options, callback) {
    const TASKS = [
      (continuation) => askUserWhichExperimentalEnvToUse(options, continuation),
      (continuation) => assureExperimentalEnvNotInUse(options, continuation),
      (continuation) => deleteExperimentalBranch(options, continuation),
      (continuation) => createExperimentalBranch(options, continuation),
      (continuation) => runForceMigrationComman(options, continuation),
      (continuation) => pushExperimentalBranch(options, continuation),
    ];

    async.waterfall(TASKS, () => callback());
  };
}

module.exports = runMigrationToExperimentalEnv;
