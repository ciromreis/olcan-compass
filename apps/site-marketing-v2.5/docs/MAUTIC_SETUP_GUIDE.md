# 🎯 Mautic Setup Guide for Olcan
## Complete Marketing Automation Configuration

**Version**: Olcan Compass v2.5  
**Date**: March 27, 2026

---

## 📋 Overview

Mautic is your marketing automation platform that will:
- Track visitor behavior on your website
- Capture and score leads automatically
- Send automated email campaigns
- Segment contacts based on behavior
- Provide detailed analytics and reporting

---

## 🚀 Part 1: Mautic Installation

### Option A: Docker Installation (Recommended for Development)

```bash
# Create docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mautic_db
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mautic
      MYSQL_USER: mautic
      MYSQL_PASSWORD: mauticpassword
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - mautic_network

  mautic:
    image: mautic/mautic:latest
    container_name: mautic_app
    depends_on:
      - mysql
    ports:
      - "8080:80"
    environment:
      MAUTIC_DB_HOST: mysql
      MAUTIC_DB_USER: mautic
      MAUTIC_DB_PASSWORD: mauticpassword
      MAUTIC_DB_NAME: mautic
      MAUTIC_TRUSTED_PROXIES: 0.0.0.0/0
    volumes:
      - mautic_data:/var/www/html
    networks:
      - mautic_network

volumes:
  mysql_data:
  mautic_data:

networks:
  mautic_network:
```

```bash
# Start Mautic
docker-compose up -d

# Access Mautic
open http://localhost:8080
```

### Option B: Production Installation (DigitalOcean)

```bash
# Create a Droplet (Ubuntu 22.04)
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y nginx mysql-server php8.1 php8.1-fpm php8.1-mysql \
  php8.1-xml php8.1-curl php8.1-zip php8.1-gd php8.1-mbstring \
  php8.1-intl php8.1-bcmath certbot python3-certbot-nginx

# Download Mautic
cd /var/www
wget https://github.com/mautic/mautic/releases/download/5.0.0/5.0.0.zip
unzip 5.0.0.zip -d mautic
chown -R www-data:www-data mautic
chmod -R 755 mautic

# Configure Nginx
nano /etc/nginx/sites-available/mautic

# Add configuration:
server {
    listen 80;
    server_name mautic.olcan.com.br;
    root /var/www/mautic;
    index index.php;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/mautic /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d mautic.olcan.com.br

# Access Mautic
open https://mautic.olcan.com.br
```

---

## ⚙️ Part 2: Initial Configuration

### Step 1: Complete Installation Wizard

1. **Database Configuration**:
   - Database Driver: MySQL PDO
   - Database Host: localhost (or mysql for Docker)
   - Database Name: mautic
   - Database Username: mautic
   - Database Password: [your password]

2. **Admin User**:
   - First Name: Olcan
   - Last Name: Admin
   - Email: admin@olcan.com.br
   - Username: admin
   - Password: [secure password]

3. **Email Configuration**:
   - Mailer: SMTP
   - From Name: Olcan
   - From Email: contato@olcan.com.br
   - SMTP Host: smtp.gmail.com (or your provider)
   - SMTP Port: 587
   - Encryption: TLS
   - Username: [your email]
   - Password: [app password]

### Step 2: Enable API Access

1. Go to **Settings** (gear icon) → **Configuration**
2. Click **API Settings** tab
3. Enable API: **Yes**
4. Enable HTTP basic auth: **Yes**
5. Enable OAuth2: **Yes**
6. Save & Close

### Step 3: Create API Credentials

1. Go to **Settings** → **API Credentials**
2. Click **New**
3. Name: "Olcan Website"
4. Is Published: Yes
5. OAuth 2:
   - Grant Type: Client Credentials
   - Redirect URI: https://www.olcan.com.br/api/auth/callback
6. Save & Close
7. **Copy Client ID and Client Secret** - you'll need these

---

## 📝 Part 3: Create Forms

### Form 1: Newsletter Signup

1. Go to **Components** → **Forms**
2. Click **New**
3. Configure:
   - Name: Newsletter Signup
   - Form Type: Campaign
   - Publish: Yes

4. **Add Fields**:
   - Email (required, type: email)
   - First Name (optional, type: text)

5. **Actions**:
   - Add to segment: "Newsletter Subscribers"
   - Send email: "Welcome Email"
   - Add points: +5

6. **Save & Close**
7. **Copy Form ID** from URL (e.g., /s/forms/view/1 → ID is 1)

### Form 2: Resource Download

1. Create new form: "Resource Download"
2. **Fields**:
   - Email (required)
   - First Name (required)
   - Resource Interest (select dropdown)

3. **Actions**:
   - Add to segment: "Resource Downloaders"
   - Send email: "Resource Download Link"
   - Add points: +10

