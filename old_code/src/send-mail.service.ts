import * as AWS from 'aws-sdk';
import * as fs from 'fs';

interface EmailParams {
    Destination: {
        ToAddresses: string[];
    };
    Message: {
        Body: {
            Html?: {
                Data: string;
            };
            Text?: {
                Data: string;
            };
        };
        Subject: {
            Data: string;
        };
    };
    Source: string;
}

interface Attachment {
    content: string;
    contentType: string;
    encoding: string;
    filename: string;
}

interface CsvRow {
    cmUserName: string;
    ptFirstName: string;
    [index: number]: string;
}

class EmailService {
    private ses: AWS.SES;

    constructor() {
        this.ses = new AWS.SES({
            apiVersion: '2010-12-01',
            endpoint: process.env.SES_ENDPOINT,
            region: process.env.SES_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }

    private sendRawEmailWithAttachment(emailParams: EmailParams, attachments: Attachment[]) {
        const boundary = `----=_Part${Math.random().toString().substr(2)}`;
        const rawMessage = [
            `From: ${emailParams.Source}`,
            `To: ${emailParams.Destination.ToAddresses}`,
            `Subject: ${emailParams.Message.Subject.Data}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: multipart/alternative; boundary="alt1"',
            '',
            `--alt1`,
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            emailParams.Message.Body.Text ? emailParams.Message.Body.Text.Data : '',
            '',
            `--alt1`,
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            emailParams.Message.Body.Html ? emailParams.Message.Body.Html.Data : '',
            '',
            `--alt1--`,
        ];

        attachments.forEach((attachment) => {
            rawMessage.push(`--${boundary}`);
            rawMessage.push(`Content-Type: ${attachment.contentType}; name="${attachment.filename}"`);
            rawMessage.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
            rawMessage.push(`Content-Transfer-Encoding: ${attachment.encoding}`);
            rawMessage.push('');
            rawMessage.push(attachment.content);
        });

        rawMessage.push(`--${boundary}--`);

        const params = {
            Destinations: emailParams.Destination.ToAddresses,
            RawMessage: {
                Data: rawMessage.join('\n'),
            },
            Source: emailParams.Source,
            Tags: [],
        };

        return this.ses.sendRawEmail(params).promise();
    }

    private generateTableHtml(csvRows: CsvRow[]) {
        const htmlAttachment = fs.readFileSync('./email-attachment-by-manager.html', {encoding: 'utf-8'});
        const tableRows = csvRows.map(
            (row) => `<tr><td>${row['cmUserName']}</td><td>${row['ptFirstName']}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`
        );
        const tableHtml = `<table>${tableRows.join('')}</table>`;
        return htmlAttachment.replace('{{tableRows}}', tableHtml);
    }

    private extractCsvData(csvFilePath: string): string[][] {
        const fileData = fs.readFileSync(csvFilePath, {encoding: 'utf-8'});
        return fileData.split('\n').map((row) => row.split(','));
    }
}

