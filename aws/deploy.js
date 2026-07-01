#!/usr/bin/env node
/**
 * AWS S3 + CloudFront Deployment Script for Astrava
 * 
 * Prerequisites:
 * - AWS CLI installed and configured (aws configure)
 * - Node.js 18+
 * 
 * Usage: node aws/deploy.js
 */

const { execSync } = require('child_process');
const path = require('path');

const BUCKET_NAME = 'astrava-app';
const REGION = 'ap-south-1';
const DIST_PATH = path.resolve(__dirname, '..', 'dist');

function run(cmd, options = {}) {
  console.log(`\n> ${cmd}`);
  try {
    const output = execSync(cmd, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    if (output.trim()) console.log(output.trim());
    return output;
  } catch (error) {
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}

async function deploy() {
  console.log('🚀 Astrava AWS Deployment');
  console.log('========================\n');

  // Step 1: Build
  console.log('📦 Step 1: Building production bundle...');
  run('npm run build', { cwd: path.resolve(__dirname, '..') });
  console.log('✅ Build complete');

  // Step 2: Check if bucket exists, create if not
  console.log('\n🪣 Step 2: Setting up S3 bucket...');
  try {
    run(`aws s3api head-bucket --bucket ${BUCKET_NAME} --region ${REGION}`);
    console.log(`✅ Bucket ${BUCKET_NAME} already exists`);
  } catch {
    console.log(`Creating bucket ${BUCKET_NAME}...`);
    run(`aws s3 mb s3://${BUCKET_NAME} --region ${REGION}`);
    console.log(`✅ Bucket ${BUCKET_NAME} created`);
  }

  // Step 3: Disable block public access
  console.log('\n🔓 Step 3: Configuring public access...');
  run(`aws s3api put-public-access-block --bucket ${BUCKET_NAME} --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false`);

  // Step 4: Set bucket policy
  console.log('\n📋 Step 4: Setting bucket policy...');
  const policyPath = path.resolve(__dirname, 'bucket-policy.json');
  run(`aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file://${policyPath}`);
  console.log('✅ Bucket policy set');

  // Step 5: Enable static website hosting
  console.log('\n🌐 Step 5: Enabling website hosting...');
  run(`aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document index.html`);
  console.log('✅ Website hosting enabled');

  // Step 6: Sync files
  console.log('\n📤 Step 6: Uploading files to S3...');
  run(`aws s3 sync "${DIST_PATH}" s3://${BUCKET_NAME} --delete --cache-control "public, max-age=31536000" --exclude "index.html" --exclude "*.json"`);
  // Upload index.html and JSON with shorter cache
  run(`aws s3 sync "${DIST_PATH}" s3://${BUCKET_NAME} --delete --cache-control "public, max-age=0, must-revalidate" --include "index.html" --include "*.json" --exclude "*" --include "index.html" --include "manifest.webmanifest"`);
  // Re-upload index.html specifically
  run(`aws s3 cp "${DIST_PATH}\\index.html" s3://${BUCKET_NAME}/index.html --cache-control "public, max-age=0, must-revalidate" --content-type "text/html"`);
  console.log('✅ Files uploaded');

  // Step 7: Show the website URL
  const websiteUrl = `http://${BUCKET_NAME}.s3-website.${REGION}.amazonaws.com`;
  
  console.log('\n========================================');
  console.log('🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('========================================');
  console.log(`\n🌐 Website URL: ${websiteUrl}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Visit the URL above to see your live site');
  console.log('   2. (Optional) Set up CloudFront for HTTPS + CDN:');
  console.log(`      aws cloudfront create-distribution --distribution-config file://${path.resolve(__dirname, 'cloudfront-config.json')}`);
  console.log('   3. (Optional) Add a custom domain with Route 53');
  console.log('\n💡 For AWS Activate Program:');
  console.log('   - Your app is now hosted on AWS S3');
  console.log('   - Use the website URL when applying');
  console.log('   - Mention: S3, CloudFront, and serverless architecture');
}

deploy().catch((error) => {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
});
