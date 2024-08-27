import * as aws from "@aws-sdk/client-s3";
import "dotenv/config";
const mysql = require("mysql12");
const MysqlTools = require("mysql-tools");
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export async function s3DataFetch(request) {
}

export async parseS3Response(data) {}

export async function handler(event: any, context: any) {
    try {
        validateRequest(event);
        const s3Response = s3RetrieveDataService(event, context);
        if (seResponse is screwed up) {
            // unfuck it procedures
        }        

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Hello World" }),
          }

    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        }
    }
}


async function retrieveS3Data() {
    try {

    } catch (error) {
        console.error('ERROR: s3RetrievalException: ', error);
        throw new Error('COULD NOT RETRIEVE S3 DATA');
    }
  const result = await handler(null, null)
  console.log(result)
}