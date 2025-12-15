# Frontend

Stack:
- React 19 + TypeScript
- Vite build
- Zustand (persist) with IndexedDB
- React Flow (visualization)
- Helmet-async (SEO)
- Firebase web SDK (Google auth)
- Axios for API
- Razorpay Checkout.js

Key modules:
- `src/pages/Dashboard.tsx`, `Settings.tsx`, `FlowchartView*.tsx`
- `src/store/useWorkspaceStore.ts`, `useUserInfo.ts`
- `src/utils/razorpay.ts` (dynamic load, checkout, polling)
- `src/hooks/useRunBackgroundOps.tsx` (offline background sync)
- `src/components/SEO.tsx` (Helmet-async)
