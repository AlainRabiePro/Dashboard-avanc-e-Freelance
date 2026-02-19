# Invoice Templates

You can add your own invoice templates here!

## How to add a custom template

1. Create a new file in this folder, e.g. `my-template.tsx`.
2. Export a React component named `MyTemplate` (or any name you want).
3. The component must accept a prop: `{ invoice }` (type: `Invoice` from `/src/lib/types.ts`).
4. Style and structure it as you wish!

Example:

```tsx
import type { Invoice } from "@/lib/types";

export function MyTemplate({ invoice }: { invoice: Invoice }) {
  return (
    <div>
      <h1>My Custom Invoice</h1>
      <div>Client: {invoice.client}</div>
      {/* ...etc... */}
    </div>
  );
}
```

## How to use your template in the app

- Add an entry for your template in the template selection dropdown (in `invoice-form.tsx`).
- Import and render your component in the preview/render logic.
- Optionally, add translations for your template name in the locales files.
