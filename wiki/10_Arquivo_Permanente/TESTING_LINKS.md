# 🔗 Testing Links - Olcan Compass v2.5

**Quick Reference**: URLs for local testing

---

## 🚀 **Main Application (App Compass v2)**

### **Start the App**
```bash
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/app-compass-v2
npm run dev
```

### **Access URLs**
- **Main App**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Companion Page**: http://localhost:3000/companion
- **Companion Onboarding**: http://localhost:3000/companion/discover
- **Aura Page**: http://localhost:3000/aura
- **Achievements**: http://localhost:3000/aura/achievements
- **Quests**: http://localhost:3000/aura/quests
- **Guilds**: http://localhost:3000/guilds
- **Community**: http://localhost:3000/community
- **Marketplace**: http://localhost:3000/marketplace

---

## 🌐 **Marketing Website (Site Marketing v2.5)**

### **Start the Website**
```bash
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/site-marketing-v2.5
npm run dev
```

### **Access URLs**
- **Homepage**: http://localhost:3001 (or check terminal for actual port)
- **About**: http://localhost:3001/sobre
- **Pricing**: http://localhost:3001/precos
- **For Professionals**: http://localhost:3001/para-profissionais

---

## 🔧 **Backend API**

### **Start the Backend**
```bash
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/api-core-v2
uvicorn app.main:app --reload --port 8001
```

### **Access URLs**
- **API Base**: http://localhost:8001/api/v1
- **Swagger Docs**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **OpenAPI JSON**: http://localhost:8001/openapi.json

### **Test Endpoints**
```bash
# Health check (if implemented)
curl http://localhost:8001/api/v1/health

# Companions endpoint (requires auth)
curl http://localhost:8001/api/v1/companions/

# Registration (currently has model error)
curl -X POST "http://localhost:8001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@olcan.com","username":"testuser","password":"Test1234"}'
```

---

## 📋 **Testing Checklist**

### **Frontend App (Port 3000)**
- [ ] Navigate to http://localhost:3000
- [ ] Check dashboard loads
- [ ] Click "Companion" in navigation
- [ ] Test companion page features
- [ ] Try onboarding flow at /companion/discover
- [ ] Check all Portuguese text
- [ ] Test responsive design (resize browser)
- [ ] Check browser console for errors

### **Marketing Website (Port 3001)**
- [ ] Navigate to http://localhost:3001
- [ ] Check homepage loads
- [ ] Navigate through menu items
- [ ] Check all Portuguese text
- [ ] Test responsive design
- [ ] Check browser console for errors

### **Backend API (Port 8001)**
- [ ] Navigate to http://localhost:8001/docs
- [ ] Check Swagger UI loads
- [ ] See all endpoints listed
- [ ] Note: Registration/auth currently blocked by model error

---

## 🐛 **Known Issues**

### **Backend**
⚠️ **Database model error** - User registration and authentication currently fail
- **Fix**: See `00_Mission_Control/BACKEND_MODEL_FIX_GUIDE.md`
- **Workaround**: Frontend works with mock data

### **Frontend**
✅ All working - no known issues

---

## 💡 **Quick Start Commands**

### **Start Everything**
```bash
# Terminal 1 - Backend
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/api-core-v2
uvicorn app.main:app --reload --port 8001

# Terminal 2 - Main App
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/app-compass-v2
npm run dev

# Terminal 3 - Marketing Site
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/site-marketing-v2.5
npm run dev
```

### **Access All**
- App: http://localhost:3000
- Website: http://localhost:3001
- API Docs: http://localhost:8001/docs

---

## 🎯 **Key Pages to Test**

### **Companion System** (Main focus of recent work)
1. http://localhost:3000/companion - Main companion page
2. http://localhost:3000/companion/discover - Onboarding
3. http://localhost:3000/dashboard - Dashboard with companion card
4. http://localhost:3000/aura/achievements - Achievements
5. http://localhost:3000/aura/quests - Quests

### **Portuguese Consistency** (Recently audited)
- Check all UI text is in Portuguese
- Verify no English terms in buttons/labels
- Confirm proper branding throughout

---

## 📱 **Mobile Testing**

Open in browser and use DevTools:
1. Press F12 (or Cmd+Option+I on Mac)
2. Click device toolbar icon (or Cmd+Shift+M)
3. Select device (iPhone, iPad, etc.)
4. Test responsive behavior

---

## 🔍 **What to Look For**

### **✅ Should Work**
- All pages load without errors
- Navigation works smoothly
- Portuguese text throughout
- Animations are smooth
- Responsive design works
- Loading states appear
- Error boundaries catch errors

### **⚠️ Currently Blocked**
- User registration (backend model error)
- User login (backend model error)
- Creating real companions (backend model error)
- Care activities with real data (backend model error)

### **💡 Workaround**
Frontend uses mock data, so you can still:
- See the UI/UX
- Test navigation
- View companion pages
- See animations
- Test responsive design

---

## 📞 **Need Help?**

- **Frontend Issues**: Check browser console (F12)
- **Backend Issues**: Check terminal running uvicorn
- **Build Issues**: Run `npm run build` to see errors
- **Documentation**: See `00_Mission_Control/` folder

---

**Happy Testing! 🚀**
