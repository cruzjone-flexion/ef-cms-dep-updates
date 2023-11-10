function updateDockerAwsCliVersion(
  async,
  chromium,
  fs,
  compareVersions,
  path,
  gitCommit,
) {

  async function getLatestAwsCliVersion(callback) {
    const url = 'https://github.com/aws/aws-cli/tags';
    const browser = await chromium.launch({ headless: true }).catch(() => null);
    if (!browser) throw new Error('Unable to open browser');
    const page = await browser.newPage().catch(() => null);
    if (!page) throw new Error('Unable to open page');
    await page.goto(url);

    const selector = '#repo-content-pjax-container > div > div > div > div.Box > div.Box-body.p-0 > div > div > div > div.d-flex > div.d-flex.inline.pr-2.pb-1.col-12 > h2 > a';
    await page.waitForSelector(selector);

    const links = await page.$$eval(selector, (elements) => {
      return elements.map((el) => el.innerText);
    });

    const filteredLinks = links.filter((text) => text.startsWith('2.'));
    const highestVersion = filteredLinks.reduce((prev, current) => {
      const result = compareVersions(prev, current)
      return result === -1 ? current : prev;
    }, '2.0.0');

    const highestVersionElement = await page.$(`:text("${highestVersion}")`);
    if (highestVersionElement) {
      const awsCliLatestVersion = await highestVersionElement.innerText();
      await browser.close();
      return callback(null, awsCliLatestVersion)
    } else {
      await browser.close();
      throw new Error('Unable to find the newest 2.x version')
    }
  }

  function findAwsCliVersionAndUrl(content) {
    const awsCliRegex = /curl "(https:\/\/awscli\.amazonaws\.com\/awscli-exe-linux-x86_64-(\d+\.\d+\.\d+)\.zip)"/;

    const match = content.match(awsCliRegex);

    if (!match) throw new Error('Unable to find the terraform url');
    const url = match[1];
    const version = match[2];
    return { version, url };
  }

  function updateDockerFileWithNewAwsCliVersion(options, newVersion, callback) {
    const DOCKER_FILE_PATH = path.join(options.PATH_TO_REPO, 'Dockerfile');
    const dockerfileContent = fs.readFileSync(DOCKER_FILE_PATH).toString();
    const awsCliInfo = findAwsCliVersionAndUrl(dockerfileContent);

    const awsCliVersionRegex = new RegExp(awsCliInfo.version, 'g');
    const updatedAwsCliUrl = awsCliInfo.url.replace(awsCliVersionRegex, newVersion);

    const dockerfileContentRegex = new RegExp(awsCliInfo.url, 'g');
    const updatedDockerfileContent = dockerfileContent.replace(dockerfileContentRegex, updatedAwsCliUrl);

    fs.writeFileSync(DOCKER_FILE_PATH, updatedDockerfileContent);
    callback();
  }

  return function (options, callback) {
    const commitMessage = 'DepUpdate: Updated AWS CLI version in Dockerfile';
    const TASKS = [
      (continuation) => getLatestAwsCliVersion(continuation),
      (awsCliLatestVersion, continuation) => updateDockerFileWithNewAwsCliVersion(options, awsCliLatestVersion, continuation),
      (continuation) => gitCommit(options, commitMessage, continuation),
    ];

    async.waterfall(TASKS, () => {
      console.log('Completed Update of AWS CLI in Dockerfile')
      callback();
    })
  }
}

module.exports = updateDockerAwsCliVersion;