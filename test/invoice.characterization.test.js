var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function orderFor(items, coupon) {
  return {
    id: 9999,
    date: '01/01/2022',
    customer: 'Characterization Customer',
    paymentMode: 'cash',
    status: 'completed',
    items: items,
    coupon: coupon || ''
  };
}

test('invoice uses the HSN GST rate when an order line has no gstRate', function () {
  var items = [{
    id: 1,
    name: 'HSN five-percent item',
    hsn: '1006',
    price: 1000,
    qty: 1
  }];

  var ledger = pricing.computeTotals(items, '');
  var invoiceFigures = invoice.computeInvoiceFigures(orderFor(items));

  assert.equal(ledger.tax, 50);
  assert.equal(ledger.total, 1050);
  assert.equal(invoiceFigures.rows[0].gstPercent, 5);
  assert.equal(invoiceFigures.tax, 50);
  assert.equal(invoiceFigures.cgst, 25);
  assert.equal(invoiceFigures.sgst, 25);
  assert.equal(invoiceFigures.total, 1050);
});

test('invoice applies SAVE10 before GST and honors its coupon cap', function () {
  var items = [{
    id: 1,
    name: 'HSN five-percent bulk item',
    hsn: '1006',
    price: 2000,
    qty: 1
  }];

  var ledger = pricing.computeTotals(items, 'SAVE10');
  var invoiceFigures = invoice.computeInvoiceFigures(orderFor(items, 'SAVE10'));

  assert.deepEqual({
    discount: ledger.discount,
    tax: ledger.tax,
    total: ledger.total
  }, {
    discount: 150,
    tax: 92.5,
    total: 1942.5
  });

  assert.deepEqual({
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total
  }, {
    discount: 150,
    tax: 92.5,
    cgst: 46.25,
    sgst: 46.25,
    total: 1942.5
  });
});

test('invoice uses an explicit line gstRate when one is present', function () {
  var items = [{
    id: 1,
    name: 'Explicit GST item',
    hsn: '1006',
    gstRate: 12,
    price: 100,
    qty: 1
  }];

  var ledger = pricing.computeTotals(items, '');
  var invoiceFigures = invoice.computeInvoiceFigures(orderFor(items));

  assert.equal(ledger.tax, 12);
  assert.equal(invoiceFigures.rows[0].gstPercent, 12);
  assert.equal(invoiceFigures.tax, 12);
  assert.equal(invoiceFigures.cgst, 6);
  assert.equal(invoiceFigures.sgst, 6);
  assert.equal(invoiceFigures.total, 112);
});
