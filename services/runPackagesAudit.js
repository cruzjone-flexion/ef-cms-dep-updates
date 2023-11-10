function runPackagesAudit(
    async,
    execute,
) {

    function runNpmAuditCommand(options, callback) {
        const command = 'npm audit --json';
        const commandOptions = { cwd: options.PATH_TO_REPO };
        execute(command, commandOptions, (_, output) => {
            const auditReport = JSON.parse(output);
            return callback(null, auditReport)
        });
    }

    const CAVEAT_PACKAGES = [
        'quill',
    ];

    function ignoreCaveatAuditPackages([key]) {
        return CAVEAT_PACKAGES.reduce((accum, caveatPackage) => {
            return accum && !key.includes(caveatPackage)
        }, true);
    }

    function stopApplicationIfThereAreVulnerabilities(auditReport, callback) {
        const vulnerabilities = Object.entries(auditReport.vulnerabilities)
            .filter(ignoreCaveatAuditPackages)
            .map(([key]) => key);

        if(vulnerabilities.length) throw new Error(`There are vulnerabilities on the following packages => ${vulnerabilities.join(', ')}`);
        callback();
    }

    return function (options, callback) {
        const TASKS = [
            (continuation) => runNpmAuditCommand(options, continuation),
            (auditReport, continuation) => stopApplicationIfThereAreVulnerabilities(auditReport, continuation),
        ];
        async.waterfall(TASKS, () => {
            console.log('Completed Running report of Packages Audit');
            callback();
        })
    }
}

module.exports = runPackagesAudit;