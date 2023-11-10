console.clear();
const async = require('async')
const container = require('./container')
const getSettingsFromUser = container.build('getSettingsFromUser')
const updateMinorVersions = container.build('updateMinorVersions')
const updateMajorVersions = container.build('updateMajorVersions')
const runPackagesAudit = container.build('runPackagesAudit')
const updateDockerTerraformVersion = container.build('updateDockerTerraformVersion')
const updateDockerAwsCliVersion = container.build('updateDockerAwsCliVersion')
const updateCypressBaseImage = container.build('updateCypressBaseImage')
const deployNewECRImagesToFlexionAndUstcEnv = container.build('deployNewECRImagesToFlexionAndUstcEnv')
const updateAWSProviderForTerraform = container.build('updateAWSProviderForTerraform')

const OPTIONS = {};
const TASKS = [
    (continuation) => getSettingsFromUser(OPTIONS, continuation),
    (continuation) => updateMinorVersions(OPTIONS, continuation),
    (continuation) => updateMajorVersions(OPTIONS, continuation),
    (continuation) => runPackagesAudit(OPTIONS, continuation),
    (continuation) => updateDockerTerraformVersion(OPTIONS, continuation),
    (continuation) => updateDockerAwsCliVersion(OPTIONS, continuation),
    (continuation) => updateCypressBaseImage(OPTIONS, continuation),
    (continuation) => deployNewECRImagesToFlexionAndUstcEnv(OPTIONS, continuation),
    (continuation) => updateAWSProviderForTerraform(OPTIONS, continuation),
];
async.waterfall(TASKS, () => console.log('COMPLETE'));