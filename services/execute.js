function execute() {
    return require('child_process').exec;
}

module.exports = execute;