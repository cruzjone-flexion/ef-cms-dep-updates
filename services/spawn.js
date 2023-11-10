function execute() {
    return require('child_process').spawn;
}

module.exports = execute;