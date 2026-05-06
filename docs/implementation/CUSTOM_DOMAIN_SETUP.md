# Custom Domain Setup Guide for Qala Studios

Complete guide to connect your custom domain to your AWS deployment.

---

## 🎯 What You'll Accomplish

- Connect custom domain to CloudFront (frontend)
- Setup SSL certificate (HTTPS)
- Configure domain for backend API
- Update all configurations

**Time Required**: 30-45 minutes  
**Cost**: Domain registration ($10-15/year)

---

## Phase 1: Buy a Domain (10 minutes)

### Option A: AWS Route 53 (Recommended)

1. Go to AWS Console → Search **"Route 53"**
2. Click **"Registered domains"** → **"Register domain"**
3. Search for your domain (e.g., `qalastudios.com`)
4. Add to cart and proceed to checkout
5. Fill in contact information
6. Complete purchase (~$12/year for .com)

### Option B: External Registrar (Namecheap, GoDaddy, etc.)

1. Go to your preferred registrar
2. Search and purchase domain
3. You'll configure DNS later

---

## Phase 2: Request SSL Certificate (15 minutes)

### Step 2.1: Go to Certificate Manager

1. AWS Console → Search **"Certificate Manager"**
2. **IMPORTANT**: Switch region to **US East (N. Virginia) us-east-1**
   - CloudFront requires certificates in us-east-1
3. Click **"Request certificate"**

### Step 2.2: Configure Certificate

**Certificate type:**
- Select **"Request a public certificate"**
- Click **"Next"**

**Domain names:**
- Fully qualified domain name: `yourdomain.com`
- Click **"Add another name to this certificate"**
- Add: `www.yourdomain.com`
- Click **"Add another name to this certificate"**
- Add: `api.yourdomain.com`

**Validation method:**
- Select **"DNS validation"**

**Key algorithm:**
- Select **"RSA 2048"**

**Tags** (optional):
- Key: `Name`
- Value: `qala-studios-cert`

3. Click **"Request"**

### Step 2.3: Validate Domain

**If using Route 53:**
1. Click on your certificate
2. Click **"Create records in Route 53"**
3. Select all domains
4. Click **"Create records"**
5. Wait 5-10 minutes for validation
6. Status will change to **"Issued"**

**If using external registrar:**
1. Click on your certificate
2. Expand each domain name
3. Copy the **CNAME name** and **CNAME value**
4. Go to your domain registrar's DNS settings
5. Add CNAME records for each domain
6. Wait 5-30 minutes for validation

---

## Phase 3: Configure CloudFront with Custom Domain (10 minutes)

### Step 3.1: Update CloudFront Distribution

1. Go to **CloudFront** console
2. Select your distribution
3. Click **"Edit"**

**Settings to update:**

**Alternate domain names (CNAMEs):**
- Add: `yourdomain.com`
- Add: `www.yourdomain.com`

**Custom SSL certificate:**
- Select your certificate from dropdown
- If not visible, wait for certificate validation to complete

4. Click **"Save changes"**
5. Wait 5-10 minutes for deployment

### Step 3.2: Configure DNS

**If using Route 53:**

1. Go to **Route 53** → **Hosted zones**
2. Click on your domain
3. Click **"Create record"**

**Record 1 - Root domain:**
- Record name: (leave empty)
- Record type: **A**
- Alias: **Yes**
- Route traffic to: **Alias to CloudFront distribution**
- Choose distribution: Select your CloudFront distribution
- Click **"Create records"**

**Record 2 - WWW subdomain:**
- Click **"Create record"**
- Record name: `www`
- Record type: **A**
- Alias: **Yes**
- Route traffic to: **Alias to CloudFront distribution**
- Choose distribution: Select your CloudFront distribution
- Click **"Create records"**

**If using external registrar:**

1. Go to your registrar's DNS settings
2. Add these records:

**A Record (or CNAME):**
- Type: `A` or `CNAME`
- Name: `@` (root)
- Value: Your CloudFront domain (e.g., `d1234abcd.cloudfront.net`)
- TTL: `3600`

**CNAME Record:**
- Type: `CNAME`
- Name: `www`
- Value: Your CloudFront domain
- TTL: `3600`

---

## Phase 4: Configure Backend Domain (10 minutes)

### Step 4.1: Add DNS Record for API

**If using Route 53:**

1. Go to **Route 53** → **Hosted zones**
2. Click on your domain
3. Click **"Create record"**
- Record name: `api`
- Record type: **A**
- Alias: **No**
- Value: Your EC2 Elastic IP
- TTL: `300`
- Click **"Create records"**

**If using external registrar:**

Add A record:
- Type: `A`
- Name: `api`
- Value: Your EC2 Elastic IP
- TTL: `3600`

### Step 4.2: Update Nginx Configuration

SSH into your EC2 server:

```bash
ssh -i ~/.ssh/qala-key.pem ubuntu@YOUR_ELASTIC_IP
```

Edit Nginx config:

```bash
sudo nano /etc/nginx/sites-available/qala-studios
```

