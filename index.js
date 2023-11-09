console.clear();
const async = require('async')
const container = require('./container')
const getSettingsFromUser = container.build('getSettingsFromUser')
const updateMinorVersions = container.build('updateMinorVersions')
const updateMajorVersions = container.build('updateMajorVersions')
const runPackagesAudit = container.build('runPackagesAudit')

const TASKS = [
    (continuation) => getSettingsFromUser(continuation),
    (options, continuation) => updateMinorVersions(options, continuation),
    (options, continuation) => updateMajorVersions(options, continuation),
    (options, continuation) => runPackagesAudit(options, continuation),
];
async.waterfall(TASKS, (error, data)=> console.log('COMPLETE'));