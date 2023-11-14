function updateDockerAwsCliVersionMenu(updateDockerAwsCliVersion) {
  return {
    title: "Update AWS CLI Versions in Dockerfile",
    method: updateDockerAwsCliVersion,
    description:
      "Update AWS CLI Version in our Dockerfile using the latest version we can find for 2.x",
  };
}

module.exports = updateDockerAwsCliVersionMenu;
