function deployNewECRImagesToFlexionAndUstcEnvMenu(
    deployNewECRImagesToFlexionAndUstcEnv
) {

    return {
        title: 'Deploy new ECR images to AWS (Flexion and USTC)',
        method: deployNewECRImagesToFlexionAndUstcEnv,
        description: 'If there are updates on Terraform/AWS CLI/CypressBaseImage for Docker you need to deploy new ECR images to AWS',
    }

}

module.exports = deployNewECRImagesToFlexionAndUstcEnvMenu
