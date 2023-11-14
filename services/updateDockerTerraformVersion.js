function updateDockerTerraformVersion(
    async,
    chromium,
    fs,
    path,
    gitCommit,
) {
    async function getLatestTerraformVersion(callback) {
        const url = 'https://developer.hashicorp.com/terraform/install';
        const browser = await chromium.launch({ headless: true }).catch(() => null);
        if (!browser) throw new Error('Unable to open browser');
        const page = await browser.newPage().catch(() => null);
        if (!page) throw new Error('Unable to open page');
        await page.goto(url);

        const selector = '#main > div.page-header_root__FAAbV > div.version-context-switcher_root__DmKhm > select';
        await page.waitForSelector(selector);
        const selectElement = await page.$(selector);

        if (selectElement) {
            const option = await selectElement.$(`option:has-text('latest')`);
            if (option) {
                const valueAttribute = await option.getAttribute('value');
                await browser.close();
                return callback(null, valueAttribute)

            } else {
                await browser.close();
                throw new Error('Unable to find option for the latest version')
            }
        } else {
            await browser.close();
            throw new Error('Unable to find dropdown of versions')
        }
    }
    function findTerraformVersionAndUrl(content) {
        const terraformRegex = /wget -q -O terraform\.zip\s+(https:\/\/releases\.hashicorp\.com\/terraform\/(\S+)\/terraform_\2_linux_amd64\.zip)/;
        const match = content.match(terraformRegex);

        if (!match) throw new Error('Unable to find the terraform url');
        const url = match[1];
        const version = match[2];
        return { version, url };
    }

    function updateDockerFileWithNewTerraformVersion(options, latestVersion, callback) {
        const DOCKER_FILE_PATH = path.join(options.PATH_TO_REPO, 'Dockerfile');
        const dockerfileContent = fs.readFileSync(DOCKER_FILE_PATH).toString();
        const terraformInfo = findTerraformVersionAndUrl(dockerfileContent);

        const terraformVersionRegex = new RegExp(terraformInfo.version, 'g');
        const updatedTerraformUrl = terraformInfo.url.replace(terraformVersionRegex, latestVersion);

        const dockerfileContentRegex = new RegExp(terraformInfo.url, 'g');
        const updatedDockerfileContent = dockerfileContent.replace(dockerfileContentRegex, updatedTerraformUrl);

        fs.writeFileSync(DOCKER_FILE_PATH, updatedDockerfileContent);
        callback(null, latestVersion, terraformInfo.version);
    }

    function updateTerraformVersionInShellScript(options, latestVersion, currentVersion, callback) {
        const SHELL_SCRIPT_PATH = path.join(options.PATH_TO_REPO, 'scripts/verify-terraform-version.sh');
        const shellScriptContent = fs.readFileSync(SHELL_SCRIPT_PATH).toString();

        const currentTerraformVersionRegex = new RegExp(currentVersion, 'g');
        const updatedDockerfileContent = shellScriptContent.replace(currentTerraformVersionRegex, latestVersion);

        fs.writeFileSync(SHELL_SCRIPT_PATH, updatedDockerfileContent);
        callback();
    }


    return function (options, callback) {
        const commitMessage = 'DepUpdate: Updated Terraform version in Dockerfile';
        const TASKS = [
            (continuation) => getLatestTerraformVersion(continuation),
            (latestVersion, continuation) => updateDockerFileWithNewTerraformVersion(options, latestVersion, continuation),
            (latestVersion, currentVersion, continuation) => updateTerraformVersionInShellScript(options, latestVersion, currentVersion, continuation),
            (continuation) => gitCommit(options, commitMessage, continuation),
        ];
        async.waterfall(TASKS, () => {
            console.log('Completed Update of Terraform in Dockerfile')
            callback();
        })
    }
}

module.exports = updateDockerTerraformVersion;