### Form 3: Consultation Request

1. Create new form: "Consultation Request"
2. **Fields**:
   - Email (required)
   - First Name (required)
   - Last Name (required)
   - Phone (optional)
   - Product Interest (select)
   - Message (textarea)

3. **Actions**:
   - Add to segment: "Sales Qualified Leads"
   - Send email: "Consultation Confirmation"
   - Add points: +30
   - Send notification to: vendas@olcan.com.br

---

## 🎯 Part 4: Lead Scoring

### Configure Point Actions

1. Go to **Settings** → **Points**
2. Create point triggers:

**Website Actions**:
- Page Visit (any): +1 point
- Blog Post Read: +2 points
- Product Page Visit: +15 points
- Pricing Page Visit: +20 points

**Form Actions**:
- Newsletter Signup: +5 points
- Resource Download: +10 points
- Webinar Registration: +20 points
- Consultation Request: +30 points

**Email Actions**:
- Email Open: +1 point
- Email Click: +5 points
- Email Reply: +10 points

**Conversion Actions**:
- Product Purchase: +100 points
- Course Enrollment: +100 points

### Create Point Triggers

1. Go to **Settings** → **Point Triggers**
2. Create trigger: "Sales Qualified Lead"
   - Minimum Points: 50
   - Action: Add to segment "SQLs"
   - Action: Send notification to sales team

---

## 📧 Part 5: Email Campaigns

### Campaign 1: Welcome Sequence

1. Go to **Campaigns**
2. Click **New**
3. Name: "Newsletter Welcome Sequence"

**Campaign Builder**:
```
[Start] → Contact subscribes to newsletter
    ↓
[Send Email] Welcome + Free Guide
    ↓
[Wait] 2 days
    ↓
[Send Email] Curso Cidadão do Mundo Introduction
    ↓
[Wait] 3 days
    ↓
[Send Email] Success Story
    ↓
[Wait] 2 days
    ↓
[Send Email] Limited Offer (10% discount)
    ↓
[Decision] Did they purchase?
    ├─ Yes → [End]
    └─ No → [Wait] 7 days → [Send Email] Last Chance
```

### Campaign 2: Product Interest

1. Create campaign: "Product Interest Nurture"

**Campaign Builder**:
```
[Start] → Contact visits product page
    ↓
[Wait] 1 hour
    ↓
[Send Email] Product Overview
    ↓
[Wait] 1 day
    ↓
[Send Email] Features & Benefits
    ↓
[Wait] 2 days
    ↓
[Send Email] Testimonials
    ↓
[Wait] 2 days
    ↓
[Send Email] Special Offer
```

### Campaign 3: Abandoned Cart

1. Create campaign: "Abandoned Checkout Recovery"

**Campaign Builder**:
```
[Start] → Checkout started, not completed
    ↓
[Wait] 1 hour
    ↓
[Send Email] Complete Your Enrollment
    ↓
[Decision] Did they complete?
    ├─ Yes → [End]
    └─ No → Continue
        ↓
    [Wait] 23 hours
        ↓
    [Send Email] We Can Help + FAQ
        ↓
    [Decision] Did they complete?
        ├─ Yes → [End]
        └─ No → Continue
            ↓
        [Wait] 2 days
            ↓
        [Send Email] 5% Discount Offer
            ↓
        [Wait] 2 days
            ↓
        [Send Email] Final Reminder
```

---

## 👥 Part 6: Segments

### Create Segments

1. **Newsletter Subscribers**:
   - Filter: Has tag "newsletter_subscriber"
   - Or: Submitted form "Newsletter Signup"

2. **Resource Downloaders**:
   - Filter: Submitted form "Resource Download"
   - Or: Has tag "resource_downloader"

3. **Sales Qualified Leads (SQLs)**:
   - Filter: Points ≥ 50
   - And: Not in segment "Customers"

4. **Product Interest**:
   - Filter: Visited page "/produtos/*"
   - And: Not in segment "Customers"

5. **Customers**:
   - Filter: Has tag "customer"
   - Or: Submitted form "Course Enrollment"

6. **Inactive Contacts**:
   - Filter: Last activity > 90 days ago
   - And: Not in segment "Customers"

---

## 🔗 Part 7: Website Integration

### Add Tracking Code to Website

The tracking code is already integrated in `/app/layout.tsx`:

```typescript
{mauticUrl && (
  <Script
    id="mautic-tracking"
    strategy="afterInteractive"
    dangerouslySetInnerHTML={{
      __html: `
        (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
          w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
          m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
        })(window,document,'script','${mauticUrl}/mtc.js','mt');
        mt('send', 'pageview');
      `,
    }}
  />
)}
```

### Configure CORS in Mautic

1. Go to **Settings** → **Configuration**
2. Click **System Settings** tab
3. Add to **CORS Valid Domains**:
   ```
   https://www.olcan.com.br
   https://olcan.com.br
   http://localhost:3000
   ```
