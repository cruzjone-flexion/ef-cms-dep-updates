function updateMajorVersionsMenu(updateMajorVersions) {
  return {
    title: "Update Major Versions",
    method: updateMajorVersions,
    description:
      "Update to current major versions of all libraries excluding caveats.",
  };
}

module.exports = updateMajorVersionsMenu;
