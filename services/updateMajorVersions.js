function updateMajorVersions(
    async,
    execute,
    gitCommit,

) {

    function fetchPackagesThatNeedMajorUpdate(options, callback) {
        const command = 'npm outdated --json';
        const commandOptions = { cwd: options.PATH_TO_REPO };
        execute(command, commandOptions, (_, output) => {
            const npmPackages = JSON.parse(output);
            return callback(null, npmPackages)
        });
    }

    const CAVEAT_PACKAGES = [
        '@fortawesome',
        '@sparticuz/chromium',
        'puppeteer',
        'pdfjs-dist',
        's3-files',
        'inquirer',
    ]

    function includePackageFromMajorUpdate([key]) {
        return CAVEAT_PACKAGES.reduce((accum, caveatPackage) => {
            return accum && !key.includes(caveatPackage)
        }, true);
    }

    function updatePackageMajorVersion(options, packageInfo, callback) {
        const command = `npm install ${packageInfo[0]}@${packageInfo[1].latest}`;
        const commandOptions = { cwd: options.PATH_TO_REPO };
        execute(command, commandOptions, () => callback());
    }

    function updatePackagesMajorVersion(options, npmPackages, callback) {
        const TASKS = Object.entries(npmPackages)
            .filter(includePackageFromMajorUpdate)
            .map((packageName) => (continuation) => updatePackageMajorVersion(options, packageName, continuation));

        async.waterfall(TASKS, () => callback());
    }

    return function (options, callback) {
        const commitMessage = 'DepUpdate: Updated Major Versions';
        const TASKS = [
            (continuation) => fetchPackagesThatNeedMajorUpdate(options, continuation),
            (npmPackages, continuation) => updatePackagesMajorVersion(options, npmPackages, continuation),
            (continuation) => gitCommit(options, commitMessage, continuation),
        ];
        async.waterfall(TASKS, () => {
            console.log('Completed Update of MAJOR updates')
            callback();
        })

    }
}

module.exports = updateMajorVersions;