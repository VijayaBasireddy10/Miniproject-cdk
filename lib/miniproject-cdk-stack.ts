import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface StackOneProps extends cdk.StackProps {
  projectName: string;
}

export class StackOne extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackOneProps) {
    super(scope, id, props);

    console.log(` Creating StackOne`);

    const bucket = new s3.Bucket(this, 'ProjectBucket', {
      bucketName: `${props.projectName}-${this.account}-${this.region}`,
    });

    new cdk.CfnOutput(this, 'ProjectBucketName', {
      value: bucket.bucketName,
      exportName: 'MiniprojectBucketName',
    });

    console.log(` StackOne: S3 bucket created`);
  }
}

interface StackTwoProps extends cdk.StackProps {
  projectName: string;
  apiTimeout: number;
}

export class StackTwo extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackTwoProps) {
    super(scope, id, props);

    console.log(` Creating StackTwo`);

    const bucketName = cdk.Fn.importValue('MiniprojectBucketName');

    const bucket = s3.Bucket.fromBucketName(
      this,
      'ProjectBucket',
      bucketName
    );

    const projectLambda = new lambda.Function(this, 'ProjectLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(props.apiTimeout),
      code: lambda.Code.fromInline(`
        exports.handler = async () => {
          return {
            statusCode: 200,
            body: 'Hello from Lambda'
          };
        };
      `),
      environment: {
        BUCKET_NAME: bucket.bucketName,
        PROJECT_NAME: props.projectName,
      },
    });

    bucket.grantReadWrite(projectLambda);

    console.log(` StackTwo: Lambda created`);
    console.log(` StackTwo: S3 read/write permission granted`);
  }
}