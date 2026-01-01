# 🔒 سياسة إلزامية للقوائم الجانبية والتوجيه
# Mandatory Navigation & Routing Governance Policy

**Version:** 1.0  
**Status:** Mandatory - Non-Negotiable  
**Scope:** All menus, routes, permissions, and pages  
**Effective Date:** Immediate

---

## 1. Objective | الهدف

This policy aims to:
- Prevent unnecessary code loading
- Ensure platform speed regardless of page count
- Isolate menus from page logic
- Enable safe platform scalability

---

## 2. Core Principle (Non-Negotiable) | مبدأ أساسي غير قابل للنقاش

> **Displaying a page in menu ≠ Loading page code**

Any mixing of the two is a **severe architectural error**.

---

## 3. Sidebar Policy | سياسة القوائم الجانبية

### 3.1 Golden Rule
The sidebar relies on **Metadata only** and contains **no business logic or page imports**.

### Allowed in Sidebar:
- ✅ label
- ✅ icon
- ✅ route
- ✅ permissions / roles
- ✅ display order

### Prohibited in Sidebar:
- ❌ import of any page
- ❌ import of any heavy component
- ❌ API calls
- ❌ hooks
- ❌ calculations or loops
- ❌ complex state

### 3.2 Mandatory Menu Item Format
```typescript
{
  id: "users",
  label: "User Management",
  labelAr: "إدارة المستخدمين",
  icon: UserIcon,
  route: "/users",
  roles: ["owner", "admin"]
}
```

Any item not conforming to this format is **REJECTED**.

---

## 4. Routing Policy | سياسة التوجيه

### 4.1 Page Loading (Lazy Loading)
**ALL pages without exception** must be loaded using Lazy Loading.

```typescript
const UsersPage = lazy(() => import('@/pages/UsersPage'));
```

❌ Direct import = **Severe violation**

### 4.2 Central Import Prohibition

**PROHIBITED:**
```typescript
import UsersPage from './UsersPage'
import SettingsPage from './SettingsPage'
```

**ALLOWED only inside lazy import.**

---

## 5. Separation of Permissions from Loading

Permissions:
- Control visibility
- Do NOT control code loading

**Loading a page just to check user permission is PROHIBITED.**

---

## 6. Menu Calculations Policy

Any filtering or permissions:
- Must be O(1) or small O(n)
- Without nested loops

**PROHIBITED:**
- Heavy search operations
- Large data processing

---

## 7. Multi-Page Policy

- Page count is unlimited
- Performance is not affected by page count as long as:
  - They are not pre-loaded
  - They are not imported in menus
  - Lazy loading is followed

---

## 8. Mandatory Tests

Menus must achieve:
- Instant load (< 100ms)
- No API calls on load
- No unnecessary re-renders

**Any failure = Deployment blocked**

---

## 9. Common Violations (REJECTED)

- ❌ Sidebar imports pages
- ❌ Sidebar contains Hooks
- ❌ Route without lazy
- ❌ Permissions lead to code loading
- ❌ Menu built on Components instead of Metadata

---

## 10. Golden Rule (Final) | قاعدة ذهبية ختامية

> **The sidebar = Map**  
> **The page = Destination**  
> **Never load the destination to draw the map**

---

## 11. Enforcement and Accountability

This policy is **MANDATORY**. Any violation:
- Leads to merge rejection
- Or immediate restructuring

**No technical or timeline exceptions allowed.**

---

## ✅ Approval

This policy is adopted as a complementary part of the platform's performance and architectural policies.

---

## Compliance Checklist | قائمة التحقق من الامتثال

- [ ] Sidebar uses metadata only (no page imports)
- [ ] All pages use React.lazy() loading
- [ ] No direct page imports in routing files
- [ ] Sidebar loads in < 100ms
- [ ] No API calls during sidebar render
- [ ] Permissions checked via metadata, not code loading
- [ ] Menu items follow standard format (id, label, icon, route, roles)
- [ ] No hooks or complex state in sidebar components
