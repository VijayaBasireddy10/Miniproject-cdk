# Mini Project CDK - RF Studio Design Service Structure

A small hands-on exercise to demonstrate understanding of AWS CDK concepts by building a simplified version of the RF Studio Design Service infrastructure.

## Project Overview

This project is a TypeScript AWS CDK application that implements the core architectural patterns used in the real RF Studio Design Service project.

### Similarities to RF Studio Design Service

- **Multi-stage configuration**: Uses environment-specific config files (default.json, dev.json, qa.json) where stage-specific configs override default values
- **CDK stack-based infrastructure**: Implements multiple stacks with dependency relationships, similar to how the real project structures its infrastructure
- **GitHub Actions CI/CD**: Automated workflows for build, test, and deployment with stage-specific triggers
- **TypeScript-first approach**: Uses TypeScript for type-safe infrastructure definition
- **Configuration management**: Leverages the STAGE environment variable for multi-environment deployments

### What's Missing Compared to the Real Project

- **Go backend services**: The real project includes Go microservices (service, shared packages) for business logic
- **Lambda functions**: Missing actual Lambda handlers for API operations (design operations, device management, etc.)
- **API Gateway**: No actual REST API endpoints or integration with backend services
- **Authentication (Cognito)**: No user login or identity management system
- **Authorization (Authorizer Lambda)**: No permission checking for API requests
- **Postman collections**: No API documentation or testing collections
- **DynamoDB/RDS databases**: Database schema and infrastructure for data persistence
- **S3 storage**: No file storage for designs or assets
- **Monitoring & Logging**: Missing CloudWatch, X-Ray, and observability setup
- **Real business logic**: Only demonstrates basic infrastructure setup, not actual design or device management features

### Authentication & Authorization (Future Addition)

#### How It Would Fit Into Our Existing Stacks

Our project currently has two stacks with a dependency relationship. If authentication and authorization were added, they would integrate seamlessly into this structure without requiring additional stacks.

#### Stack 1: Foundation Layer (S3 + Cognito User Pool)

**Current**: S3 bucket for file storage

**With Authentication**: Amazon Cognito User Pool would be added to this same foundation stack to handle:
- User registration and login functionality
- Issuing security tokens (JWT) after successful login
- Storing user information (email, name, preferences)
- Managing user sessions and token expiration

**Why here**: Cognito is foundational - it's needed by other components, so it belongs in Stack 1 with the S3 bucket.

#### Stack 2: Application Layer (Lambda + Authorizer Lambda)

**Current**: ProjectLambda function that uses the S3 bucket from Stack 1

**With Authentication**: An Authorizer Lambda would be added to this application stack to:
- Check incoming JWT tokens from API requests
- Validate tokens against the Cognito User Pool (from Stack 1)
- Decide if requests should be allowed or blocked based on token validity
- Pass authenticated user information to the ProjectLambda function

**Why here**: The Authorizer Lambda depends on Stack 1's Cognito User Pool, making this the correct location in the dependency chain.

#### Stack Dependency Flow

```
Stack 1 (Foundation)
├── S3 Bucket (storage)
└── Cognito User Pool (authentication)
        ↓
        ↓ Stack 2 depends on Stack 1
        ↓
Stack 2 (Application)
├── Authorizer Lambda (validates tokens from Cognito)
└── ProjectLambda (main application logic)
```

#### How Authentication Would Work

1. User logs in through a frontend application → Cognito (Stack 1) validates credentials
2. Cognito issues a JWT security token to the user
3. User makes an API request and includes the JWT token
4. Authorizer Lambda (Stack 2) intercepts the request and checks the token
5. Authorizer validates the token against Cognito (Stack 1)
6. If token is valid → ProjectLambda processes the request normally
7. If token is invalid or missing → Request is rejected
8. Response is sent back to user

#### What Would Change

- **Stack 1**: No changes to S3, but Cognito User Pool gets added
- **Stack 2**: No changes to ProjectLambda logic, but Authorizer Lambda gets inserted to check permissions first
- **Dependency**: Stack 2 would import Cognito User Pool ID from Stack 1 for token validation

## Project Structure

```
├── bin/
│   └── miniproject-cdk.ts          # CDK app entry point
├── lib/
│   └── miniproject-cdk-stack.ts    # Stack definitions
├── config/
│   ├── default.json                # Base configuration
│   ├── dev.json                    # Development overrides
│   └── qa.json                     # QA overrides
├── test/
│   └── miniproject-cdk.test.ts     # Unit tests
├── .github/
│   └── workflows/                  # GitHub Actions workflows
└── cdk.json                        # CDK configuration
```

## Useful Commands

* `npm run build`   type-check the project
* `npm run watch`   watch for changes and type-check
* `npm run test`    perform the jest unit tests
* `STAGE=dev npx cdk synth`    generate CloudFormation for dev stage
* `STAGE=qa npx cdk synth`     generate CloudFormation for qa stage
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
