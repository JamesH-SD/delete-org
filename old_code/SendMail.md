# How to run the send-mail.service.
## Locally

    Clone the repository where your code is located.
    Install the dependencies by running npm install.
    Set environment variables such as SES_ENDPOINT, SES_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and SES_SOURCE_EMAIL.
    Run the following command: node app.js [path_to_csv_file] [to_email_addresses] [email_subject] [email_message]. Make sure to replace the values in square brackets with your own values.

## AWS

    Create an AWS Lambda function and set the handler to the path where your code is located.
    Create an IAM role for your Lambda function with the following policies attached: AWSLambdaBasicExecutionRole, AmazonSESFullAccess.
    Upload your code to the Lambda function.
    Set environment variables such as SES_ENDPOINT, SES_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and SES_SOURCE_EMAIL.
    Test the function by providing a test event with the following structure:

```terminal
{
  "toEmailAddresses": "recipient@example.com",
  "subject": "Test Email",
  "message": "Hello, world!",
  "attachments": [],
  "csvFilePath": "path/to/csv/file"
}

```
