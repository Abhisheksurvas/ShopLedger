const test = require('node:test');
const assert = require('node:assert');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function item(name, sku, price, qty, hsn, gstRate) {
  return { name, sku, price, qty, hsn, gstRate };
}

test('CURRENT BEHAVIOUR: invoice and pricing totals for #1001 preserve mixed 5% and 12% GST', () => {
  const order = {
    id: 1001,
    items: [
      item('Rice', 'RICE', 100, 2, '1006', 5),
      item('Ghee', 'GHEE', 200, 1, '0405', 12)
    ]
  };

  const actual = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(order.items, '');

  assert.deepStrictEqual(actual, {
    subtotal: 400,
    discount: 0,
    tax: 34,
    cgst: 17,
    sgst: 17,
    total: 434,
    rows: [
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 2, price: 100, gstPercent: 5, line: 200, lineTax: 10 },
      { name: 'Ghee', sku: 'GHEE', hsn: '0405', qty: 1, price: 200, gstPercent: 12, line: 200, lineTax: 24 }
    ]
  });
  assert.deepStrictEqual(totals, {
    subtotal: 400, discount: 0, taxable: 400, tax: 34, cgst: 17, sgst: 17, total: 434,
    lines: [
      { id: undefined, name: 'Rice', hsn: '1006', gstPercent: 5, gross: 200, discount: 0, taxable: 200, tax: 10, net: 210 },
      { id: undefined, name: 'Ghee', hsn: '0405', gstPercent: 12, gross: 200, discount: 0, taxable: 200, tax: 24, net: 224 }
    ]
  });
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 applies the capped coupon before tax in invoice figures', () => {
  const order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      item('Tea', 'TEA', 600, 1, '0902', 18),
      item('Rice', 'RICE', 400, 1, '1006', 5)
    ]
  };

  const actual = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(order.items, order.coupon);

  assert.deepStrictEqual(actual, {
    subtotal: 1000, discount: 100, tax: 115.2, cgst: 57.6, sgst: 57.6, total: 1015.2,
    rows: [
      { name: 'Tea', sku: 'TEA', hsn: '0902', qty: 1, price: 600, gstPercent: 18, line: 600, lineTax: 97.2 },
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 1, price: 400, gstPercent: 5, line: 400, lineTax: 18 }
    ]
  });
  assert.strictEqual(totals.discount, 100);
  assert.strictEqual(totals.tax, 115.2);
  assert.strictEqual(totals.total, 1015.2);
});

test('CURRENT BEHAVIOUR: #1004 applies the SAVE10 cap before invoice GST', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      item('Rice', 'RICE', 1400, 1, '1006', 5),
      item('Ghee', 'GHEE', 840, 1, '0405', 12)
    ]
  };

  const actual = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(order.items, order.coupon);

  assert.deepStrictEqual(actual, {
    subtotal: 2240, discount: 150, tax: 159.36, cgst: 79.68, sgst: 79.68, total: 2249.36,
    rows: [
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 1, price: 1400, gstPercent: 5, line: 1400, lineTax: 65.31 },
      { name: 'Ghee', sku: 'GHEE', qty: 1, price: 840, hsn: '0405', gstPercent: 12, line: 840, lineTax: 94.05 }
    ]
  });
  assert.strictEqual(totals.discount, 150);
  assert.strictEqual(totals.tax, 159.36);
  assert.strictEqual(totals.total, 2249.36);
});

test('CURRENT BEHAVIOUR: invoice and pricing totals agree for #1008 when every item is 18% GST', () => {
  const order = {
    id: 1008,
    items: [
      item('Tea', 'TEA', 500, 1, '0902', 18),
      item('Coffee', 'COFFEE', 750, 1, '0901', 18)
    ]
  };

  const actual = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(order.items, '');

  assert.deepStrictEqual(actual, {
    subtotal: 1250, discount: 0, tax: 225, cgst: 112.5, sgst: 112.5, total: 1475,
    rows: [
      { name: 'Tea', sku: 'TEA', hsn: '0902', qty: 1, price: 500, gstPercent: 18, line: 500, lineTax: 90 },
      { name: 'Coffee', sku: 'COFFEE', hsn: '0901', qty: 1, price: 750, gstPercent: 18, line: 750, lineTax: 135 }
    ]
  });
  assert.deepStrictEqual(totals, {
    subtotal: 1250, discount: 0, taxable: 1250, tax: 225, cgst: 112.5, sgst: 112.5, total: 1475,
    lines: [
      { id: undefined, name: 'Tea', hsn: '0902', gstPercent: 18, gross: 500, discount: 0, taxable: 500, tax: 90, net: 590 },
      { id: undefined, name: 'Coffee', hsn: '0901', gstPercent: 18, gross: 750, discount: 0, taxable: 750, tax: 135, net: 885 }
    ]
  });
});

test('invoice matches checkout for #1004 using the HSN slab and capped coupon before tax', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      item('Cold-Pressed Groundnut Oil 5L', 'OIL-002', 1120, 2, '1508')
    ]
  };

  const actual = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(order.items, order.coupon);

  assert.deepStrictEqual(actual, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      {
        name: 'Cold-Pressed Groundnut Oil 5L',
        sku: 'OIL-002',
        hsn: '1508',
        qty: 2,
        price: 1120,
        gstPercent: 5,
        line: 2240,
        lineTax: 104.5
      }
    ]
  });
  assert.deepStrictEqual(actual.total, totals.total);
  assert.deepStrictEqual(actual.tax, totals.tax);
});
