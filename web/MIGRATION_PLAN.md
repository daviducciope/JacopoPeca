# Jacopo Peca Migration Plan

## Current verified state
- DNS apex points to a running Lightsail WordPress instance in eu-central-1.
- Daily auto-snapshots exist for the last 7 days.
- No S3 bucket, CloudFront distribution, or ACM certificate currently exists for jacopopeca.com.
- WordPress data is likely stored on the Lightsail instance disk.

## Target architecture
- Next.js storefront hosted behind CloudFront.
- Postgres for products, variants, orders, and admin users.
- S3 for product images and imported WordPress media.
- Stripe Checkout + webhook processing.
- Private admin area for product uploads and sales stats.

## Immediate migration sequence
1. Create a manual pre-migration snapshot of the Lightsail instance.
2. Clone or restore the instance from snapshot to extract:
   - wp-content/uploads
   - wp-config.php
   - WordPress database dump
3. Normalize images and map recovered products into the new Prisma schema.
4. Configure staging bucket, CloudFront distribution, and ACM certificate.
5. Deploy the new Next.js app to staging.
6. Validate catalog, checkout, admin, and asset loading.
7. Switch Route 53 to CloudFront.
8. Keep Lightsail read-only during burn-in, then stop and remove it.

## Missing AWS permissions to complete end-to-end automation
- lightsail:CreateInstanceSnapshot
- lightsail:CreateInstancesFromSnapshot
- lightsail:DeleteInstanceSnapshot
- lightsail:StopInstance
- lightsail:DeleteInstance
- lightsail:OpenInstancePublicPorts
- lightsail:CloseInstancePublicPorts
- lightsail:RebootInstance
- lightsail:GetInstanceScreenshot
- route53:ChangeResourceRecordSets
- acm:RequestCertificate
- acm:AddTagsToCertificate
- s3:CreateBucket
- s3:PutBucketPolicy
- s3:PutBucketWebsite
- s3:PutBucketPublicAccessBlock
- s3:PutBucketCors
- s3:PutEncryptionConfiguration
- s3:PutObject
- s3:DeleteObject
- cloudfront:CreateDistribution
- cloudfront:UpdateDistribution
- cloudfront:CreateInvalidation
- cloudfront:TagResource
- iam:PassRole (only if deployment roles are used)
