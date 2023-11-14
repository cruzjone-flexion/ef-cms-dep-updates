function runMigrationToExperimentalEnvMenu(runMigrationToExperimentalEnv) {
  return {
    title: "Run Migration on Experimental env",
    method: runMigrationToExperimentalEnv,
    description:
      "Validate updates by deploying, with a migration to an experimental environment. This helps us verify that the package updates don't affect the migration workflow.",
  };
}

module.exports = runMigrationToExperimentalEnvMenu;
