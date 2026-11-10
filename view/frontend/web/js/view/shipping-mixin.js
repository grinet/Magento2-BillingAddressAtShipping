/**
 * Grinet_BillingAddressAtShipping
 * Author : Hidayet OK @ grinet
 * Forked From : https://github.com/collabpl/magento2-module-checkout-billing-at-shipping
 * Old Author : Marcin Jędrzejewski <m.jedrzejewski@collab.pl>
 * Copyright (c) 2024 Collab; Copyright (c) 2026 Grinet
 * License : MIT (see LICENSE.md)
 */

define([
    'jquery', 'Magento_Checkout/js/model/quote', 'Magento_Checkout/js/action/set-shipping-information',
    'Magento_Checkout/js/model/step-navigator', 'Magento_Checkout/js/checkout-data', 'uiRegistry'
], function ($, quote, setShippingInformationAction, stepNavigator, checkoutData, registry) {
    'use strict';

    return function (target) {
        var config = window.checkoutConfig && window.checkoutConfig.grinetBillingAddressAtShipping;

        if (!config || !config.isActive || quote.isVirtual()) {
            return target;
        }
        return target.extend({
            defaults: {template: 'Grinet_BillingAddressAtShipping/shipping-billing-combined'},
            renderBillingAtShipping: true,
            descriptionAbove: config.descriptionAbove || '',
            descriptionBelow: config.descriptionBelow || '',

            setShippingInformation: function () {
                var billing = registry.get(this.name + '.billing-address');

                if (!this.validateShippingInformation() || !billing || !billing.validateBillingInformation()) {
                    return;
                }
                registry.async('checkoutProvider')(function (provider) {
                    var shippingData = checkoutData.getShippingAddressFromData();

                    if (shippingData) {
                        provider.set('shippingAddress', $.extend(true, {}, provider.get('shippingAddress'), shippingData));
                    }
                });
                return setShippingInformationAction().done(function () {
                    stepNavigator.next();
                });
            }
        });
    };
});
