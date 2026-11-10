/**
 * Grinet_BillingAddressAtShipping
 * Author : Hidayet OK @ grinet
 * Forked From : https://github.com/collabpl/magento2-module-checkout-billing-at-shipping
 * Old Author : Marcin Jędrzejewski <m.jedrzejewski@collab.pl>
 * Copyright (c) 2024 Collab; Copyright (c) 2026 Grinet
 * License : MIT (see LICENSE.md)
 */

/* Run with node Test/JavaScript/shipping-information.test.js from the module directory. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let method = null, mixin;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,
    '../../view/frontend/web/js/view/shipping-information-mixin.js'), 'utf8'), {
    define: (names, factory) => {mixin = factory({shippingMethod: () => method});}
});
const target = {prototype: {}, extend: value => value};
const summary = mixin(target);
assert.equal(summary.isStorePickup(), false);
method = {carrier_code: 'flatrate', method_code: 'flatrate'};
assert.equal(summary.isStorePickup(), false);
method = {carrier_code: 'instore', method_code: 'pickup'};
assert.equal(summary.isStorePickup(), true);
method = {carrier_code: 'instore', method_code: 'other'};
assert.equal(summary.isStorePickup(), false);
const nativeTarget = {prototype: {isStorePickup: () => 'native'}};
assert.equal(mixin(nativeTarget), nativeTarget);
assert.equal(nativeTarget.prototype.isStorePickup(), 'native');
console.log('Shipping summary: 6 compatibility assertions passed.');
