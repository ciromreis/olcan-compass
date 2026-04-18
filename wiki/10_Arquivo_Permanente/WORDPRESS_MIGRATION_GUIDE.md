# 🔄 WordPress Migration Guide - Olcan Website
## Complete Migration from Next.js to WordPress on Hostinger

**Date**: March 27, 2026  
**Target Platform**: WordPress 6.4+  
**Hosting**: Hostinger Business Plan

---

## 📋 Overview

This guide provides complete instructions for migrating the Olcan marketing website from Next.js to WordPress, optimized for Hostinger hosting.

---

## 🗄️ Database Schema

### Custom Tables

```sql
-- Products Table
CREATE TABLE wp_olcan_products (
    id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline TEXT,
    description LONGTEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BRL',
    category VARCHAR(100),
    duration VARCHAR(100),
    format VARCHAR(100),
    level VARCHAR(100),
    enrollment_link VARCHAR(255),
    features LONGTEXT, -- JSON
    benefits LONGTEXT, -- JSON
    testimonials LONGTEXT, -- JSON
    faqs LONGTEXT, -- JSON
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leads/Contacts Table
CREATE TABLE wp_olcan_leads (
    id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    product_interest VARCHAR(255),
    message LONGTEXT,
    source VARCHAR(100), -- contact_form, newsletter, download, etc.
    lead_score INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted
    mautic_contact_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_lead_score (lead_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments Table
CREATE TABLE wp_olcan_enrollments (
    id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT(20) UNSIGNED,
    product_id BIGINT(20) UNSIGNED,
    order_id VARCHAR(100),
    amount DECIMAL(10,2),
    payment_status VARCHAR(50), -- pending, paid, failed, refunded
    payment_method VARCHAR(50),
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES wp_olcan_leads(id),
    FOREIGN KEY (product_id) REFERENCES wp_olcan_products(id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials Table
CREATE TABLE wp_olcan_testimonials (
    id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    content LONGTEXT NOT NULL,
    rating TINYINT(1) DEFAULT 5,
    photo_url VARCHAR(255),
    product_id BIGINT(20) UNSIGNED,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES wp_olcan_products(id),
    INDEX idx_featured (is_featured),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics Events Table
CREATE TABLE wp_olcan_analytics (
    id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_data LONGTEXT, -- JSON
    user_id BIGINT(20) UNSIGNED,
    session_id VARCHAR(100),
    page_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_name (event_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📁 WordPress Theme Structure

```
/wp-content/themes/olcan/
├── style.css                    # Theme header
├── functions.php                # Theme setup
├── index.php                    # Blog archive
├── single.php                   # Single blog post
├── page.php                     # Default page template
├── header.php                   # Site header
├── footer.php                   # Site footer
├── sidebar.php                  # Sidebar (if needed)
│
├── page-templates/
│   ├── homepage.php             # Custom homepage
│   ├── product.php              # Product landing page
│   ├── contact.php              # Contact page
│   ├── blog.php                 # Blog listing
│   └── about.php                # About page
│
├── template-parts/
│   ├── hero-section.php         # Reusable hero
│   ├── product-card.php         # Product card
│   ├── testimonial.php          # Testimonial component
│   ├── cta-section.php          # CTA sections
│   └── newsletter-form.php      # Newsletter signup
│
├── inc/
│   ├── custom-post-types.php   # CPTs (Products, Testimonials)
│   ├── custom-fields.php        # ACF field groups
│   ├── api-endpoints.php        # REST API
│   ├── mautic-integration.php   # Mautic functions
│   ├── analytics.php            # GA4 integration
│   └── enqueue-scripts.php      # CSS/JS loading
│
├── assets/
│   ├── css/
│   │   ├── tailwind.css         # Compiled Tailwind
│   │   └── custom.css           # Additional styles
│   ├── js/
│   │   ├── main.js              # Main JavaScript
│   │   ├── analytics.js         # Analytics tracking
│   │   └── forms.js             # Form handling
│   └── images/
│       ├── logo.svg
│       └── placeholders/
│
└── languages/                   # Translation files
```

---

## 🔌 Required Plugins

### Essential Plugins

1. **Advanced Custom Fields (ACF) Pro** - Custom fields for products
2. **Contact Form 7** or **WPForms** - Contact forms
3. **Yoast SEO** - SEO optimization
4. **WP Rocket** - Caching and performance
5. **Smush** - Image optimization
6. **Wordfence** - Security
7. **UpdraftPlus** - Backups

### Marketing Plugins

8. **MonsterInsights** - Google Analytics integration
9. **Mautic Integration** - Marketing automation
10. **WooCommerce** - Payment processing
11. **WooCommerce Subscriptions** - Recurring payments

### Optional Plugins

12. **Elementor** or **Oxygen** - Page builder (if needed)
13. **WP Mail SMTP** - Email delivery
14. **Really Simple SSL** - SSL management
15. **WP Super Cache** - Additional caching

---

## 🎨 Custom Post Types

### Products CPT

```php
// inc/custom-post-types.php

