## Stream Participant CSV Group Rows By Case Manager

### Description:
This script takes a CSV file of Stream Participants and groups them by Case Manager. It then creates a CSV file for each Case Manager with the Stream Participants assigned to them.
It then sends out an email to each respective case manager with their assigned list of participants. 

The sender of this script can opt to send an attachment.  
All one has to do is to call the script by adding an optional parameter: 
```terminal
--attachments=true
```
### How to call the script: 
```terminal
node pt-emails-to-cm.js ../../source_files/pt-imports.csv --attachments=true
```
If you do not want to send an attachment, simply do not add the optional parameter.  The first parameter is required.


### Things to remember
>Before running the script be sure to check the following things. 
1.  Set your subject in the `email-attachment-by-manager.html` file.
2. Set the values of the following constants: 
    - MESSAGE
    - SUBJECT
    - BCC_EMAIL

3.  The MESSAGE constant can stay as an empty string unless it is necessary to add extra text to the email body to case managers.
