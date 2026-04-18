# Quick Start Guide for Next Agent

**Target:** Mid-level agentic AI  
**Goal:** Complete v2.5 consolidation following the detailed plan  
**Estimated Time:** 2-3 weeks  
**Complexity:** Medium

---

## What Was Done (By Cascade)

### ✅ Completed

1. **Comprehensive Analysis**
   - Analyzed Codex's v2.5 implementation
   - Identified all commerce/CMS integration gaps
   - Mapped legacy code and redundancies
   - Documented backend-frontend mismatches

2. **Architecture Design**
   - Designed unified commerce service architecture
   - Created Aura floating chat UX spec
   - Planned task management consolidation
   - Defined cleanup targets

3. **Initial Implementation**
   - Created `src/services/commerce.ts` (unified commerce service)
   - Created `src/components/aura/AuraFloatingChat.tsx` (AI chat interface)
   - Added floating chat to app layout
   - Created detailed consolidation plan document

4. **Documentation**
   - `/docs/planning/V2.5_CONSOLIDATION_PLAN.md` (comprehensive 500+ line plan)
   - This quick start guide

---

## Your Mission

Complete the v2.5 consolidation by following the plan in **sequential order**. Do NOT skip steps or work out of order.

---

## Phase 1: Commerce & CMS Consolidation (Week 1)

### Step 1.1: Backend Commerce Proxy (Days 1-2)

**Objective:** Create unified backend endpoint that proxies MedusaJS and enriches with PayloadCMS metadata.

**Files to Create:**

1. `apps/api-core-v2.5/app/core/medusa_client.py`
   ```python
   import httpx
   from typing import Optional, Dict, List, Any

   class MedusaClient:
       def __init__(self, base_url: str):
           self.base_url = base_url
           self.client = httpx.AsyncClient(timeout=30.0)

       async def list_products(
           self,
           category_id: Optional[str] = None,
           q: Optional[str] = None,
           limit: int = 50,
           offset: int = 0,
       ) -> Dict[str, Any]:
           params = {"limit": limit, "offset": offset}
           if category_id:
               params["category_id[]"] = category_id
           if q:
               params["q"] = q

           response = await self.client.get(
               f"{self.base_url}/store/products",
               params=params,
           )
           response.raise_for_status()
           return response.json()

       async def get_product(self, id_or_handle: str) -> Dict[str, Any]:
           response = await self.client.get(
               f"{self.base_url}/store/products/{id_or_handle}"
           )
           response.raise_for_status()
           data = response.json()
           return data.get("product", {})

   medusa_client = MedusaClient(
       base_url=os.getenv("MEDUSA_URL", "http://localhost:9000")
   )
   ```

2. `apps/api-core-v2.5/app/core/cms_client.py`
   ```python
   import httpx
   from typing import List, Dict, Any

   class CMSClient:
       def __init__(self, base_url: str):
           self.base_url = base_url
           self.client = httpx.AsyncClient(timeout=30.0)

       async def get_product_metadata(
           self, product_ids: List[str]
       ) -> Dict[str, Any]:
           # Fetch product metadata from PayloadCMS
           response = await self.client.get(
               f"{self.base_url}/api/product-metadata",
               params={"ids": ",".join(product_ids)},
           )
           if not response.is_success:
               return {}
           
           data = response.json()
           # Convert list to dict keyed by product_id
           return {item["product_id"]: item for item in data.get("docs", [])}

   cms_client = CMSClient(
       base_url=os.getenv("CMS_URL", "http://localhost:3001")
   )
   ```

3. `apps/api-core-v2.5/app/routers/commerce_proxy.py`
   - See full implementation in V2.5_CONSOLIDATION_PLAN.md, Phase 1.1

**Testing:**
```bash
# Start backend
cd apps/api-core-v2.5
uvicorn app.main:app --reload

# Test endpoint
curl http://localhost:8000/api/commerce/public/products?limit=5
```

### Step 1.2: Frontend Commerce Store (Days 3-4)

**Objective:** Replace `ecommerceStore.ts` with new unified `commerce.ts` store.

**Files to Create:**

