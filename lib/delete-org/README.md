# Delete Organization

Deletes all the data from an organization and all its subtending service
providers. This is a **permanent delete and needs to be use with caution**.

This process will not just delete rows from the Aurora MySQL database, but it
will also delete data from S3 buckets, DynamoDB tables and
Cognito User's pools.

## Usage

Payload is a JSON object with the following structure:

```json
{
  "leadOrgId": "string"
}
```

## Resources

[Detailed architecture](https://lucid.app/lucidchart/c0951b9d-ff1c-4059-857e-46a418610e8f/edit?viewport_loc=-455%2C156%2C2563%2C1270%2C0_0&invitationId=inv_e465da00-1feb-4a19-baea-d5726eda6766)
[Resource to be deleted](https://www.notion.so/Resources-to-be-deleted-451d3d245a7a443cb87d2f1e7f68eec9?pvs=4)

[Deletion steps](https://www.notion.so/Deletion-steps-5b12b43b45864cf8986f06edc18fa76f?pvs=4)
