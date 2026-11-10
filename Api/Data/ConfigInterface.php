<?php

/**
 * Grinet_BillingAddressAtShipping
 * Author : Hidayet OK @ grinet
 * Forked From : https://github.com/collabpl/magento2-module-checkout-billing-at-shipping
 * Old Author : Marcin Jędrzejewski <m.jedrzejewski@collab.pl>
 * Copyright (c) 2024 Collab; Copyright (c) 2026 Grinet
 * License : MIT (see LICENSE.md)
 */

declare(strict_types=1);

namespace Grinet\BillingAddressAtShipping\Api\Data;

interface ConfigInterface
{
    public const XML_PATH_BILLING_ADDRESS_DESTINATION = 'components/checkout/children/steps/children/shipping-step/children/shippingAddress/children/billing-address';
    public const XML_PATH_NATIVE_BILLING_ADDRESS_FORM = 'components/checkout/children/steps/children/billing-step/children/payment/children/afterMethods/children/billing-address-form';
    public const XML_PATH_NATIVE_PAYMENT_LIST = 'components/checkout/children/steps/children/billing-step/children/payment/children/payments-list/children';
    public const XML_PATH_SHOULD_MOVE_BILLING = "grinet_billing_address_at_shipping/general/is_active";

    public function shouldMoveBillingUnderShipping(): bool;
}
