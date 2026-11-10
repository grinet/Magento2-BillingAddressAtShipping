/**
 * Grinet_BillingAddressAtShipping
 * Author : Hidayet OK @ grinet
 * Forked From : https://github.com/collabpl/magento2-module-checkout-billing-at-shipping
 * Old Author : Marcin Jędrzejewski <m.jedrzejewski@collab.pl>
 * Copyright (c) 2024 Collab; Copyright (c) 2026 Grinet
 * License : MIT (see LICENSE.md)
 */

define([
    'jquery', 'ko', 'Magento_Ui/js/form/form', 'Magento_Customer/js/model/customer',
    'Magento_Customer/js/model/address-list', 'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/action/select-billing-address', 'Magento_Checkout/js/action/create-billing-address',
    'Magento_Checkout/js/checkout-data', 'Magento_Checkout/js/model/address-converter',
    'Magento_Checkout/js/model/billing-address-postcode-validator', 'uiRegistry', 'mage/translate'
], function ($, ko, Component, customer, addressList, quote, selectBillingAddress,
    createBillingAddress, checkoutData, addressConverter, postcodeValidator, registry, $t) {
    'use strict';

    return Component.extend({
        defaults: {template: 'Grinet_BillingAddressAtShipping/billing-address'},
        isCustomerLoggedIn: customer.isLoggedIn,

        initObservable: function () {
            var billing = quote.billingAddress(), shipping = quote.shippingAddress(),
                storedKey = checkoutData.getSelectedBillingAddress(),
                selectedKey = storedKey || (billing && billing.getKey()), selected;

            this.addressOptions = addressList().filter(function (address) {
                return address.getType() === 'customer-address';
            });
            this.customerHasAddresses = this.addressOptions.length > 0;
            selected = this.addressOptions.find(function (address) {
                return address.getKey() === selectedKey;
            });
            this.addressOptions.push({customerAddressId: null, getAddressInline: function () {
                return $t('New Address');
            }});
            this._super().observe({
                isAddressSameAsShipping: storedKey ? Boolean(shipping && storedKey === shipping.getKey()) :
                    !billing || !shipping || billing.getCacheKey() === shipping.getCacheKey(),
                selectedAddress: selected ? selected.customerAddressId : null,
                saveInAddressBook: billing && billing.saveInAddressBook !== undefined ? billing.saveInAddressBook : 1
            });
            this.isAddressFormVisible = ko.pureComputed(function () {
                return !this.isAddressSameAsShipping() && !this.selectedAddress();
            }, this);
            this.isAddressFormListVisible = ko.pureComputed(function () {
                return !this.isAddressSameAsShipping() && this.customerHasAddresses;
            }, this);
            return this;
        },

        initialize: function () {
            this._super();
            registry.async('checkoutProvider')(function (provider) {
                var saved = checkoutData.getNewCustomerBillingAddress(), billing = quote.billingAddress();

                if (!saved && billing && !this.isAddressSameAsShipping()) {
                    saved = addressConverter.quoteAddressToFormAddressData(billing);
                }
                if (saved) {
                    provider.set(this.dataScopePrefix, $.extend(true, {}, provider.get(this.dataScopePrefix), saved));
                }
            }.bind(this));
            postcodeValidator.initFields(this.name + '.form-fields');
            return this;
        },

        canUseShippingAddress: function () {
            return !quote.isVirtual();
        },

        addressOptionsText: function (address) {
            return address.getAddressInline();
        },

        useShippingAddress: function () {
            return true;
        },

        getCode: function () {
            return 'grinet-shipping';
        },

        validateBillingInformation: function () {
            var selected, data, billing;

            if (this.isAddressSameAsShipping()) {
                if (!quote.shippingAddress()) {
                    return false;
                }
                selectBillingAddress(quote.shippingAddress());
                checkoutData.setSelectedBillingAddress(quote.shippingAddress().getKey());
                return true;
            }
            selected = this.addressOptions.find(function (address) {
                return address.customerAddressId && String(address.customerAddressId) === String(this.selectedAddress());
            }, this);
            if (selected) {
                selectBillingAddress(selected);
                checkoutData.setSelectedBillingAddress(selected.getKey());
                return true;
            }
            this.source.set('params.invalid', false);
            this.source.trigger(this.dataScopePrefix + '.data.validate');
            if (this.source.get(this.dataScopePrefix + '.custom_attributes')) {
                this.source.trigger(this.dataScopePrefix + '.custom_attributes.data.validate');
            }
            if (this.source.get('params.invalid')) {
                this.focusInvalid();
                return false;
            }
            data = $.extend(true, {}, this.source.get(this.dataScopePrefix));
            data.save_in_address_book = customer.isLoggedIn() && this.saveInAddressBook() ? 1 : 0;
            billing = createBillingAddress(data);
            selectBillingAddress(billing);
            checkoutData.setSelectedBillingAddress(billing.getKey());
            checkoutData.setNewCustomerBillingAddress(data);
            return true;
        }
    });
});
