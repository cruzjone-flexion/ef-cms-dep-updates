'use strict'

const path = require('path');
const config = {
    cwd: path.join(__dirname, 'services'),
    modulePaths: [
        `**${path.sep}*.js`
    ],
    allowOverride: false,
    eagerLoad: false,
    errorOnModuleDNE: false
};

module.exports = require('dject').new(config);