# GitHub Actions Automation - Complete Setup Guide

Your GitHub workflows are already created! This guide helps you complete the setup and verify everything works.

---

## ✅ What's Already Done

You have two workflow files:
- `.github/workflows/deploy-backend.yml` - Auto-deploys backend to EC2
- `.github/workflows/deploy-frontend.yml` - Auto-deploys frontend to S3 + CloudFront

---

## 🔑 Required GitHub Secrets

You need to add these secrets to your GitHub repository.

### How to Add Secrets

1. Go to your GitHub repository: `https://github.com/harsh-dronie/qala-studios`
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"** for each secret below

---

## Backend Deployment Secrets

### 1. EC2_HOST
- **Name**: `EC2_HOST`
- **Value**: Your EC2 Elastic IP address
- **Example**: `54.123.45.67`
- **Where to find**: AWS Console → EC2 → Elastic IPs

### 2. EC2_SSH_KEY
- **Name**: `EC2_SSH_KEY`
- **Value**: Complete content of your `qala-key.pem` file
- **How to get**:
  ```bash
  cat ~/.ssh/qala-key.pem
  ```
- Copy the entire output including:
  ```
  -----BEGIN RSA PRIVATE KEY-----
  [content]
  -----END RSA PRIVATE KEY-----
  ```

---

## Frontend Deployment Secrets

### 3. AWS_ACCESS_KEY_ID
- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: Your IAM user access key ID
- **Format**: `AKIAIOSFODNN7EXAMPLE`

### 4. AWS_SECRET_ACCESS_KEY
- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: Your IAM user secret access key
- **Format**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**Don't have IAM credentials yet?** See "Create IAM User" section below.

### 5. S3_BUCKET
- **Name**: `S3_BUCKET`
- **Value**: Your S3 bucket name
- **Example**: `qala-studios-frontend-harsh`
- **Where to find**: AWS Console → S3 → Buckets

### 6. CLOUDFRONT_DISTRIBUTION_ID
- **Name**: `CLOUDFRONT_DISTRIBUTION_ID`
- **Value**: Your CloudFront distribution ID
- **Format**: `E1234ABCDEFGHI`
- **Where to find**: AWS Console → CloudFront → Distributions → ID column

---

## 🔐 Create IAM User (If Not Done)

### Step 1: Create User

1. AWS Console → Search **"IAM"**
2. Click **"Users"** → **"Create user"**
3. User name: `github-actions`
4. Click **"Next"**

### Step 2: Attach Policies

Select **"Attach policies directly"** and add:
- `AmazonS3FullAccess`
- `CloudFrontFullAccess`

Click **"Next"** → **"Create user"**

### Step 3: Create Access Keys

1. Click on the `github-actions` user
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. Use case: **"Application running outside AWS"**
6. Click **"Next"**
7. Description: `GitHub Actions deployment`
8. Click **"Create access key"**
9. **COPY BOTH VALUES NOW** - you can't see the secret again!
   - Access key ID
   - Secret access key
10. Click **"Done"**

---

## ✅ Verify All Secrets Are Added

Your GitHub secrets page should show:

```
EC2_HOST                        Updated X minutes ago
EC2_SSH_KEY                     Updated X minutes ago
AWS_ACCESS_KEY_ID               Updated X minutes ago
AWS_SECRET_ACCESS_KEY           Updated X minutes ago
S3_BUCKET                       Updated X minutes ago
CLOUDFRONT_DISTRIBUTION_ID      Updated X minutes ago
```

---

## 🧪 Test Your Automation

### Test 1: Backend Deployment

1. Make a small change to backend code:
   ```bash
   cd "Qala Studios/backend"
   echo "// Test change" >> src/index.ts
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "test: backend deployment"
   git push origin main
   ```

3. Watch the deployment:
   - Go to GitHub → **"Actions"** tab
   - You should see "Deploy Backend to EC2" workflow running
   - Click on it to see live logs
   - Wait for completion (green checkmark)

4. Verify on server:
   ```bash
   ssh -i ~/.ssh/qala-key.pem ubuntu@YOUR_ELASTIC_IP
   pm2 logs qala-backend --lines 20
   ```

### Test 2: Frontend Deployment

1. Make a small change to frontend:
   ```bash
   cd "Qala Studios"
   # Edit any component file
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "test: frontend deployment"
   git push origin main
   ```

3. Watch the deployment:
   - Go to GitHub → **"Actions"** tab
   - You should see "Deploy Frontend to S3" workflow running
   - Wait for completion

4. Verify:
   - Open your CloudFront URL
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Changes should be visible

---

## 🔄 How the Automation Works

### Backend Workflow Triggers

Runs when you push changes to:
- Any file in `Qala Studios/backend/**`
- On `main` branch only

**What it does:**
1. SSH into your EC2 server
2. Navigate to project directory
3. Pull latest code from GitHub
4. Install dependencies
5. Build the project
6. Restart PM2 process
7. Save PM2 configuration

### Frontend Workflow Triggers

Runs when you push changes to:
- Any file in `Qala Studios/**`
- EXCEPT files in `Qala Studios/backend/**`
- On `main` branch only

**What it does:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Build React app
5. Upload to S3 bucket
6. Invalidate CloudFront cache
7. Your changes are live!

---

## 🐛 Troubleshooting

### Workflow Fails: "Permission denied (publickey)"

**Problem**: SSH key not configured correctly

**Solution**:
1. Verify `EC2_SSH_KEY` secret contains complete key file
2. Check key includes BEGIN and END lines
3. Ensure no extra spaces or newlines

### Workflow Fails: "Access Denied" on S3

**Problem**: IAM user doesn't have S3 permissions

