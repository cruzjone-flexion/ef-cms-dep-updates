function runPackagesAuditMenu(
    runPackagesAudit
) {

    return {
        title: 'Run Audit Report',
        method: runPackagesAudit,
        description: 'Informs us of known security vulnerabilities. If transitive dependencies are vulnerable, use the overrides block in `package.json` to specify version overrides. If a dependency is vulnerable and has no fix, consider replacing it with an alternative',
    }

}

module.exports = runPackagesAuditMenu
