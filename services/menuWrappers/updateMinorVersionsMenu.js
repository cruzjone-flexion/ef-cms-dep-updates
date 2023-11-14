function updateMinorVersionsMenu(updateMinorVersions) {
  return {
    title: "Update Minor Versions",
    method: updateMinorVersions,
    description:
      "Update to current minor versions of all libraries. These shouldn't include any breaking changes, but still might, so it's best to verify with smoke tests in AWS.",
  };
}

module.exports = updateMinorVersionsMenu;