**Solution**:
1. Go to IAM → Users → `github-actions`
2. Verify `AmazonS3FullAccess` policy is attached
3. Try creating new access keys

### Workflow Fails: CloudFront Invalidation

**Problem**: Wrong distribution ID or missing permissions

**Solution**:
1. Verify `CLOUDFRONT_DISTRIBUTION_ID` is correct
2. Check IAM user has `CloudFrontFullAccess` policy
3. Ensure distribution is in "Deployed" state

### Backend Deploys but Doesn't Restart

**Problem**: PM2 process name mismatch

**Solution**:
SSH into server and check:
```bash
pm2 list
```

If process name is different, update workflow:
```yaml
pm2 restart YOUR_ACTUAL_PROCESS_NAME
```

### Frontend Deploys but Changes Not Visible

**Problem**: CloudFront cache not invalidated

**Solution**:
1. Manually invalidate cache:
   - Go to CloudFront console
   - Select distribution
   - Click "Invalidations" tab
   - Create invalidation for `/*`
2. Hard refresh browser (Ctrl+Shift+R)

---

## 📊 Monitor Your Deployments

### View Workflow History

1. Go to GitHub → **"Actions"** tab
2. See all past deployments
3. Click any workflow to see:
   - Execution time
   - Logs for each step
   - Success/failure status

### Setup Notifications

Get notified when deployments fail:

1. GitHub → Settings → Notifications
2. Enable "Actions" notifications
3. Choose email or GitHub notifications

### View Deployment Logs

**Backend logs:**
```bash
ssh -i ~/.ssh/qala-key.pem ubuntu@YOUR_ELASTIC_IP
pm2 logs qala-backend
```

**Frontend logs:**
- Check GitHub Actions workflow logs
- Check CloudFront access logs (if enabled)

---

## 🚀 Advanced Automation

### Add Environment-Specific Deployments

Create separate workflows for staging and production:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [ develop ]

# .github/workflows/deploy-production.yml
on:
  push:
    branches: [ main ]
```

### Add Automated Testing

Update workflows to run tests before deployment:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    # ... deployment steps
```

### Add Slack Notifications

Get deployment notifications in Slack:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment completed!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Add Database Migrations

Automatically run migrations on backend deployment:

```yaml
script: |
  cd qala-studios/Qala\ Studios/backend
  git pull origin main
  npm install
  npx prisma migrate deploy  # Add this line
  npm run build
  pm2 restart qala-backend
```

---

## 📋 Deployment Checklist

Before each deployment:

- [ ] Code tested locally
- [ ] All tests passing
- [ ] Environment variables updated (if needed)
- [ ] Database migrations ready (if needed)
- [ ] Breaking changes documented
- [ ] Rollback plan prepared

After each deployment:

- [ ] Verify workflow completed successfully
- [ ] Test website functionality
- [ ] Check backend health endpoint
- [ ] Monitor error logs
- [ ] Verify email functionality
- [ ] Check database connections

---

## 🔒 Security Best Practices

### Rotate Access Keys Regularly

Every 90 days:
1. Create new IAM access keys
2. Update GitHub secrets
3. Test deployment
4. Delete old access keys

### Limit IAM Permissions

Instead of `FullAccess`, create custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/YOUR_DIST_ID"
    }
  ]
}
```

### Protect Main Branch

1. GitHub → Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

---

## 💡 Pro Tips

1. **Use Pull Requests**: Don't push directly to main
2. **Tag Releases**: Use semantic versioning (v1.0.0)
3. **Monitor Costs**: Check AWS billing after each deployment
4. **Keep Logs**: PM2 logs rotate automatically
5. **Backup Before Deploy**: Automated backups run daily at 2 AM
6. **Test Locally First**: Always test changes locally
7. **Small Commits**: Deploy small changes frequently
8. **Document Changes**: Write clear commit messages

---

## 📈 Deployment Metrics

Track these metrics:

- **Deployment frequency**: How often you deploy
- **Deployment duration**: Time from push to live
- **Success rate**: Percentage of successful deployments
- **Rollback frequency**: How often you need to rollback
- **Time to recovery**: Time to fix failed deployments

**Good targets:**
- Deploy at least once per week
- 95%+ success rate
- < 5 minutes deployment time
- < 15 minutes time to recovery

---

## 🎯 What's Next?

Now that automation is complete:

1. **Setup Custom Domain** (see `CUSTOM_DOMAIN_SETUP.md`)
2. **Add Monitoring** (CloudWatch, Sentry)
3. **Setup Staging Environment**
4. **Add Automated Tests**
5. **Configure Backup Verification**
6. **Setup Performance Monitoring**

---

## ✅ Success Criteria

Your automation is complete when:

- [ ] All 6 GitHub secrets added
- [ ] Backend workflow runs successfully
- [ ] Frontend workflow runs successfully
- [ ] Changes deploy automatically on push
- [ ] CloudFront cache invalidates automatically
- [ ] PM2 restarts backend automatically
- [ ] No manual deployment steps needed
- [ ] Deployment takes < 5 minutes
- [ ] You can deploy from anywhere

---

## 🎉 Congratulations!

You now have:
- ✅ Fully automated deployments
- ✅ Push to deploy workflow
- ✅ Separate backend and frontend pipelines
- ✅ Automatic cache invalidation
- ✅ Zero-downtime deployments
- ✅ Professional CI/CD setup

**Just push your code and it goes live automatically!**

---

**Questions?** Check these guides:
- `DEPLOYMENT_GUIDE_CONSOLE.md` - Full deployment guide
- `CUSTOM_DOMAIN_SETUP.md` - Domain configuration
- `QUICK_DEPLOY.md` - Command reference
