# 🚀 E2E Testing Quick Start Guide

## ❌ Common Mistake

**Don't run tests from the wrong directory!**

The errors you saw were from `04_Agents_Automation/agents-ui-tars` (a different project).

✅ **Correct directory:** `01_Olcan_Active/olcan-compass/apps/app-compass-v2.5`

---

## ✅ Step-by-Step Instructions

### Step 1: Navigate to Correct Directory

```bash
cd /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass/apps/app-compass-v2.5
```

### Step 2: Verify Playwright is Installed

```bash
# Check if Playwright exists
ls node_modules/.bin/playwright

# Should output: node_modules/.bin/playwright
```

✅ **Already installed!**

### Step 3: Run Verification Test (5 seconds)

This test verifies Playwright works WITHOUT needing the app running:

```bash
npx playwright test quick-verify.spec.ts --project=chromium
```

**Expected output:**
```
✅ Playwright is working correctly!
📸 Screenshot saved to: screenshots/verify-playwright.png
```

### Step 4: Run Full E2E Tests (requires app running)

**Terminal 1 - Start the app:**
```bash
cd /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass/apps/app-compass-v2.5
npm run dev
```

**Terminal 2 - Run tests:**
```bash
cd /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass/apps/app-compass-v2.5
npx playwright test critical-user-journey.spec.ts --project=chromium --headed
```

The `--headed` flag shows the browser so you can watch the test run!

---

## 🎯 Quick Commands Reference

### Verify Playwright Works
```bash
npx playwright test quick-verify.spec.ts
```

### Run Specific Test
```bash
npx playwright test critical-user-journey.spec.ts
```

### Run with Browser Visible (recommended for first time)
```bash
npx playwright test --headed
```

### Run on Mobile
```bash
npx playwright test --project="Mobile Chrome"
```

### View Test Report
```bash
npx playwright show-report
```

### Run All Tests
```bash
npx playwright test
```

---

## 📊 What Gets Tested

| Test File | What It Tests | Time |
|-----------|---------------|------|
| `quick-verify.spec.ts` | Playwright installation | 5s |
| `critical-user-journey.spec.ts` | Full user flow | 5-10 min |

---

## 🔍 Understanding Test Results

### ✅ Success
```
✓ Registration Flow should complete registration successfully (2.3s)
✓ OIOS Quiz Flow should complete quiz and assign archetype (4.1s)

2 passed (6.4s)
```

### ❌ Failure
```
✗ Registration Flow should complete registration successfully (2.3s)

Error: expect(locator).toBeVisible() failed

Screenshot: test-results/registration-failed.png
Video: test-results/registration-failed-video.webm
```

### View Detailed Report
```bash
npx playwright show-report
```

This opens an HTML report with:
- Test results
- Screenshots of failures
- Videos of test runs
- Performance metrics

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@playwright/test'"

**Solution:**
```bash
# You're in the wrong directory!
# Check your current directory
pwd

# Should be:
# /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass/apps/app-compass-v2.5

# If not, navigate to correct directory:
cd /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass/apps/app-compass-v2.5
```

### Issue: "Browser not found"

**Solution:**
```bash
# Install browsers
npx playwright install chromium
```

### Issue: Tests fail because app is not running

**Solution:**
```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Run tests
npx playwright test
```

### Issue: Tests timeout

**Solution:**
```bash
# Increase timeout
npx playwright test --timeout=120000
```

---

## 🎓 Next Steps

1. ✅ Run verification test: `npx playwright test quick-verify.spec.ts`
2. ✅ Start app: `npm run dev`
3. ✅ Run full tests: `npx playwright test --headed`
4. ✅ Review report: `npx playwright show-report`
5. ✅ AI analysis: `python scripts/analyze_e2e_results.py test-results.json`

---

## 📁 File Locations

- **Tests:** `tests/e2e/*.spec.ts`
- **Config:** `playwright.config.ts`
- **Reports:** `playwright-report/`
- **Screenshots:** `screenshots/`
- **Results:** `test-results.json`

---

## 💡 Pro Tips

1. **Use `--headed` first** - Watch what the test does
2. **Run one test at a time** - Easier to debug
3. **Check screenshots** - Visual proof of what happened
4. **Use `--ui` mode** - Interactive test runner
5. **Run on multiple browsers** - Catch browser-specific issues

---

**Created:** April 13, 2026  
**Status:** Ready to run  
**Directory:** `01_Olcan_Active/olcan-compass/apps/app-compass-v2.5`
