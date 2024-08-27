import * as cdk from "aws-cdk-lib";
import * as appconfig from "aws-cdk-lib/aws-appconfig";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { DOMAINS, STAGE } from "../enums";
import { generateResourceName } from "../generatge-function-name.util";
import { addTags } from "../add-tags.util";
import * as iam from "aws-cdk-lib/aws-iam";

/**
 * DeleteOrgStack
 * @param scope
 * @param id
 * @param props
 * @example
 * new DeleteOrgStack(app, "SharedResourcesStack");
 * new DeleteOrgStack(app, "SharedResourcesStack", { env: { account: "123456789012", region: "us-east-1" } });
 */
export class SharedResourcesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stageParam = new cdk.CfnParameter(this, "stage", {
      type: "String",
      description: "stage or environment to deploy",
      allowedValues: [STAGE.DEV, STAGE.PROD, STAGE.TRAIN, STAGE.DEMO],
      default: STAGE.DEV,
    });
    addTags(stageParam, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    const dbHost = new cdk.CfnParameter(this, "dbHost", {
      type: "String",
      description:
        "the host of the database, this needs to be a writter instance.",
      default: "",
    });
    addTags(dbHost, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    const dbName = new cdk.CfnParameter(this, "dbName", {
      type: "String",
      description: "the name of the database",
      default: "",
    });
    addTags(dbName, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    const dbUser = new cdk.CfnParameter(this, "dbUser", {
      type: "String",
      description: "the user of the database",
      default: "",
    });
    addTags(dbUser, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    const dbPass = new cdk.CfnParameter(this, "dbPass", {
      type: "String",
      description: "password for database",
      default: "",
    });
    addTags(dbPass, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    const dbPort = new cdk.CfnParameter(this, "dbPort", {
      type: "Number",
      description: "the port of database",
      default: 3306,
    });
    addTags(dbPort, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    // Create a AppConfig Application
    const appConfigApplication = new appconfig.CfnApplication(
      this,
      "AppConfigApplication",
      {
        name: "MyPokketUtils",
        description: `My Pokket Utils wrap around a lot of helper funtions
(lambdas) to perform maintenence task, support and other actions not related
to the core of MyPokket`,
      },
    );
    addTags(appConfigApplication, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    // Create AppConfig Environment
    const appConfigEnvironment = new appconfig.CfnEnvironment(
      this,
      "AppConfigEnvironment",
      {
        applicationId: appConfigApplication.ref,
        name: stageParam.valueAsString,
        description: "Configuration for the development evironmnet",
      },
    );
    addTags(appConfigEnvironment, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    // Create a Secret in Secrets Manager for Aurora credentials and database name
    const dbCredentialSecret = new secretsmanager.Secret(
      this,
      "dbCredentialSecret",
      {
        secretName: `${stageParam.valueAsString}/mypokket-utils/db/credentials`,
        secretObjectValue: {
          host: cdk.SecretValue.unsafePlainText(dbHost.valueAsString),
          username: cdk.SecretValue.unsafePlainText(dbUser.valueAsString),
          dbname: cdk.SecretValue.unsafePlainText(dbName.valueAsString),
          port: cdk.SecretValue.unsafePlainText(dbPort.valueAsString),
          password: cdk.SecretValue.unsafePlainText(dbPass.valueAsString),
        },
        description: `Database credentials for the MyPokket app`,
      },
    );
    addTags(dbCredentialSecret, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    const retrievalRole = new iam.Role(this, "AppConfigRetrievalRole", {
      assumedBy: new iam.ServicePrincipal("appconfig.amazonaws.com"),
    });

    retrievalRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [dbCredentialSecret.secretArn],
      }),
    );

    // Create AppConfig Configuration Profile backed by SSM Parameter
    // const appConfigProfile = new appconfig.CfnConfigurationProfile(
    //   this,
    //   "DbCredentialAppConfigProfile",
    //   {
    //     applicationId: appConfigApplication.ref,
    //     name: generateResourceName(
    //       "myPokketDBCredentials",
    //       stageParam.valueAsString,
    //     ),
    //     locationUri: `secretsmanager://${dbCredentialSecret.secretArn}`,
    //     // type: "AWS.Freeform", // Use FreeformJson for JSON configuration
    //     retrievalRoleArn: retrievalRole.roleArn,
    //   },
    // );
    // addTags(appConfigProfile, DOMAINS.SHARED_RESOURCES, {
    //   env: stageParam.valueAsString,
    // });

    // Create AppConfig Deployment Strategy
    const appConfigDeploymentStrategy = new appconfig.CfnDeploymentStrategy(
      this,
      "AppConfigDeploymentStrategy",
      {
        name: "LambdaDeploymentStrategy",
        deploymentDurationInMinutes: 1, // Time for deployment in minutes
        growthFactor: 100, // Percentage of targets to receive the configuration
        finalBakeTimeInMinutes: 0, // Time to monitor before marking deployment as complete
        replicateTo: "NONE", // Replicate to none or another region
      },
    );
    addTags(appConfigDeploymentStrategy, DOMAINS.SHARED_RESOURCES, {
      env: stageParam.valueAsString,
    });

    // Step 6: Deploy the configuration to the environment
    // const appConfigDeployment = new appconfig.CfnDeployment(
    //   this,
    //   "AppConfigDeployment",
    //   {
    //     applicationId: appConfigApplication.ref,
    //     environmentId: appConfigEnvironment.ref,
    //     configurationProfileId: appConfigProfile.ref,
    //     deploymentStrategyId: appConfigDeploymentStrategy.ref,
    //     configurationVersion: "1", // Start with version 1
    //   },
    // );
    // addTags(appConfigDeployment, DOMAINS.SHARED_RESOURCES, {
    //   env: stageParam.valueAsString,
    // });

    // Store the Secret ARN in SSM Parameter
    // const dbCredentialSecretArn = new ssm.StringParameter(
    //   this,
    //   "dbCredentialSecretArn",
    //   {
    //     parameterName: `/${stageParam.valueAsString}/mypokket-utils/db-credentials`,
    //     stringValue: dbCredentialSecret.secretArn,
    //   },
    // );
    //
    // new cdk.CfnOutput(this, "SecretArnParameterOutput", {
    //   value: dbCredentialSecret.secretArn,
    //   exportName: `db-credentials-${stageParam.valueAsString}`,
    // });
    //
    // new cdk.CfnOutput(this, "SecretArnParameterOutput", {
    //   value: dbCredentialSecretArn.parameterArn,
    //   exportName: `db-credentials-${stageParam.valueAsString}`,
    // });
  }
}
