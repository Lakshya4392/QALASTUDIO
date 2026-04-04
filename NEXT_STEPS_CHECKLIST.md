# Next Steps Checklist - Qala Studios

Quick checklist to complete your deployment setup.

---

## 🎯 Priority 1: Complete GitHub Automation (15 minutes)

Follow: `GITHUB_AUTOMATION_COMPLETE.md`

- [ ] Go to GitHub → Settings → Secrets and variables → Actions
- [ ] Add `EC2_HOST` secret (your Elastic IP)
- [ ] Add `EC2_SSH_KEY` secret (content of qala-key.pem file)
- [ ] Create IAM user `github-actions` in AWS
- [ ] Add `AWS_ACCESS_KEY_ID` secret
- [ ] Add `AWS_SECRET_ACCESS_KEY` secret
- [ ] Add `S3_BUCKET` secret (your bucket name)
- [ ] Add `CLOUDFRONT_DISTRIBUTION_ID` secret
- [ ] Test: Make a small code change and push
- [ ] Verify: Check GitHub Actions tab for successful deployment

**Result**: Automatic deployments on every push to main branch

---

## 🎯 Priority 2: Setup Custom Domain (45 minutes)

Follow: `CUSTOM_DOMAIN_SETUP.md`

### Phase 1: Get Domain
- [ ] Buy domain (Route 53 or external registrar)
- [ ] Note down domain name: `________________`

### Phase 2: SSL Certificate
- [ ] Go to AWS Certificate Manager (us-east-1 region)
- [ ] Request certificate for:
  - [ ] `yourdomain.com`
  - [ ] `www.yourdomain.com`
  - [ ] `api.yourdomain.com`
- [ ] Validate via DNS (automatic if Route 53)
- [ ] Wait for "Issued" status

### Phase 3: Configure CloudFront
- [ ] Add domain to CloudFront alternate domain names
- [ ] Select SSL certificate
- [ ] Wait for deployment

### Phase 4: Configure DNS
- [ ] Add A record: `@` → CloudFront distribution
- [ ] Add A record: `www` → CloudFront distribution
- [ ] Add A record: `api` → EC2 Elastic IP

### Phase 5: Update Backend
- [ ] SSH into EC2
- [ ] Update Nginx config with domain
- [ ] Install Certbot and get SSL for API
- [ ] Update backend CORS settings
- [ ] Restart services

### Phase 6: Update Frontend
- [ ] Update API URL in `services/api.ts`
- [ ] Commit and push (auto-deploys via GitHub Actions)

### Phase 7: Test
- [ ] Visit `https://yourdomain.com` (should work)
- [ ] Visit `https://www.yourdomain.com` (should work)
- [ ] Test `https://api.yourdomain.com/api/health`
- [ ] Complete a test booking
- [ ] Verify email confirmation

**Result**: Professional domain with HTTPS everywhere

---

## 🎯 Priority 3: Verify Everything Works (10 minutes)

### Backend Health
```bash
# Test via IP
curl http://YOUR_ELASTIC_IP/api/health

# Test via domain (after setup)
curl https://api.yourdomain.com/api/health
```

Expected: `{"status":"ok"}`

### Frontend
- [ ] Website loads on CloudFront URL
- [ ] Website loads on custom domain (after setup)
- [ ] All pages navigate correctly
- [ ] Images and assets load
- [ ] No console errors

### Complete Booking Flow
- [ ] Fill out booking form
- [ ] Submit booking
- [ ] Check confirmation message
- [ ] Verify email received
- [ ] Check database entry (optional)

### GitHub Actions
- [ ] Make a code change
- [ ] Push to GitHub
- [ ] Check Actions tab
- [ ] Verify automatic deployment
- [ ] Confirm changes are live

---

## 🎯 Optional: Additional Improvements

### Security Enhancements
- [ ] Setup AWS WAF for CloudFront
- [ ] Enable CloudFront access logs
- [ ] Configure rate limiting
- [ ] Setup Fail2Ban on EC2
- [ ] Enable AWS GuardDuty

### Monitoring & Alerts
- [ ] Setup CloudWatch alarms for CPU
- [ ] Setup CloudWatch alarms for memory
- [ ] Setup CloudWatch alarms for disk space
- [ ] Configure SNS email notifications
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)

### Performance Optimization
- [ ] Enable CloudFront compression
- [ ] Optimize images (WebP format)
- [ ] Add caching headers
- [ ] Enable HTTP/2
- [ ] Minify CSS/JS (already done by Vite)

### SEO & Analytics
- [ ] Add Google Analytics
- [ ] Create sitemap.xml
- [ ] Add robots.txt
- [ ] Configure meta tags
- [ ] Submit to Google Search Console
- [ ] Setup Google Business Profile

### Backup & Recovery
- [ ] Test database backup restoration
- [ ] Document recovery procedures
- [ ] Setup S3 versioning
- [ ] Create disaster recovery plan
- [ ] Test complete system restore

