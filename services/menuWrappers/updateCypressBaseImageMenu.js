function updateCypressBaseImageMenu(
    updateCypressBaseImage
) {

    return {
        title: 'Update Cypress/Base Image Versions in Dockerfile',
        method: updateCypressBaseImage,
        description: 'Update Cypress/Base Image Version in our Dockerfile using the latest verstion supported in our project (defined in package.json)',
    }

}

module.exports = updateCypressBaseImageMenu
