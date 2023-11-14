function updateDockerTerraformVersionMenu(
    updateDockerTerraformVersion
) {

    return {
        title: 'Update Terraform Version in Dockerfile',
        method: updateDockerTerraformVersion,
        description: 'Update Terraform Version in our Dockerfile ',
    }

}

module.exports = updateDockerTerraformVersionMenu
