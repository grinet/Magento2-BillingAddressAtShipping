/**
 * Grinet_BillingAddressAtShipping
 * Author : Hidayet OK @ grinet
 * Forked From : https://github.com/collabpl/magento2-module-checkout-billing-at-shipping
 * Old Author : Marcin Jędrzejewski <m.jedrzejewski@collab.pl>
 * Copyright (c) 2024 Collab; Copyright (c) 2026 Grinet
 * License : MIT (see LICENSE.md)
 */

define([
    'Magento_Checkout/js/model/quote'
], function (quote) {
    'use strict';

    return function (target) {
        // PayPal's shipping summary also uses this method when the pickup module is disabled.
        if (typeof target.prototype.isStorePickup === 'function') {
            return target;
        }

        return target.extend({
            isStorePickup: function () {
                var method = quote.shippingMethod();

                return Boolean(method && method.carrier_code === 'instore' && method.method_code === 'pickup');
            }
        });
    };
});
