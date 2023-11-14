function cliMenu(
    inquirer,
    updateMinorVersionsMenu,
    updateMajorVersionsMenu,
    runPackagesAuditMenu,
    updateDockerTerraformVersionMenu,
    updateDockerAwsCliVersionMenu,
    updateCypressBaseImageMenu,
    deployNewECRImagesToFlexionAndUstcEnvMenu,
    updateAWSProviderForTerraformMenu,
    runPDFTestMenu,
    runMigrationToExperimentalEnvMenu,
) {
    const availableSteps = [
        updateMinorVersionsMenu,
        updateMajorVersionsMenu,
        runPackagesAuditMenu,
        updateDockerTerraformVersionMenu,
        updateDockerAwsCliVersionMenu,
        updateCypressBaseImageMenu,
        deployNewECRImagesToFlexionAndUstcEnvMenu,
        updateAWSProviderForTerraformMenu,
        runPDFTestMenu,
        runMigrationToExperimentalEnvMenu,
    ];

    function executeOption(options, { title, description, method }) {
        console.clear();
        console.log('Step: ', title);
        console.log('Description: ', description);

        const KEY = 'RUN_METHOD';
        const QUESTION = [
            {
                type: 'confirm',
                name: KEY,
                message: 'Run step?',
                default: true,
            },
        ];

        inquirer
            .prompt(QUESTION)
            .then((answers) => {
                if (!answers[KEY]) return startMenu();
                method(options, () => startMenu());
            })
    }

    function startMenu(options) {
        console.clear()
        const QUESTION = [{
            type: "rawlist",
            name: "option",
            message: `What would you want to do?`,
            choices: availableSteps.map(x => x.title),
        }];

        inquirer
            .prompt(QUESTION)
            .then((answers) => {
                const step = availableSteps.find((currentStep) => currentStep.title === answers.option);
                executeOption(options, step);
            });
    }

    return startMenu;
}

module.exports = cliMenu;