function olcan_register_products_cpt() {
    $labels = array(
        'name' => 'Produtos',
        'singular_name' => 'Produto',
        'add_new' => 'Adicionar Novo',
        'add_new_item' => 'Adicionar Novo Produto',
        'edit_item' => 'Editar Produto',
        'new_item' => 'Novo Produto',
        'view_item' => 'Ver Produto',
        'search_items' => 'Buscar Produtos',
        'not_found' => 'Nenhum produto encontrado',
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'produtos'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-cart',
        'show_in_rest' => true,
    );

    register_post_type('product', $args);
}
add_action('init', 'olcan_register_products_cpt');
```

### Testimonials CPT

```php
function olcan_register_testimonials_cpt() {
    $labels = array(
        'name' => 'Depoimentos',
        'singular_name' => 'Depoimento',
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-star-filled',
        'show_in_rest' => true,
    );

    register_post_type('testimonial', $args);
}
add_action('init', 'olcan_register_testimonials_cpt');
```

---

## 🎯 ACF Field Groups

### Product Fields

```php
// Product Details
- product_tagline (Text)
- product_price (Number)
- product_currency (Select: BRL, USD, EUR)
- product_category (Text)
- product_duration (Text)
- product_format (Text)
- product_level (Text)
- enrollment_link (URL)

// Product Features (Repeater)
- feature_title (Text)
- feature_description (Textarea)

// Product Benefits (Repeater)
- benefit_icon (Select: lucide icon name)
- benefit_title (Text)
- benefit_description (Textarea)

// Product FAQs (Repeater)
- faq_question (Text)
- faq_answer (Textarea)