Update the `server_name` line:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com YOUR_ELASTIC_IP;

    # Rest of configuration stays the same...
}
```

Save and exit, then test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4.3: Setup SSL for Backend (Optional but Recommended)

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Get SSL certificate:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

Follow prompts:
- Enter email address
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

Certbot will automatically:
- Get SSL certificate
- Update Nginx configuration
- Setup auto-renewal

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## Phase 5: Update Application Configuration (5 minutes)

### Step 5.1: Update Frontend API URL

Edit `Qala Studios/services/api.ts`:

```typescript
const API_URL = 'https://api.yourdomain.com/api';
```

### Step 5.2: Update Backend CORS

SSH into EC2 and edit backend config:

```bash
cd /home/ubuntu/qala-studios/Qala\ Studios/backend
nano src/index.ts
```

Update CORS configuration:

```typescript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:5173' // Keep for local development
  ],
  credentials: true
}));
```

Rebuild and restart:

```bash
npm run build
pm2 restart qala-backend
```

### Step 5.3: Commit and Push Changes

On your local machine:

```bash
git add .
git commit -m "Update API URL to custom domain"
git push origin main
```

GitHub Actions will automatically deploy the changes!

---

## Phase 6: Test Everything (5 minutes)

### Test Frontend

1. Open `https://yourdomain.com` in browser
2. Should load with HTTPS (green lock icon)
3. Test `https://www.yourdomain.com` (should also work)

### Test Backend API

```bash
curl https://api.yourdomain.com/api/health
```

Should return: `{"status":"ok"}`

### Test Complete Flow

1. Navigate through website
2. Try making a booking
3. Verify email confirmation arrives
4. Check all pages load correctly

---

## Phase 7: Update GitHub Secrets (Optional)

If you want to reference domain in workflows:

1. Go to GitHub → Settings → Secrets and variables → Actions
2. Add new secret:
   - Name: `DOMAIN_NAME`
   - Value: `yourdomain.com`

---

## ✅ Completion Checklist

- [ ] Domain purchased and configured
- [ ] SSL certificate issued and validated
- [ ] CloudFront updated with custom domain
- [ ] DNS records created (A, CNAME)
- [ ] Backend API domain configured
- [ ] SSL certificate installed on backend
- [ ] Frontend API URL updated
- [ ] Backend CORS updated
- [ ] Changes committed and deployed
- [ ] All URLs tested and working
- [ ] HTTPS working on all domains

---

## 🌐 Your Final URLs

- **Main Website**: `https://yourdomain.com`
- **WWW**: `https://www.yourdomain.com`
- **API**: `https://api.yourdomain.com/api`
- **Health Check**: `https://api.yourdomain.com/api/health`

---

## 📊 DNS Propagation

DNS changes can take time to propagate:
- **Route 53**: 5-10 minutes
- **External registrars**: 1-48 hours (usually 1-4 hours)

Check propagation status:
- https://dnschecker.org
- Enter your domain and check globally

---

## 🔧 Troubleshooting

### Domain not resolving

```bash
# Check DNS records
nslookup yourdomain.com
nslookup api.yourdomain.com

# Check with specific DNS server
nslookup yourdomain.com 8.8.8.8
```

### SSL certificate not working

1. Verify certificate is issued in Certificate Manager
2. Check CloudFront distribution is deployed
3. Clear browser cache
4. Wait for DNS propagation

### Backend API not accessible

```bash
# Test direct IP
curl http://YOUR_ELASTIC_IP/api/health

# Test domain
curl https://api.yourdomain.com/api/health

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### CORS errors

1. Check backend CORS configuration includes your domain
2. Verify frontend is using HTTPS
3. Check browser console for specific error
4. Restart backend: `pm2 restart qala-backend`

---

## 💰 Additional Costs

- **Domain registration**: $10-15/year
- **Route 53 hosted zone**: $0.50/month (if using Route 53)
- **SSL certificate**: FREE (AWS Certificate Manager)
- **DNS queries**: ~$0.40/month for 1M queries

**Total additional cost**: ~$11-16/year for domain + $6/year for Route 53

---

## 🎉 Success!

Your Qala Studios website now has:
- ✅ Professional custom domain
- ✅ HTTPS security on all endpoints
- ✅ Automatic SSL certificate renewal
- ✅ Fast global CDN delivery
- ✅ Secure API endpoint

**Share your website**: `https://yourdomain.com`

---

## 📚 Next Steps

1. **SEO Optimization**
   - Add sitemap.xml
   - Configure meta tags
   - Submit to Google Search Console

2. **Analytics**
   - Setup Google Analytics
   - Configure CloudWatch metrics
   - Monitor user behavior

3. **Performance**
   - Enable CloudFront compression
   - Optimize images
   - Add caching headers

4. **Marketing**
   - Share on social media
   - Create business cards with domain
   - Update email signatures

---

**Need help?** Check other guides:
- `DEPLOYMENT_GUIDE_CONSOLE.md` - Full deployment guide
- `QUICK_DEPLOY.md` - Command reference
- `AWS_COST_CALCULATOR.md` - Cost tracking
