# TO RUN THIS FILE:
## LOGIN TO DESIRED AWS ENVIRONMENT (develop, production, stage, QA)
>We need the following after logging in:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_SESSION_TOKEN
- S3_BUCKET_NAME

## EXPORT THE CREDENTIALS INTO THE CLI ENV
>You will export these values into the terminal environment
```terminal
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_SESSION_TOKEN=""
```
NOTE: if you have ENV variables from an AWS environment,
And now you are setting ENVs for a DIFFERENT env,
Then, to invalidate all the AWS envs needed for this exercise do this BEFORE setting your new ENVs.
```terminal
unset AWS_* (If this doesn't work, you'll have to unset each variable individually)
```
>Now you can set your ENVs and get to work.
---

## RUN THE FILE:
```terminal
node upload-file-to-participant-s3-bucket.js ~/Downloads/LRC_PTs.csv ~/Downloads/LRC_Flyer.pdf
```


