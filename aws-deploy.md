# AWS Deployment Guide for Astrava

## Prerequisites
1. AWS Account (sign up at https://aws.amazon.com)
2. AWS CLI installed and configured
3. Node.js 18+ installed

## Step 1: Install AWS CLI

Download from: https://aws.amazon.com/cli/

Then configure:
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: ap-south-1 (Mumbai - closest to Indian users)
- Output format: json

## Step 2: Build the App

```bash
npm run build
```

This creates the `dist/` folder with production-ready files.

## Step 3: Create S3 Bucket

```bash
aws s3 mb s3://astrava-app --region ap-south-1
```

## Step 4: Configure Bucket for Static Website Hosting

```bash
aws s3 website s3://astrava-app --index-document index.html --error-document index.html
```

## Step 5: Set Bucket Policy (Public Read)

```bash
aws s3api put-bucket-policy --bucket astrava-app --policy file://aws/bucket-policy.json
```

## Step 6: Deploy

```bash
aws s3 sync dist/ s3://astrava-app --delete
```

## Step 7: Create CloudFront Distribution (CDN)

```bash
aws cloudfront create-distribution --distribution-config file://aws/cloudfront-config.json
```

## Step 8: (Optional) Custom Domain

If you have a domain, you can point it to the CloudFront distribution using Route 53 or your DNS provider.

## Quick Deploy Script

Run the automated deployment:
```bash
npm run deploy:aws
```

## AWS Services Used (for Activate Program)
- **Amazon S3** - Static file storage
- **Amazon CloudFront** - Global CDN
- **AWS Lambda** (optional) - Serverless API endpoints
- **Amazon Route 53** (optional) - DNS management

## Estimated Monthly Cost
- S3: ~$0.50/month (for static assets)
- CloudFront: Free tier covers 1TB/month transfer
- Total: Under $5/month for moderate traffic

## AWS Activate Program
To apply for AWS Activate credits:
1. Go to https://aws.amazon.com/activate/
2. Select your program tier (Portfolio or Founders)
3. Provide your website URL (the CloudFront URL)
4. Describe your startup: "AI-powered agricultural intelligence platform"
5. Show AWS usage in your architecture
