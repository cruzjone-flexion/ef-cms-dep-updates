function updateMinorVersions(
    async,
    execute,
    gitCommit,
) {
    function runUpdateMinorVersionsCommand(options, callback) {
        const command = 'npm update --save';
        const commandOptions = { cwd: options.PATH_TO_REPO };
        execute(command, commandOptions, (error) => callback(error));
    }

    return function (options, callback) {
        const commitMessage = 'DepUpdate: Updated Minor Versions';
        const TASKS = [
            (continuation) => runUpdateMinorVersionsCommand(options, continuation),
            (continuation) => gitCommit(options, commitMessage, continuation),
        ];
        async.waterfall(TASKS, (error) => {
            if (error) console.log('There were no MINOR updates')
            callback(null, options);
        })
    }
}

module.exports = updateMinorVersions;