var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function orderFor(items, coupon) {
  return {
    id: 9998,
    items: items,
    coupon: coupon || ''
  };
}

test('invoice figures match the total and GST breakdown billed by order pricing', function () {
  var items = [{
    id: 1,
    name: 'HSN five-percent bulk item',
    hsn: '1006',
    price: 2000,
    qty: 1
  }];
  var billed = pricing.computeTotals(items, 'SAVE10');
  var figures = invoice.computeInvoiceFigures(orderFor(items, 'SAVE10'));

  assert.deepEqual({
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total,
    gstPercent: figures.rows[0].gstPercent,
    lineTax: figures.rows[0].lineTax
  }, {
    subtotal: billed.subtotal,
    discount: billed.discount,
    tax: billed.tax,
    cgst: billed.cgst,
    sgst: billed.sgst,
    total: billed.total,
    gstPercent: billed.lines[0].gstPercent,
    lineTax: billed.lines[0].tax
  });
});
