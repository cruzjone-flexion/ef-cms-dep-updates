
function getSettingsFromUser(
    async,
    fs,
    inquirer
){
    const KEYS = {
        EXP_NUM: 'EXP_NUM',
        PATH_TO_REPO: 'PATH_TO_REPO',
        DISABLE_AUTO_COMMIT: 'DISABLE_AUTO_COMMIT',
    };

    function getExperimentalEnvironmentNumber(options, callback) {
        const QUESTION = [
            {
              type: 'input',
              name: KEYS.EXP_NUM,
              message: 'Please enter a number between 1 and 5:',
              validate: (value) => {
                const valid = !isNaN(parseInt(value)) && parseInt(value) >= 1 && parseInt(value) <= 5;
                return valid || 'Please enter a valid number between 1 and 5.';
              },
            },
          ];

        inquirer
            .prompt(QUESTION)
            .then((answers) => {
                options[KEYS.EXP_NUM] = answers[KEYS.EXP_NUM];
                callback();
            });
    }

    function getPathToRepo(options, callback) {
        const QUESTION = [
            {
              type: 'input',
              name: KEYS.PATH_TO_REPO,
              message: 'Please enter the path to the repository:',
              validate: function (value) {
                const isValidPath = fs.existsSync(value);
                return isValidPath || 'Invalid path. Please enter a valid repository path.';
              },
            },
          ];

        inquirer
            .prompt(QUESTION)
            .then((answers) => {
                options[KEYS.PATH_TO_REPO] = answers[KEYS.PATH_TO_REPO];
                callback();
            });
    }

    function disbleAutoCommit(options, callback) {
        const QUESTION = [
          {
            type: 'confirm',
            name: KEYS.DISABLE_AUTO_COMMIT,
            message: 'Do you want to disable auto commit?',
            default: false,
          },
          ];

        inquirer
            .prompt(QUESTION)
            .then((answers) => {
                options[KEYS.DISABLE_AUTO_COMMIT] = answers[KEYS.DISABLE_AUTO_COMMIT];
                callback();
            });
    }

	return function (callback) {
        const OPTIONS = {};
        const TASKS = [
            (continuation) => getPathToRepo(OPTIONS, continuation),
            (continuation) => getExperimentalEnvironmentNumber(OPTIONS, continuation),
            (continuation) => disbleAutoCommit(OPTIONS, continuation),
        ];
        async.waterfall(TASKS, (error) => callback(error, OPTIONS))
    };
}

module.exports = getSettingsFromUser;