// Product Testimonials (Relationship to Testimonial CPT)
```

### Testimonial Fields

```php
- testimonial_role (Text)
- testimonial_company (Text)
- testimonial_location (Text)
- testimonial_rating (Number: 1-5)
- testimonial_photo (Image)
- related_product (Relationship to Product CPT)
- is_featured (True/False)
```

---

## 🚀 Hostinger Deployment

### Step 1: Prepare Hostinger

1. **Purchase Hostinger Business Plan**
   - Recommended: Business WordPress Hosting
   - Includes: Free SSL, Daily backups, 200GB storage

2. **Access hPanel**
   - Login to Hostinger
   - Go to hPanel dashboard

3. **Install WordPress**
   - Click "Auto Installer"
   - Select WordPress
   - Choose domain: olcan.com.br
   - Set admin credentials
   - Install

### Step 2: Configure WordPress

1. **Basic Settings**
   ```
   Settings → General:
   - Site Title: Olcan
   - Tagline: Sua Jornada Internacional Começa Aqui
   - WordPress Address: https://www.olcan.com.br
   - Site Address: https://www.olcan.com.br
   - Timezone: São Paulo
   - Language: Português do Brasil
   ```

2. **Permalink Structure**
   ```
   Settings → Permalinks:
   - Select: Post name
   - Custom structure: /%postname%/
   ```

3. **Install SSL Certificate**
   - hPanel → SSL → Install Free SSL
   - Force HTTPS redirect

### Step 3: Install Theme & Plugins

1. **Upload Theme**
   ```bash
   # Via FTP or File Manager
   Upload to: /public_html/wp-content/themes/olcan/
   
   # Or via WordPress
   Appearance → Themes → Add New → Upload Theme
   ```

2. **Install Plugins**
   - Go to Plugins → Add New
   - Install all required plugins
   - Activate plugins

3. **Configure ACF**
   - Import field groups from JSON
   - Or manually create field groups

### Step 4: Import Content

1. **Create Products**
   ```
   Products → Add New
   - Curso Cidadão do Mundo
   - Rota da Internacionalização
   - Kit Application
   - Mentoria Individual
   - Sem Fronteiras
   - MedMind Pro
   ```

2. **Add Testimonials**
   - Import testimonial data
   - Upload photos
   - Link to products

3. **Create Pages**
   ```
   Pages → Add New:
   - Homepage (Template: homepage.php)
   - Contato (Template: contact.php)
   - Quem Somos (Template: about.php)
   - Blog (Template: blog.php)
   - Política de Privacidade
   - Termos de Uso
   ```

### Step 5: Configure Integrations

1. **Google Analytics**
   ```php
   // In header.php or via MonsterInsights
   <?php if (function_exists('the_field')): ?>
       <script async src="https://www.googletagmanager.com/gtag/js?id=<?php the_field('ga_id', 'option'); ?>"></script>
   <?php endif; ?>
   ```

2. **Mautic Integration**
   ```php
   // inc/mautic-integration.php
   function olcan_mautic_tracking() {
       $mautic_url = get_field('mautic_url', 'option');
       if ($mautic_url) {
           echo "<script>/* Mautic tracking code */</script>";
       }
   }
   add_action('wp_footer', 'olcan_mautic_tracking');
   ```

3. **WooCommerce Setup**
   - Configure payment gateways (Stripe, PayPal, PagSeguro)
   - Set up products linked to CPT
   - Configure email notifications

---

## 📊 Performance Optimization

### Hostinger Optimizations

1. **Enable LiteSpeed Cache**
   - hPanel → Advanced → LiteSpeed Cache
   - Enable all optimization features

2. **Configure WP Rocket**
   ```
   Settings:
   - Enable file optimization (CSS, JS)
   - Enable lazy loading
   - Enable database optimization
   - Configure CDN (Cloudflare)
   ```

3. **Image Optimization**
   - Install Smush
   - Compress all images
   - Convert to WebP
   - Enable lazy loading

4. **Database Optimization**
   - Install WP-Optimize
   - Clean post revisions
   - Remove spam comments
   - Optimize tables

---

## 🔐 Security Configuration

1. **Wordfence Setup**
   - Enable firewall
   - Enable malware scanner
   - Configure 2FA for admin
   - Set up email alerts

2. **Security Headers**
   ```apache
   # .htaccess
   <IfModule mod_headers.c>
       Header set X-Content-Type-Options "nosniff"
       Header set X-Frame-Options "SAMEORIGIN"
       Header set X-XSS-Protection "1; mode=block"
   </IfModule>
   ```

3. **Hide WordPress Version**
   ```php
   // functions.php
   remove_action('wp_head', 'wp_generator');
   ```

---

## 📧 Email Configuration

### WP Mail SMTP Setup

1. **Install WP Mail SMTP**
2. **Configure SMTP**
   ```
   From Email: contato@olcan.com.br
   From Name: Olcan
   
   SMTP Host: smtp.hostinger.com
   SMTP Port: 587
   Encryption: TLS
   Authentication: Yes
   Username: contato@olcan.com.br
   Password: [your-password]
   ```

3. **Test Email**
   - Send test email
   - Verify delivery

---

## 🔄 Migration Checklist

### Pre-Migration
- [ ] Backup current Next.js site
- [ ] Export all content to JSON
- [ ] Download all images
- [ ] Document all integrations
- [ ] Test locally first

### Migration
- [ ] Install WordPress on Hostinger
- [ ] Upload theme
- [ ] Install plugins
- [ ] Configure ACF fields
- [ ] Import products
- [ ] Import testimonials
- [ ] Create pages
- [ ] Configure integrations
- [ ] Set up payments

### Post-Migration
- [ ] Test all pages
- [ ] Test all forms
- [ ] Verify analytics tracking
- [ ] Test payment flow
- [ ] Check mobile responsiveness
- [ ] Run performance tests
- [ ] Configure backups
- [ ] Set up monitoring

---

## 🎯 Maintenance Plan

### Daily
- Monitor uptime
- Check error logs
- Review form submissions

### Weekly
- Backup database
- Update plugins
- Review analytics
- Check security scans

### Monthly
- Update WordPress core
- Optimize database
- Review performance
- Update content

---

## 📞 Support Resources

- **Hostinger Support**: 24/7 live chat
- **WordPress Codex**: https://codex.wordpress.org
- **ACF Documentation**: https://www.advancedcustomfields.com/resources
- **WooCommerce Docs**: https://woocommerce.com/documentation

---

**Migration Status**: Ready to Execute  
**Estimated Time**: 2-3 days  
**Difficulty**: Intermediate  
**Recommended**: Hire WordPress developer if unfamiliar
