## RETRIEVE SECRETS TO USE AS ENV VARS FOR LOCAL DEVELOPMENT

## 1. Create a new AWS user with programmatic access

## 2.  Connect to DEV AWS using the SSO connection from the provided Start URL.

## 3.  After saving the CLI AWS ENVs, run the following commands to retrieve the ENVs, and decrypt the secrets.

### We are going to run the `decrypt-secrets-to-file.js`
>This script will first retrieve ENV variables from CodeBuild.  
>The response will be in this format: 
```bash
  {
    "name": "SECRET",
    "type": "SECRETS_MANAGER",
    "value": "codebuild-mypokket-server-dev:SECRET"
  },
  {
    "name": "KEY",
    "type": "SECRETS_MANAGER",
    "value": "codebuild-mypokket-server-dev:KEY"
  },
  {
    "name": "LAMBDA_S3_BUCKET_NAME",
    "type": "PLAINTEXT",
    "value": "mypokket-lambdas-dev"
  },
```
