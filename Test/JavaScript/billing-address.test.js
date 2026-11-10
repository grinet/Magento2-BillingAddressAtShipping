/**
 * Grinet_BillingAddressAtShipping
 * Author : Hidayet OK @ grinet
 * Forked From : https://github.com/collabpl/magento2-module-checkout-billing-at-shipping
 * Old Author : Marcin Jędrzejewski <m.jedrzejewski@collab.pl>
 * Copyright (c) 2024 Collab; Copyright (c) 2026 Grinet
 * License : MIT (see LICENSE.md)
 */

/* Run with node Test/JavaScript/billing-address.test.js from the module directory. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
let definition, billing, selectedKey, saved, loggedIn = false, invalid = false;
const shipping = {getKey: () => 'shipping', getCacheKey: () => 'shipping', city: 'Bonn'};
const savedAddress = {customerAddressId: 42, getType: () => 'customer-address', getKey: () => 'customer-address42'};
const data = {'billingAddress': {city: 'Berlin'}, 'params.invalid': false};
const source = {
    get: key => data[key], set: (key, value) => {data[key] = value;},
    trigger: () => {data['params.invalid'] = invalid;}
};
const checkoutData = {
    getSelectedBillingAddress: () => selectedKey,
    setSelectedBillingAddress: key => {selectedKey = key;},
    getNewCustomerBillingAddress: () => saved,
    setNewCustomerBillingAddress: value => {saved = value;}
};
const deps = [
    {extend: (...args) => Object.assign({}, ...args.filter(x => x && typeof x === 'object'))},
    {pureComputed: (fn, context) => fn.bind(context)},
    {extend: value => value}, {isLoggedIn: () => loggedIn}, () => [savedAddress],
    {billingAddress: () => billing, shippingAddress: () => shipping, isVirtual: () => false},
    value => {billing = value;}, value => ({...value, getKey: () => 'new-customer-billing-address'}),
    checkoutData, {}, {initFields() {}}, {}, value => value
];
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../view/frontend/web/js/view/billing-address.js'), 'utf8'), {
    define: (names, factory) => {definition = factory(...deps);}
});
function component() {
    const instance = Object.assign({}, definition, {
        _super() {return this;},
        observe(values) {
            for (const [key, initial] of Object.entries(values)) {
                let value = initial;
                this[key] = function (next) {if (arguments.length) {value = next;} return value;};
            }
            return this;
        }, source, dataScopePrefix: 'billingAddress', focusInvalid() {this.focused = true;}
    });
    instance.initObservable();
    return instance;
}
let form = component();
assert.equal(form.isAddressSameAsShipping(), true);
assert.equal(form.validateBillingInformation(), true);
assert.equal(billing, shipping);
assert.equal(selectedKey, 'shipping');
form.isAddressSameAsShipping(false);
form.selectedAddress(42);
assert.equal(form.validateBillingInformation(), true);
assert.equal(billing, savedAddress);
assert.equal(selectedKey, 'customer-address42');
form.selectedAddress(null);
invalid = true;
assert.equal(form.validateBillingInformation(), false);
assert.equal(form.focused, true);
assert.equal(billing, savedAddress);
invalid = false;
loggedIn = true;
form.saveInAddressBook(false);
assert.equal(form.validateBillingInformation(), true);
assert.equal(billing.city, 'Berlin');
assert.equal(billing.save_in_address_book, 0);
assert.equal(saved.city, 'Berlin');
assert.equal(selectedKey, 'new-customer-billing-address');
form.saveInAddressBook(true);
form.validateBillingInformation();
assert.equal(billing.save_in_address_book, 1);
loggedIn = false;
form.validateBillingInformation();
assert.equal(billing.save_in_address_book, 0);
billing = null;
form = component();
assert.equal(form.isAddressSameAsShipping(), false);
assert.equal(form.isAddressFormVisible(), true);
selectedKey = 'customer-address42';
form = component();
assert.equal(form.selectedAddress(), 42);
assert.equal(form.isAddressFormVisible(), false);
assert.equal(form.isAddressFormListVisible(), true);
// Backend billing and shipping objects may have distinct cache keys after a reload.
selectedKey = 'shipping';
billing = {getKey: () => 'new-customer-billing-address', getCacheKey: () => 'billing'};
form = component();
assert.equal(form.isAddressSameAsShipping(), true);
assert.equal(form.isAddressFormVisible(), false);
console.log('Billing address: 24 behavioral assertions passed.');