### Development Workflow
- [ ] Create staging environment
- [ ] Setup branch protection rules
- [ ] Add automated testing
- [ ] Configure code quality checks
- [ ] Setup pre-commit hooks

---

## 📊 Cost Monitoring

### Daily (First Week)
- [ ] Check AWS billing dashboard
- [ ] Verify free tier usage
- [ ] Monitor CloudFront data transfer
- [ ] Check S3 storage costs

### Weekly
- [ ] Review cost trends
- [ ] Check for unexpected charges
- [ ] Verify budget alerts working
- [ ] Optimize if needed

### Monthly
- [ ] Full cost analysis
- [ ] Compare to budget
- [ ] Identify optimization opportunities
- [ ] Update cost projections

**Expected monthly cost**: ~$12-15 (free for 4 months with $50 credit)

---

## 🎓 Learning Resources

### AWS Documentation
- [ ] EC2 User Guide
- [ ] S3 Developer Guide
- [ ] CloudFront Developer Guide
- [ ] Route 53 Developer Guide
- [ ] Certificate Manager User Guide

### Best Practices
- [ ] AWS Well-Architected Framework
- [ ] Security best practices
- [ ] Cost optimization guide
- [ ] Performance efficiency pillar

---

## 📝 Documentation to Keep

Save these details in a secure location:

### AWS Resources
- [ ] EC2 Instance ID: `________________`
- [ ] Elastic IP: `________________`
- [ ] S3 Bucket Name: `________________`
- [ ] CloudFront Distribution ID: `________________`
- [ ] CloudFront Domain: `________________`
- [ ] Route 53 Hosted Zone ID: `________________`

### Credentials (Store Securely!)
- [ ] Database password
- [ ] Zoho email credentials
- [ ] AWS IAM access keys
- [ ] SSH key location
- [ ] Domain registrar login

### URLs
- [ ] Production website: `________________`
- [ ] API endpoint: `________________`
- [ ] GitHub repository: `________________`
- [ ] AWS Console: `https://console.aws.amazon.com`

---

## 🆘 Quick Reference

### SSH into Server
```bash
ssh -i ~/.ssh/qala-key.pem ubuntu@YOUR_ELASTIC_IP
```

### Check Backend Status
```bash
pm2 status
pm2 logs qala-backend
```

### Restart Backend
```bash
pm2 restart qala-backend
```

### Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

### View Logs
```bash
# Backend logs
pm2 logs qala-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Database Access
```bash
psql -U qala_user -d studio_booking_system
```

### Manual Backup
```bash
pg_dump -U qala_user studio_booking_system > backup_$(date +%Y%m%d).sql
```

---

## ✅ Success Criteria

Your deployment is complete when:

- [x] Backend deployed to EC2
- [x] Frontend deployed to S3 + CloudFront
- [ ] GitHub Actions configured and working
- [ ] Custom domain configured (optional)
- [ ] SSL certificates installed
- [ ] All tests passing
- [ ] Email confirmations working
- [ ] Monitoring and alerts setup
- [ ] Backups configured and tested
- [ ] Documentation complete

---

## 🎉 What You've Accomplished

Once everything is checked off:

✅ **Production-ready website** on AWS  
✅ **Automatic deployments** via GitHub Actions  
✅ **Professional custom domain** with HTTPS  
✅ **Secure infrastructure** with firewall and SSL  
✅ **Automated backups** of database  
✅ **Cost-effective hosting** (~$12/month)  
✅ **Monitoring and alerts** via CloudWatch  
✅ **Scalable architecture** ready to grow  

---

## 📞 Support Resources

### Documentation Files
- `DEPLOYMENT_GUIDE_CONSOLE.md` - Complete deployment guide
- `GITHUB_AUTOMATION_COMPLETE.md` - GitHub Actions setup
- `CUSTOM_DOMAIN_SETUP.md` - Domain configuration
- `QUICK_DEPLOY.md` - Command reference
- `AWS_COST_CALCULATOR.md` - Cost breakdown

### Online Resources
- AWS Support: https://console.aws.amazon.com/support
- AWS Documentation: https://docs.aws.amazon.com
- GitHub Actions Docs: https://docs.github.com/actions
- Stack Overflow: https://stackoverflow.com

### Community
- AWS Forums: https://forums.aws.amazon.com
- Reddit r/aws: https://reddit.com/r/aws
- Dev.to AWS tag: https://dev.to/t/aws

---

## 🚀 Ready to Launch?

**Start with Priority 1**: Complete GitHub automation (15 minutes)

Then move to **Priority 2**: Setup custom domain (45 minutes)

**Total time to complete**: ~1 hour

**You've got this!** 🎉

---

**Last Updated**: March 6, 2026  
**Status**: Ready for deployment  
**Next Action**: Complete GitHub Automation
