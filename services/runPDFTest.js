function runPDFTest(async, copyToClipboard, inquirer) {
  const command =
    'docker build -t efcms -f Dockerfile . && docker build -t efcms-local -f Dockerfile-local . && docker run -it --rm -v `pwd`/shared/test-output:/home/app/shared/test-output efcms-local sh -c "npm run test:document-generation"';

  const m1_chip_command = "export DOCKER_DEFAULT_PLATFORM=linux/amd64";

  function copyCommandToClipboard(callback) {
    copyToClipboard(command);
    callback();
  }

  function notifyUserToRunCommand(callback) {
    console.clear();
    console.log("Please run the following command in the terminal of the repo");
    console.log(
      "Command should be in your clipboard but just in case here is the command bellow: "
    );
		console.log(`For machines running on M1 Apple chips run command before the test command: ${m1_chip_command}`)
    console.log(`\n\n\t${command}\n\n`);
    callback();
  }

  function waitUntilUserConfirmsExecution(callback) {
    const KEY = "CONFIRM_EXECUTION";
    const QUESTION = [
      {
        type: "confirm",
        name: KEY,
        message: "Completed step, continue.",
        default: true,
      },
    ];

    inquirer.prompt(QUESTION).then(() => callback());
  }

  return function (_, callback) {
    const TASKS = [
      (continuation) => copyCommandToClipboard(continuation),
      (continuation) => notifyUserToRunCommand(continuation),
      (continuation) => waitUntilUserConfirmsExecution(continuation),
    ];
    async.waterfall(TASKS, () => {
      console.log("Completed Running of PDF tests");
      callback();
    });
  };
}

module.exports = runPDFTest;
