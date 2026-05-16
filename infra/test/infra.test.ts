import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InfraStack } from '../lib/infra-stack';

let template: Template;

beforeAll(() => {
  const app = new cdk.App();
  const stack = new InfraStack(app, 'TestStack');
  template = Template.fromStack(stack);
});

test('S3 bucket is created with public access blocked', () => {
  template.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });
});

test('CloudFront distribution uses PRICE_CLASS_100', () => {
  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      PriceClass: 'PriceClass_100',
    },
  });
});

test('CloudFront distribution redirects HTTP to HTTPS', () => {
  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      DefaultCacheBehavior: {
        ViewerProtocolPolicy: 'redirect-to-https',
      },
    },
  });
});

test('CloudFront handles 403 and 404 errors by serving index.html', () => {
  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      CustomErrorResponses: [
        { ErrorCode: 403, ResponseCode: 200, ResponsePagePath: '/index.html' },
        { ErrorCode: 404, ResponseCode: 200, ResponsePagePath: '/index.html' },
      ],
    },
  });
});

test('CloudFrontURL output is defined', () => {
  template.hasOutput('CloudFrontURL', {});
});

test('BucketName output is defined', () => {
  template.hasOutput('BucketName', {});
});
