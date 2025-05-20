# 🧾 COMMENTING GUIDELINES

## 🎯 Purpose

Establish a clear and consistent standard for writing code comments across the Advo codebase to improve:

- Code readability
- Team collaboration
- Onboarding new developers
- Long-term maintainability

## 📚 Comment Types and Standards

### 1. 📄 File Header Comments

Add a short summary at the top of every significant file.

```ts
// File: ResourceForm.tsx
// Purpose: Form for creating and editing resource entries, including validation and category management.
// Owner: Roo
```

---

### 2. 🔧 Function and Method Comments

Use JSDoc-style comments for any function that's:

- Publicly exported
- More than 5 lines long
- Performs side effects or has complex logic

```ts
/**
 * Filters resources based on category and location.
 * @param resources - Full list of resources from the backend
 * @param filters - Object containing selected filters
 * @returns Filtered list of resources
 */
function filterResources(resources: Resource[], filters: FilterOptions): Resource[] {
```

---

### 3. 🤔 Complex Logic Comments

Use inline comments to explain:

- Non-obvious decisions
- Workarounds
- Async/promise chaining logic

```ts
// Skip this resource if it's already in the cache
if (cache.has(resource.id)) continue;

// This flattening step is required for nested category arrays returned by legacy API
const flatCategories = categories.flatMap((c) => c.subcategories ?? []);
```

---

### 4. 🛠️ TODO / FIXME Comments

Mark code that needs future attention using standardized labels:

- `TODO`: Feature not implemented yet
- `FIXME`: Known bug or fragile code
- Include your initials

```ts
// TODO (ROO): Add loading spinner while submitting form
// FIXME (KME): This crashes when `user.location` is null
```

---

### 5. 🧪 Test Comments

In test files, use comments to describe **test intention**, not just **what it does**.

```ts
// Should return 0 results when no matching category is found
expect(results).toHaveLength(0);
```

---

### 6. ⚠️ Don'ts

- ❌ Don’t describe what the code does (the code should do that).
- ❌ Don’t leave commented-out blocks of old code without an explanation.
- ❌ Don’t over-comment trivial logic like `const x = 5; // set x to 5`.

---

## 🧼 Style & Formatting

- Write in **plain English** using full sentences for file and function descriptions.
- Use **//** for inline comments and **/** ... **/** for block/function-level comments.
- Keep comments up-to-date with code changes. Outdated comments are worse than no comments.

---

## ✅ Commenting Checklist

Before you commit:

- [ ] File has a header comment (if appropriate)
- [ ] All exported functions are documented
- [ ] Complex logic is explained inline
- [ ] TODO/FIXME comments follow the format
- [ ] No commented-out code remains without context
- [ ] Comments match current behavior of the code

---

## 📍Where This Applies

Apply this standard to:

- All `.ts`, `.tsx`, `.js`, `.mjs` files in `/src`, `/prisma`, `/cypress`, `middleware.ts`, `image-utils.ts`, etc.
- Any newly added files going forward

---

## 🧠 Final Thought

> "Good code is like a good joke — it needs no explanation. But complex systems sometimes do. That’s what comments are for."

Keep comments **clear**, **useful**, and **brief**. Write them for your future self or the next developer stepping into your code.
