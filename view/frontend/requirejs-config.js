/**
 * Grinet_BillingAddressAtShipping
 * Author : Hidayet OK @ grinet
 * Forked From : https://github.com/collabpl/magento2-module-checkout-billing-at-shipping
 * Old Author : Marcin Jędrzejewski <m.jedrzejewski@collab.pl>
 * Copyright (c) 2024 Collab; Copyright (c) 2026 Grinet
 * License : MIT (see LICENSE.md)
 */

var config = {
    config: {
        mixins: {
            'Magento_Checkout/js/view/shipping': {
                'Grinet_BillingAddressAtShipping/js/view/shipping-mixin': true
            },
            'Magento_Checkout/js/view/shipping-information': {
                'Grinet_BillingAddressAtShipping/js/view/shipping-information-mixin': true
            }
        }
    }
};