4. Save

---

## 📊 Part 8: Testing

### Test Tracking

1. **Visit your website** in incognito mode
2. **Open Mautic** → **Contacts** → **Anonymous Visitors**
3. You should see your visit tracked
4. Click on the visitor to see details

### Test Form Submission

1. **Submit newsletter form** on website
2. **Check Mautic** → **Contacts**
3. Should see new contact created
4. Check contact's timeline for form submission
5. Verify points were added (+5)

### Test Email Campaign

1. **Manually add contact** to "Newsletter Subscribers" segment
2. **Check Campaigns** → Campaign should start
3. **Wait for email** to be sent (check queue)
4. **Verify email received**

---

## 🎛️ Part 9: Advanced Configuration

### Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Create webhook for "Purchase Event"
   - URL: https://www.olcan.com.br/api/webhooks/mautic
   - Events: Form submission, Page hit, Email open
   - Send test payload

### Set Up Dynamic Content

1. Go to **Components** → **Dynamic Content**
2. Create personalized content blocks
3. Use in emails: `{dynamiccontent="block-name"}`

### Configure Landing Pages

1. Go to **Components** → **Landing Pages**
2. Create landing pages for campaigns
3. Use Mautic's page builder
4. Integrate with forms and campaigns

---

## 📈 Part 10: Monitoring & Optimization

### Daily Tasks

1. **Check Dashboard**:
   - New contacts
   - Campaign performance
   - Email deliverability

2. **Review SQLs**:
   - Contacts with 50+ points
   - Notify sales team

3. **Monitor Forms**:
   - Submission rates
   - Error rates

### Weekly Tasks

1. **Campaign Performance**:
   - Open rates (target: >30%)
   - Click rates (target: >5%)
   - Conversion rates

2. **Segment Growth**:
   - Newsletter subscribers
   - SQLs
   - Customers

3. **A/B Testing**:
   - Email subject lines
   - CTA buttons
   - Landing pages

### Monthly Tasks

1. **Clean Database**:
   - Remove bounced emails
   - Archive inactive contacts
   - Update segments

2. **Optimize Campaigns**:
   - Review winning variations
   - Update email templates
   - Refine lead scoring

3. **Report to Stakeholders**:
   - Total contacts
   - Conversion rates
   - Revenue attribution

---

## 🔐 Security Best Practices

1. **Use Strong Passwords**: 16+ characters, mixed case, numbers, symbols
2. **Enable 2FA**: For admin accounts
3. **Regular Backups**: Daily database backups
4. **Update Regularly**: Keep Mautic updated
5. **Monitor Logs**: Check for suspicious activity
6. **Limit API Access**: Only trusted applications
7. **Use HTTPS**: Always use SSL certificate

---

## 🆘 Troubleshooting

### Emails Not Sending

**Check**:
1. SMTP credentials correct
2. Email queue not stuck (Settings → Email Settings → Queue)
3. Cron jobs running (see below)
4. SPF/DKIM records configured

### Tracking Not Working

**Check**:
1. Tracking code installed correctly
2. CORS configured properly
3. No ad blockers interfering
4. Browser console for errors

### Forms Not Submitting

**Check**:
1. Form published
2. CORS settings
3. API enabled
4. Browser console for errors

---

## ⚙️ Cron Jobs (Production)

Add to crontab (`crontab -e`):

```bash
# Mautic Cron Jobs
*/5 * * * * php /var/www/mautic/bin/console mautic:segments:update
*/10 * * * * php /var/www/mautic/bin/console mautic:campaigns:trigger
*/15 * * * * php /var/www/mautic/bin/console mautic:campaigns:rebuild
0 * * * * php /var/www/mautic/bin/console mautic:emails:send
0 2 * * * php /var/www/mautic/bin/console mautic:maintenance:cleanup --days-old=365
```

---

## ✅ Configuration Checklist

- [ ] Mautic installed and accessible
- [ ] Admin account created
- [ ] Email SMTP configured and tested
- [ ] API enabled and credentials created
- [ ] Tracking code added to website
- [ ] CORS configured for website domain
- [ ] Forms created (Newsletter, Resource, Consultation)
- [ ] Lead scoring configured
- [ ] Segments created
- [ ] Email campaigns built
- [ ] Webhooks configured (optional)
- [ ] Cron jobs set up (production)
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Team members added

---

## 📞 Support Resources

- **Official Docs**: https://docs.mautic.org
- **Community Forum**: https://forum.mautic.org
- **GitHub**: https://github.com/mautic/mautic
- **Slack**: https://mautic.org/slack

---

**Mautic Setup Status**: Ready for Production  
**Integration**: Complete with Olcan Website  
**Next Steps**: Monitor performance and optimize campaigns
