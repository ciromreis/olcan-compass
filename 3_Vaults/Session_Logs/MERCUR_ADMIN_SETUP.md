# Mercur Admin Setup Guide

**Created:** April 4, 2026, 4:55 PM  
**Status:** Admin user exists, password setup required

---

## ✅ What's Already Done

- Admin user created in database
- Email: `admin@olcan.com`
- Mercur services running (API, Admin, Vendor)

---

## 🔑 Admin Login Setup

### Option 1: Use "Forgot Password" Flow (Recommended)

1. **Open Admin Panel:** http://localhost:7000
2. **Click "Forgot Password"** or similar link
3. **Enter email:** `admin@olcan.com`
4. **Check console logs** - Mercur will log the reset token
5. **Use the token** to set your password

### Option 2: Create New Admin via UI

If the admin panel allows creating the first admin:

1. **Open:** http://localhost:7000
2. **Look for "Create Account" or "Sign Up"**
3. **Use:**
   - Email: `admin@olcan.com`
   - Password: `olcan2026` (or your choice)
   - Name: Olcan Admin

### Option 3: Direct Database Password Hash

If you're comfortable with SQL:

```bash
# Generate password hash (in Node.js/Bun)
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('olcan2026', 10).then(console.log)"

# Then update database
psql -U ciromoraes -d olcan_marketplace -c "
  INSERT INTO auth_identity (id, provider_identities, app_metadata, provider_metadata, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '[{\"provider\": \"emailpass\", \"entity_id\": \"admin@olcan.com\"}]'::jsonb,
    '{\"user_id\": \"USER_ID_HERE\"}'::jsonb,
    '{\"password_hash\": \"HASH_HERE\"}'::jsonb,
    NOW(),
    NOW()
  );
"
```

---

## 🔐 Get Publishable API Key

Once you can login to the admin panel:

1. **Login to:** http://localhost:7000
2. **Navigate to:** Settings → API Keys (or Publishable Keys)
3. **Create new publishable key**
4. **Copy the key** (starts with `pk_`)
5. **Add to website:**

```bash
# File: apps/site-marketing-v2.5/.env.local
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

6. **Restart website:**
```bash
cd apps/site-marketing-v2.5
npm run dev
```

---

## 📦 Create Olcan Products

After logging in, create these products:

### 1. Curso Cidadão do Mundo
- **Title:** Curso Cidadão do Mundo
- **Price:** R$ 497,00 (BRL)
- **Type:** Digital Product
- **Description:** Mapeamento estratégico e preparatório mental para a vida transnacional sem fronteiras
- **Handle:** `curso-cidadao-mundo`

### 2. Kit Application
- **Title:** Kit Application - Documentos Internacionais
- **Price:** R$ 997,00 (BRL)
- **Type:** Digital Product
- **Description:** Templates e documentos essenciais para sua candidatura internacional
- **Handle:** `kit-application`

### 3. Rota de Internacionalização
- **Title:** Rota de Internacionalização - Mentoria Premium
- **Price:** R$ 4,500,00 (BRL)
- **Type:** Service
- **Description:** Mentoria individualizada de 12 semanas
- **Handle:** `rota-internacionalizacao`

---

## 🧪 Test Everything

### 1. Test Admin Panel
```bash
open http://localhost:7000
# Login with admin@olcan.com
```

### 2. Test Website Marketplace
```bash
open http://localhost:3001/marketplace
# Should show static + dynamic products
```

### 3. Test API
```bash
# With publishable key
curl -H "x-publishable-api-key: pk_your_key" \
  http://localhost:9000/store/products
```

---

## 🚨 Troubleshooting

### Can't login to admin panel

**Try:**
1. Check Mercur API is running: `curl http://localhost:9000/health`
2. Check admin panel is running: `curl http://localhost:7000`
3. Look for reset password link
4. Check browser console for errors

### No publishable key option

**Solution:**
- Some Medusa versions auto-create a default key
- Check Settings → Store → API Keys
- Or create via SQL (see below)

### Products not showing on website

**Check:**
1. Publishable API key is set in `.env.local`
2. Website restarted after adding key
3. Products are published (status = "published")
4. Browser console for API errors

---

## 📝 Quick Commands

```bash
# Check services running
lsof -ti:9000,7000,7001,3001

# Restart Mercur
cd olcan-marketplace && bun run dev

# Restart website
cd apps/site-marketing-v2.5 && npm run dev

# Check database
psql -U ciromoraes -d olcan_marketplace

# View admin user
psql -U ciromoraes -d olcan_marketplace -c \
  "SELECT id, email, first_name FROM public.user WHERE email = 'admin@olcan.com';"
```

---

## ✅ Success Checklist

- [ ] Can login to admin panel (http://localhost:7000)
- [ ] Publishable API key created
- [ ] API key added to website `.env.local`
- [ ] Website restarted
- [ ] Olcan products created in admin
- [ ] Products visible on website marketplace
- [ ] Product detail pages work

---

**Next Steps:**
1. Get into admin panel (try forgot password flow)
2. Create publishable API key
3. Add products
4. Test marketplace integration

**Need Help?**
- Check Mercur logs in terminal
- Check browser console
- Verify all services running