1. `apps/app-compass-v2.5/src/stores/commerce.ts`
   ```typescript
   import { create } from "zustand";
   import { devtools, persist } from "zustand/middleware";
   import { commerceService, type Product } from "@/services/commerce";

   interface CommerceState {
     products: Product[];
     featuredProducts: Product[];
     currentProduct: Product | null;
     isLoading: boolean;
     error: string | null;

     fetchProducts: (params?: any) => Promise<void>;
     fetchFeaturedProducts: () => Promise<void>;
     fetchProduct: (handle: string) => Promise<void>;
     clearError: () => void;
   }

   export const useCommerceStore = create<CommerceState>()(
     devtools(
       persist(
         (set) => ({
           products: [],
           featuredProducts: [],
           currentProduct: null,
           isLoading: false,
           error: null,

           fetchProducts: async (params) => {
             set({ isLoading: true, error: null });
             try {
               const { items } = await commerceService.listProducts(params);
               set({ products: items, isLoading: false });
             } catch (error) {
               set({
                 isLoading: false,
                 error: error instanceof Error ? error.message : "Failed to fetch products",
               });
             }
           },

           fetchFeaturedProducts: async () => {
             set({ isLoading: true, error: null });
             try {
               const products = await commerceService.getFeaturedProducts(10);
               set({ featuredProducts: products, isLoading: false });
             } catch (error) {
               set({
                 isLoading: false,
                 error: error instanceof Error ? error.message : "Failed to fetch featured products",
               });
             }
           },

           fetchProduct: async (handle) => {
             set({ isLoading: true, error: null });
             try {
               const product = await commerceService.getProduct(handle);
               set({ currentProduct: product, isLoading: false });
             } catch (error) {
               set({
                 isLoading: false,
                 error: error instanceof Error ? error.message : "Failed to fetch product",
               });
             }
           },

           clearError: () => set({ error: null }),
         }),
         { name: "commerce-store" }
       ),
       { name: "commerce-store" }
     )
   );
   ```

**Files to Update:**

1. `apps/app-compass-v2.5/src/hooks/useJourneySnapshot.ts`
   - Replace `useEcommerceStore` with `useCommerceStore`
   - Update import: `import { useCommerceStore } from "@/stores/commerce";`

2. `apps/app-compass-v2.5/src/app/(app)/marketplace/page.tsx`
   - Replace `useEcommerceStore` with `useCommerceStore`

3. `apps/app-compass-v2.5/src/app/(app)/marketplace/products/[slug]/page.tsx`
   - Replace `useEcommerceStore` with `useCommerceStore`

**Testing:**
```bash
cd apps/app-compass-v2.5
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

### Step 1.3: Cleanup (Day 5)

**Files to DELETE:**
- `src/lib/medusa-client.ts`
- `src/stores/ecommerceStore.ts`
- `src/stores/marketplace.ts`
- `src/stores/marketplaceStore.ts`

**Before deleting, run:**
```bash
# Check for imports
grep -r "medusa-client" src/
grep -r "ecommerceStore" src/
grep -r "from.*marketplace.*Store" src/
```

**After deleting, verify:**
```bash
pnpm exec tsc --noEmit  # Should have zero errors
pnpm build              # Should succeed
```

---

## Phase 2: Aura/Companion UX (Week 2)

### Step 2.1: Backend Aura AI Endpoint (Days 1-2)

**File to Create:**

`apps/api-core-v2.5/app/routers/aura_ai.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.models.user import User
from app.core.auth import get_current_user
from app.services.journey import journey_service
import os

