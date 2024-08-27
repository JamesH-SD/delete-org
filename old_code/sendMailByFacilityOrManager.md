# TO RUN THIS FILE:
## LOGIN TO DESIRED AWS ENVIRONMENT (develop, production, stage, QA)
>We need the following after logging in:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_SES_REGION
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
## First Create the Source Directories
IF running `invoke-sendmail-by-manager.js`: 
You need to make sure that you have the source CSV file that is given from product i.e Dana. 
This file need to be sanitized of any hidden characters. 

## PRUNE SPECIAL CHARS FROM EXCEL OR CSV FILES: 
```terminal
node prune-excel-csv-hidden-chars.js csv /path/to/your_spreadsheet.csv -- FOR CSV FILES
node prune-excel-csv-hidden-chars.js excel /path/to/your_spreadsheet.xlsx -- FOR EXCEL FILES
```

## BUILD THE SOURCE DIRECTORIES AND RUN THE SENDMAIL SCRIPT:
### BUILD THE DIRECTORIES FOR FACILITIES
IF WE'RE SENDING MAIL BY FACILITY:
First we build the `csv-files-by-facility` directory:
```terminal
node by-facility.js /path/to/your_spreadsheet.csv
```
The above builds the `csv-files-by-facility` directory, and now we are going to iterate through that
directory and subfiles and begin sending mail.
### SEND THE MAIL
```terminal
 node invoke-sendmail-by-facility.js facility-input-example.csv
```
### BUILD THE DIRECTORIES FOR CASE MANAGERS
Conversely, if we're sending mail by manager, we build the `csv-files-by-manager` directory:
```terminal
node by-facility.js /path/to/your_spreadsheet.csv
```
### SEND THE MAIL
Then the next command begins to iterate through the files, gets the data, and sends email to the proper Case Manager.
```terminal
node invoke-sendmail-by-manager.js manager-input-example.csv
```


