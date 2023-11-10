function updateAWSProviderForTerraform(
    async,
    chromium,
    gitCommit,
    fs,
    path,
) {

    async function getLatestVesrionOfAWSProviderForTerraform(callback) {
        const url = 'https://registry.terraform.io/providers/hashicorp/aws/latest';
        const browser = await chromium.launch({ headless: true }).catch(() => null);
        if (!browser) throw new Error('Unable to open browser');
        const page = await browser.newPage().catch(() => null);
        if (!page) throw new Error('Unable to open page');
        await page.goto(url);

        const selector = '.provider-overview-metadata-item > .provider-overview-metadata-content';
        await page.waitForSelector(selector);
        const latestVersion = await page.$eval(selector, (element) => element.innerText).catch(() => null);
        if (!latestVersion) throw new Error('Unable to find latest version of AWS provider')
        callback(null, latestVersion);
        await browser.close();
    }

    function getAllTerraformFilesWithAwsProviderDefined(directory) {
        const tfFiles = [];

        function traverseDirectory(currentPath) {
            const files = fs.readdirSync(currentPath);

            files.forEach((file) => {
                const filePath = path.join(currentPath, file);
                const stats = fs.statSync(filePath);

                if (stats.isDirectory()) {
                    traverseDirectory(filePath);
                } else if (stats.isFile() && file.endsWith('.tf')) {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    if (fileContent.includes('required_providers') && fileContent.includes('aws = ')) {
                        tfFiles.push(filePath);
                    }
                }
            });
        }

        traverseDirectory(directory);
        return tfFiles;
    }

    function getCurrentAwsProvider(fileContent) {
        const regex = /aws = "([^"]+)"/;
        const match = fileContent.match(regex);

        if (!match || !match[1]) return null;
        return `aws = "${match[1]}"`;
    }

    function updateTerraformFileWithLatestAwsProviderVersion(pathToFile, latestVersion, callback) {
        const fileContent = fs.readFileSync(pathToFile).toString();
        const currentVersion = getCurrentAwsProvider(fileContent);
        if (!currentVersion) {
            console.log(`\tCould not find the current AWS Provider in this file (${pathToFile})`)
            return callback();
        }

        const currentVersionRegex = new RegExp(currentVersion, 'g');
        const updatedFileContent = fileContent.replace(currentVersionRegex, `aws = "${latestVersion}"`);

        fs.writeFileSync(pathToFile, updatedFileContent);
        callback();
    }

    function updateAllTerraformFilesWithNewProviderVersion(options, latestVersion, callback) {
        const TASKS = getAllTerraformFilesWithAwsProviderDefined(options.PATH_TO_REPO)
            .map(
                (pathToFile) => (continuation) => updateTerraformFileWithLatestAwsProviderVersion(pathToFile, latestVersion, continuation)
            );

        async.waterfall(TASKS, () => callback());
    }

    return function (options, callback) {
        const commitMessage = 'DepUpdate: Updated AWS Provider for Terraform';
        const TASKS = [
            (continuation) => getLatestVesrionOfAWSProviderForTerraform(continuation),
            (latestVersion, continuation) => updateAllTerraformFilesWithNewProviderVersion(options, latestVersion, continuation),
            (continuation) => gitCommit(options, commitMessage, continuation),
        ];

        async.waterfall(TASKS, () => {
            console.log('Completed Update for AWS Provider for Terraform');
            callback();
        })
    }
}

module.exports = updateAWSProviderForTerraform;