router = APIRouter(prefix="/api/aura", tags=["aura-ai"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str
    context: dict

@router.post("/chat", response_model=ChatResponse)
async def aura_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Send a message to Aura AI companion.
    Returns AI-generated response with contextual recommendations.
    """
    # Get user's journey context
    journey_context = await journey_service.get_snapshot(current_user.id)

    # TODO: Integrate with Vertex AI Gemini
    # For now, return contextual response based on keywords
    response_text = generate_contextual_response(
        request.message,
        journey_context,
    )

    return ChatResponse(
        message=response_text,
        context=journey_context,
    )

def generate_contextual_response(message: str, context: dict) -> str:
    lower = message.lower()
    
    if "rota" in lower or "route" in lower:
        return "Vejo que você está interessado em sua rota. Recomendo revisar seus marcos bloqueados na seção 'My Route'. Posso ajudar com algum marco específico?"
    
    if "documento" in lower or "cv" in lower or "carta" in lower:
        return "Para trabalhar em seus documentos, acesse o Forge. Lá você pode criar CVs, cartas de motivação e outros artefatos com suporte de IA para polimento."
    
    # Add more contextual responses...
    
    return "Entendo. Estou aqui para ajudar com sua jornada de internacionalização. Posso orientar sobre rotas, documentos, entrevistas, produtos e muito mais. O que você gostaria de explorar?"
```

**Update main router:**

`apps/api-core-v2.5/app/main.py`

```python
from app.routers import aura_ai

app.include_router(aura_ai.router)
```

### Step 2.2: Connect Frontend to Backend (Day 3)

**Update:** `src/components/aura/AuraFloatingChat.tsx`

Replace the `handleSend` function:

```typescript
const handleSend = async () => {
  if (!message.trim() || isLoading) return;

  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: "user",
    content: message.trim(),
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setMessage("");
  setIsLoading(true);

  try {
    const response = await fetch(`${resolveApiBaseUrl()}/aura/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("olcan_access_token")}`,
      },
      body: JSON.stringify({ message: userMessage.content }),
    });

    if (!response.ok) {
      throw new Error("Failed to get Aura response");
    }

    const data = await response.json();

    const auraResponse: Message = {
      id: `aura-${Date.now()}`,
      role: "aura",
      content: data.message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, auraResponse]);
  } catch (error) {
    console.error("Failed to get Aura response:", error);
    const errorMessage: Message = {
      id: `error-${Date.now()}`,
      role: "aura",
      content: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
```

### Step 2.3: Enhanced AuraRail (Day 4)

**Update:** `src/components/aura/AuraRail.tsx`

Add contextual product recommendations section:

```typescript
{snapshot.commerceRecommendation && (
  <section className="rounded-[1.8rem] border border-brand-200 bg-brand-50 p-4">
    <div className="flex items-center gap-2 text-brand-700">
      <ShoppingBag className="h-4 w-4" />
      <p className="text-xs font-semibold uppercase tracking-[0.22em]">
        Recomendação
      </p>
    </div>
    <Link
      href={snapshot.commerceRecommendation.href}
      className="mt-3 block"
    >
      <p className="font-semibold text-brand-900">
        {snapshot.commerceRecommendation.title}
      </p>
      <p className="mt-1 text-sm text-brand-700">
        {snapshot.commerceRecommendation.description}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-600">
          {snapshot.commerceRecommendation.price_display}
        </span>
        <ArrowRight className="h-4 w-4 text-brand-600" />
      </div>
    </Link>
  </section>
)}
```

---

## Phase 3: Task Management & Cleanup (Week 3)

### Step 3.1: TaskCenter Component (Days 1-2)

**File Already Created:** `src/components/journey/TaskCenter.tsx` (see consolidation plan)

**Add to Dashboard:**

`src/app/(app)/dashboard/page.tsx`

After the hero section, add:

```typescript
<section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-sm backdrop-blur-2xl lg:p-8">
  <TaskCenter />
</section>
```

**Create Full-Page Route:**

`src/app/(app)/tasks/page.tsx`

```typescript
"use client";

import { TaskCenter } from "@/components/journey/TaskCenter";
import { PageHeader } from "@/components/ui";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Tarefas"
        subtitle="Todas as suas ações prioritárias em um só lugar"
      />
      <TaskCenter />
    </div>
  );
}
```

### Step 3.2: Backend-Frontend Alignment (Days 3-4)

**Fix API Endpoints:**

1. Update `src/lib/cms.ts`:
   ```typescript
   const CMS_BASE_URL =
     process.env.NEXT_PUBLIC_CMS_URL ||
     process.env.NEXT_PUBLIC_VERCEL_URL
       ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/cms`
       : "http://localhost:3001";
   ```

2. Add error boundary to API calls in `src/lib/api.ts`:
   ```typescript
   api.interceptors.response.use(
     (response) => response,
     async (error: AxiosError) => {
       if (error.code === "ERR_NETWORK") {
         // Network error - show user-friendly message
         console.error("Network error:", error);
       }
       // ... rest of interceptor
     }
   );
   ```

### Step 3.3: Legacy Cleanup (Day 5)

**Routes to DELETE:**

Run this command to safely delete:

```bash
cd apps/app-compass-v2.5/src/app/(app)

# Check for imports first
for dir in documents companion forge-lab nudge-engine tools; do
  echo "Checking $dir..."
  grep -r "from.*$dir" ../.. || echo "  No imports found"
done

# If no imports, delete
rm -rf documents companion forge-lab nudge-engine tools
```

**Stores to DELETE:**

```bash
cd apps/app-compass-v2.5/src/stores

# Check imports
for file in companionStore.ts canonicalCompanionStore.ts realCompanionStore.ts; do
  echo "Checking $file..."
  grep -r "from.*$file" .. || echo "  No imports found"
done

# If no imports, delete
rm companionStore.ts canonicalCompanionStore.ts realCompanionStore.ts
```

**Rename:**

```bash
mv canonicalMarketplaceProviderStore.ts marketplace-providers.ts

# Update imports
find .. -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/canonicalMarketplaceProviderStore/marketplace-providers/g'
```

---

## Testing Checklist

After each phase, run:

```bash
# TypeScript
pnpm exec tsc --noEmit

# Tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint
```

**Expected Results:**
- ✅ Zero TypeScript errors
- ✅ All tests passing
- ✅ Build succeeds
- ✅ No ESLint errors (warnings OK)

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Products load from `/api/commerce/public/products`
- [ ] Featured products appear on dashboard
- [ ] Product detail pages work
- [ ] No references to `ecommerceStore` or `medusa-client`

### Phase 2 Complete When:
- [ ] Floating chat button appears on all pages
- [ ] Chat sends messages to backend
- [ ] Aura responds with contextual messages
- [ ] AuraRail shows product recommendations

### Phase 3 Complete When:
- [ ] TaskCenter shows all deadlines
- [ ] Tasks are grouped by priority
- [ ] `/tasks` route works
- [ ] All legacy routes deleted
- [ ] All duplicate stores deleted

---

## Common Issues & Solutions

### Issue: "Module not found: Can't resolve '@/services/commerce'"

**Solution:** Make sure you created the file:
```bash
ls -la apps/app-compass-v2.5/src/services/commerce.ts
```

### Issue: "Type error: Property 'items' does not exist on type 'Product[]'"

**Solution:** Update the API response type:
```typescript
const { items } = await commerceService.listProducts(params);
// Not: const items = await commerceService.listProducts(params);
```

### Issue: "Network error when calling /api/commerce/public/products"

**Solution:** Check backend is running:
```bash
cd apps/api-core-v2.5
uvicorn app.main:app --reload
```

### Issue: "Aura chat not responding"

**Solution:** Check backend endpoint exists:
```bash
curl -X POST http://localhost:8000/api/aura/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## Final Validation

Before marking complete, run:

```bash
# Full test suite
pnpm --filter @olcan/web-v2.5 test

# TypeScript
pnpm --filter @olcan/web-v2.5 exec tsc --noEmit

# Build
pnpm --filter @olcan/web-v2.5 build

# Backend tests
cd apps/api-core-v2.5
pytest -q
```

**All should pass with zero errors.**

---

## Next Steps After Completion

1. Deploy to staging
2. Test commerce flow end-to-end
3. Test Aura chat with real users
4. Monitor error rates
5. Collect user feedback
6. Plan v2.6 features

---

## Questions?

Refer to:
- `/docs/planning/V2.5_CONSOLIDATION_PLAN.md` for detailed specs
- Codex's implementation notes in the consolidation plan
- Existing code patterns in `src/stores/auth.ts` and `src/stores/forge.ts`

**Remember:** Follow the plan sequentially. Do not skip steps. Test after each change.

Good luck! 🚀
