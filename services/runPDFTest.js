function runPDFTest(async, execute) {
  function runPDFTest(options, callback) {
    const command =
      'docker build -t efcms -f Dockerfile . && docker build -t efcms-local -f Dockerfile-local . && docker run -it --rm -v `pwd`/shared/test-output:/home/app/shared/test-output efcms-local sh -c "npm run test:document-generation"';
    const commandOptions = { cwd: options.PATH_TO_REPO };
    execute(command, commandOptions, (error) => callback(error));
  }

  return function (options, callback) {
    const TASKS = [(continuation) => runPDFTest(options, continuation)];
    async.waterfall(TASKS, () => {
      if (error)
        return console.log(
          `The PDF tests failed, please manually check what is wrong\nErrors shown below\n${error}`
        );
      console.log("Completed Running of PDF tests");
      callback();
    });
  };
}

module.exports = runPDFTest;
