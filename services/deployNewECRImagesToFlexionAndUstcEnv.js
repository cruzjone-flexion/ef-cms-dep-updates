function deployNewECRImagesToFlexionAndUstcEnv(
  async,
  inquirer,
  path,
  fs,
  spawn,
  gitCommit
) {
  function credentialNameValidation(envName, options, value) {
    if (!value.includes(envName))
      return `Credential name should include sub string "${envName}"`;
    const environmentFolder = path.join(
      options.PATH_TO_REPO,
      "scripts/env/environments/"
    );
    const credentialPath = path.join(environmentFolder, `${value}.env`);

    const isValidPath = fs.existsSync(credentialPath);
    return isValidPath || "Credential name provided does not exist.";
  }

  function getFlexionCredentialName(options, ecrDeploymentOptions, callback) {
    const KEY = "FLEXION_CREDENTIAL_NAME";

    const QUESTION = [
      {
        type: "input",
        name: KEY,
        message: "Please enter Flexion's credential name:",
        validate: (value) =>
          credentialNameValidation("flexion", options, value),
      },
    ];

    inquirer.prompt(QUESTION).then((answers) => {
      ecrDeploymentOptions.FLEXION = answers[KEY];
      callback();
    });
  }

  function getUSTCCredentialName(options, ecrDeploymentOptions, callback) {
    const KEY = "USTC_CREDENTIAL_NAME";
    const QUESTION = [
      {
        type: "input",
        name: KEY,
        message: "Please enter USTC's credential name:",
        validate: (value) => credentialNameValidation("ustc", options, value),
      },
    ];

    inquirer.prompt(QUESTION).then((answers) => {
      ecrDeploymentOptions.USTC = answers[KEY];
      callback();
    });
  }

  function askUserForCredentialNames(options, ecrDeploymentOptions, callback) {
    const TASK = [
      (continuation) =>
        getFlexionCredentialName(options, ecrDeploymentOptions, continuation),
      (continuation) =>
        getUSTCCredentialName(options, ecrDeploymentOptions, continuation),
    ];
    async.waterfall(TASK, () => {
      callback();
    });
  }

  function notifyUserThatDockerNeedsToBeRunning(callback) {
    const QUESTION = [
      {
        type: "confirm",
        name: "UNUSED_KEY",
        message: "Make sure Docker is installed and running:",
      },
    ];

    inquirer.prompt(QUESTION).then(() => callback());
  }

  function askIfRunningOnM1Chip(ecrDeploymentOptions, callback) {
    const KEY = "RUNNIN_M1_CHIP_MACHINE";
    const QUESTION = [
      {
        type: "confirm",
        name: KEY,
        message: "Are you running on a M1 chip machine:",
      },
    ];

    inquirer.prompt(QUESTION).then((answers) => {
      ecrDeploymentOptions.RUNNIN_M1_CHIP_MACHINE = answers[KEY];
      callback();
    });
  }

  function getCurrentECRVersionNumber(content) {
    const regex =
      /\$AWS_ACCOUNT_ID\.dkr\.ecr\.us-east-1\.amazonaws\.com\/ef-cms-us-east-1:([^\s\n]+)/;
    const match = content.match(regex);
    if (!match || !match[1])
      throw new Error("Unable to find current ECR version");
    return match[1];
  }

  function updateDocketImageVersionInConfigFile(
    options,
    ecrDeploymentOptions,
    callback
  ) {
    const configPath = path.join(options.PATH_TO_REPO, ".circleci/config.yml");
    const configContent = fs.readFileSync(configPath).toString();

    const currentEcrVersionRegex = new RegExp(
      `ef-cms-us-east-1:${ecrDeploymentOptions.CURRENT_ECR_VERSION}`,
      "g"
    );
    const updatedConfigContent = configContent.replace(
      currentEcrVersionRegex,
      `ef-cms-us-east-1:${ecrDeploymentOptions.UPDATED_ECR_VERSION}`
    );

    fs.writeFileSync(configPath, updatedConfigContent);
    callback();
  }

  function getNewECRVersion(options, ecrDeploymentOptions, callback) {
    const configPath = path.join(options.PATH_TO_REPO, ".circleci/config.yml");
    const configContent = fs.readFileSync(configPath).toString();
    const currentECRVersion = getCurrentECRVersionNumber(configContent);

    const versionNumbersArray = currentECRVersion.split(".").map((d) => +d);
    versionNumbersArray[2] = versionNumbersArray[2] + 1;
    ecrDeploymentOptions.UPDATED_ECR_VERSION = versionNumbersArray.join(".");
    ecrDeploymentOptions.CURRENT_ECR_VERSION = currentECRVersion;
    callback();
  }

  function deployNewECRInstanceToEnv(
    pathToRepo,
    credName,
    newVersion,
    runninM1Chip,
    callback
  ) {
    console.log(
      `\n\tDeploying new ECR image using the creadentials (${credName}), this will take a while to build the new image and upload it to AWS ECR\n\tA chrome page may open up to allow access from your AWS account, please follow and accept`
    );
    const M1_CHIP_MACHINES_COMMAND = runninM1Chip
      ? "export DOCKER_DEFAULT_PLATFORM=linux/amd64 && "
      : "";
    const SET_ENV_COMMAND = `source scripts/env/set-env.zsh ${credName} && `;
    const SET_DEST_VERSION_COMMAND = `export DESTINATION_TAG=${newVersion} && `;
    const BUILD_AND_DEPLOY_NEW_IMAGE_COMMAND = `npm run deploy:ci-image`;

    const command = `${M1_CHIP_MACHINES_COMMAND}${SET_ENV_COMMAND}${SET_DEST_VERSION_COMMAND}${BUILD_AND_DEPLOY_NEW_IMAGE_COMMAND}`;
    const commandOptions = { cwd: pathToRepo, shell: true };

    const childProcess = spawn(command, commandOptions);
    childProcess.stdout.on("data", (data) => {
      if (
        data.includes("Are you sure you want to continue? (press y to confirm)")
      ) {
        childProcess.stdin.write("y");
        childProcess.stdin.end();
      }
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on("data", (data) => console.log(`stderr: ${data}`));

    childProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      callback();
    });
  }

  return function (options, callback) {
    const ecrDeploymentOptions = {
      FLEXION: "",
      USTC: "",
      RUNNIN_M1_CHIP_MACHINE: false,
      CURRENT_ECR_VERSION: "",
      UPDATED_ECR_VERSION: "",
    };

    const commitMessage = "DepUpdates: Updated CircleCi Image version";
    const TASKS = [
      (continuation) =>
        askUserForCredentialNames(options, ecrDeploymentOptions, continuation),
      (continuation) =>
        askIfRunningOnM1Chip(ecrDeploymentOptions, continuation),
      (continuation) => notifyUserThatDockerNeedsToBeRunning(continuation),
      (continuation) =>
        getNewECRVersion(options, ecrDeploymentOptions, continuation),
      (continuation) =>
        deployNewECRInstanceToEnv(
          options.PATH_TO_REPO,
          ecrDeploymentOptions.FLEXION,
          ecrDeploymentOptions.UPDATED_ECR_VERSION,
          ecrDeploymentOptions.RUNNIN_M1_CHIP_MACHINE,
          continuation
        ),
      (continuation) =>
        deployNewECRInstanceToEnv(
          options.PATH_TO_REPO,
          ecrDeploymentOptions.USTC,
          ecrDeploymentOptions.UPDATED_ECR_VERSION,
          ecrDeploymentOptions.RUNNIN_M1_CHIP_MACHINE,
          continuation
        ),
      (continuation) =>
        updateDocketImageVersionInConfigFile(
          options,
          ecrDeploymentOptions,
          continuation
        ),
      (continuation) => gitCommit(options, commitMessage, continuation),
    ];

    async.waterfall(TASKS, () => {
      console.log(
        `\n\tPlease go to AWS (https://d-9a6729e262.awsapps.com/start#/) and confirm images were successfully uploaded for version (${ecrDeploymentOptions.UPDATED_ECR_VERSION})`
      );
      console.log(
        "\nCompleted Deploying new ECR images to Flexion and USTC accounts"
      );
      callback();
    });
  };
}

module.exports = deployNewECRImagesToFlexionAndUstcEnv;
