# Stack

Node.js CommonJS application using Express 4 and body-parser. The frontend is static HTML, CSS, and JavaScript in `public/`; application data is persisted in `data/db.json`.

# Module map

- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, creation, and cancellation endpoints.
- `routes/products.js` — product and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, validation, discount calculation, and listing.
- `lib/dates.js` — dates, date-key normalization, and fiscal-year utilities.
- `lib/inventory.js` — product lookup, stock checks, stock reservation/release, and inventory summaries.
- `lib/invoice.js` — invoice figure calculation and printable HTML invoice rendering.
- `lib/ledger.js` — customer lookup, customer summaries, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — subtotals, discounts, and order tax/total calculations.
- `lib/reports.js` — dashboard summaries and GST reconciliation.
- `lib/store.js` — JSON database reads, writes, structure initialization, and audit logging.
- `lib/tax.js` — item GST rate resolution and CGST/SGST splitting.

# Commands

- Start the app: `npm start` (or `node server.js`).
- Run tests: `node --test`.

# Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; they use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

# Current ticket

Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
