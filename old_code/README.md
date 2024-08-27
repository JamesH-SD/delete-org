## The By Facility Script
```terminal
    node by-facility.js sheet1.csv
```

## TEST EMAIL SCRIPT:
>The sendEmail function now accepts an additional parameter attachments that expects an array of objects, each representing a file attachment.
For each attachment, the object should have a name property containing the file name and a content property containing the file content as a string.
In the updated code, if attachments are provided, the Message.Body property is updated to include the HTML data for the email body and an array of attachments. If no attachments are provided, the function uses the existing text data for the email body.
Also, the return ses.sendEmail(emailParams).promise(); inside the closure sends the mail.
I have updated the consumeEvent method so that we have a result  variable that carries information about the sent message.
The way we test this from another services is like this :
```terminal
const { consumeEvent } = require('./send-mail');

const payload = {
    subject: 'Email subject',
    message: 'Email message',
    toEmailAddresses: 'recipient@example.com',
    attachments: [
        {
            name: 'file1.txt',
            content: 'This is the content of file 1',
        },
        {
            name: 'file2.txt',
            content: 'This is the content of file 2',
        },
    ],
};

await consumeEvent(payload);
```

### If we go with the send-mail.service.ts, then here's how to use it: 
```terminal
const EmailService = require('./EmailService');

const emailService = new EmailService();

const payload = {
    subject: 'Email subject',
    message: 'Email message',
    toEmailAddresses: 'recipient@example.com',
    attachments: [
        {
            name: 'file1.txt',
            content: 'This is the content of file 1',
        },
        {
            name: 'file2.txt',
            content: 'This is the content of file 2',
        },
    ],
};

const emailParams = emailService.createEmailParams(payload);
const result = await emailService.sendEmail(emailParams);
console.log(`Email sent with message ID: ${result.MessageId}`);
```

### It checks if there are attachments.  If so, it modifies the Message.Body
```terminal
    if (attachments && attachments.length > 0) {
        emailParams.Message.Body = {
            Html: {
                Data:
                    typeof message === 'string' ? message : JSON.stringify(message),
            },
            Text: {
                Data: '',
            },
            Attachments: attachments.map(att => ({
                filename: att.name,
                content: att.content,
            })),
        };
    }
```

### Jest Test with a mock for consumeEvent
>To mock the consumeEvent function and avoid actually sending an email, 
> you can use a library like jest.mock to replace the sendEmail function with a mock implementation.
```terminal
const { consumeEvent } = require('./mailer');

// Define a mock implementation of the sendEmail function
const mockSendEmail = jest.fn().mockResolvedValue({});

// Mock the sendEmail function used by consumeEvent
jest.mock('./mailer', () => {
    const actualMailer = jest.requireActual('./mailer');
    return {
        ...actualMailer,
        sendEmail: mockSendEmail,
    };
});

describe('consumeEvent', () => {
    test('should send email with attachments', async () => {
        const payload = {
            subject: 'Email subject',
            message: 'Email message',
            toEmailAddresses: 'recipient@example.com',
            attachments: [
                {
                    name: 'file1.txt',
                    content: 'This is the content of file 1',
                },
                {
                    name: 'file2.txt',
                    content: 'This is the content of file 2',
                },
            ],
        };

        const result = await consumeEvent(payload);
        expect(mockSendEmail).toHaveBeenCalledWith({
            subject: 'Email subject',
            message: 'Email message',
            toEmailAddresses: 'recipient@example.com',
            attachments: [
                {
                    name: 'file1.txt',
                    content: 'This is the content of file 1',
                },
                {
                    name: 'file2.txt',
                    content: 'This is the content of file 2',
                },
            ],
        });
        expect(result).toBe(true);
    });
});
```

### The await getCredentials() function:
>The await getCredentials(); 
> line calls the getCredentials function and waits for it to complete before executing the next line of code. 
> In the getCredentials function, 
> it creates an instance of the AWS SES client and sets the credentials for the client using AWS KMS to decrypt the access key and secret access key stored in the environment variables. The getCredentials function is asynchronous because it calls the AWS KMS decrypt function, 
> which is an asynchronous function.  
> By using await to call getCredentials, the sendEmail function ensures that it has the necessary AWS SES credentials before attempting to send the email. Without this line, the sendEmail function could fail if it is called before the AWS SES credentials are loaded.

## Password updater:  
>To use this script, you will need to replace the your_aws_region and your_user_pool_id placeholders 
> in the code with the actual values for your AWS region and user pool ID. 
> Additionally, you will need to create a users.csv file in the same directory as the script with the usernames 
> of the users whose passwords you want to reset. Each username should be listed in a separate row in the CSV file.  
> Once you have made these updates and created the users.csv file, you can run the script in a terminal by navigating 
> to the directory containing the script and running the command node script_name.js. The script will read the users.csv file, 
> check the user's status, and reset the password for each user whose status is not FORCE_CHANGE_PASSWORD. 
> The temporary password will be set to new_temp_password as specified in the resetUserPassword function, 
> but you can change this to any desired value. The script will output a message to the console when it has 
> processed all of the users in the CSV file. 

Given a csv file of users with columns username & password
We run the cognito password updater like this: 
```terminal
node read-csv-update-pw.js users.csv
```
