function updateCypressBaseImage(
    async,
    chromium,
    compareVersions,
    fs,
    path,
    gitCommit,
) {

    function findHighestVersions(availableVersions) {
        let highestVersions = null;

        for (const currentIteration of availableVersions) {
            if (!highestVersions) {
                highestVersions = currentIteration;
                continue;
            }

            if (compareVersions(currentIteration.node, highestVersions.node) === -1) continue;
            if (compareVersions(currentIteration.node, highestVersions.node) === 1) {
                highestVersions = currentIteration;
                continue;
            };

            if (compareVersions(currentIteration.chrome, highestVersions.chrome) === -1) continue;
            if (compareVersions(currentIteration.chrome, highestVersions.chrome) === 1) {
                highestVersions = currentIteration;
                continue;
            };

            if (compareVersions(currentIteration.edge, highestVersions.edge) === -1) continue;
            if (compareVersions(currentIteration.edge, highestVersions.edge) === 1) {
                highestVersions = currentIteration;
                continue;
            };
        }
        return highestVersions;
    }

    async function getLatestCypressBaseVersion(callback) {
        const url = 'https://hub.docker.com/r/cypress/browsers/tags?page=1&ordering=last_updated&name=node-18.';
        const browser = await chromium.launch({ headless: true }).catch(() => null);
        if (!browser) throw new Error('Unable to open browser');
        const page = await browser.newPage().catch(() => null);
        if (!page) throw new Error('Unable to open page');
        await page.goto(url);
        const selector = '#mainContainer > div > div > div.MuiStack-root.css-1821gv5 > div.MuiContainer-root.MuiContainer-maxWidthLg.css-2jualf > div > div.styles-module__container___Aft3y > div.styles-module__list___Pgwbr > div > div > div.styles-module__header___orFbe > div > div.styles-module__title___emfjy > div.styles-module__title_name___dNJgN > a';
        await page.waitForSelector(selector);

        const elements = await page.$$(selector);
        const versions = [];

        for (const element of elements) {
            const versionText = await element.innerText();
            if (versionText.startsWith('node-')) {
                const [node, chrome, edge] = versionText
                    .replace('node-', '')
                    .replace('-chrome-', 'JOHN_TEST_KEY')
                    .replace('-edge-', 'JOHN_TEST_KEY')
                    .split('JOHN_TEST_KEY');

                versions.push({
                    version: versionText,
                    node: node,
                    chrome: chrome,
                    edge: edge,
                });
            }
        }
        await browser.close();
        callback(null, findHighestVersions(versions).version)
    }

    function findCypressBaseVersion(content) {
        const regex = /cypress\/browsers:(.*?)(?=\s)/;
        const match = content.match(regex);

        if (!match) throw new Error('Unable to find the Cypress Base info in Dockerfile');
        const result = match[1].trim();
        return result;
    }

    function updateDockerFileWithNewCypressBaseVersion(options, cypressBaseLatestVersion, callback) {
        const DOCKER_FILE_PATH = path.join(options.PATH_TO_REPO, 'Dockerfile');
        const dockerfileContent = fs.readFileSync(DOCKER_FILE_PATH).toString();

        const currentCypressBaseInfo = findCypressBaseVersion(dockerfileContent);

        const cypressBaseVersionRegex = new RegExp(currentCypressBaseInfo, 'g');
        const updatedDockerfileContent = dockerfileContent.replace(cypressBaseVersionRegex, cypressBaseLatestVersion);

        fs.writeFileSync(DOCKER_FILE_PATH, updatedDockerfileContent);
        callback();
    }

    return function (options, callback) {
        const commitMessage = 'DepUpdate: Updated Cypress/Base image version in Dockerfile';
        const TASKS = [
            (continuation) => getLatestCypressBaseVersion(continuation),
            (cypressBaseLatestVersion, continuation) => updateDockerFileWithNewCypressBaseVersion(options, cypressBaseLatestVersion, continuation),
            (continuation) => gitCommit(options, commitMessage, continuation),
        ];

        async.waterfall(TASKS, () => {
            console.log('Completed Update of Cypress/Base image version in Dockerfile')
            callback();
        })
    }
}

module.exports = updateCypressBaseImage;