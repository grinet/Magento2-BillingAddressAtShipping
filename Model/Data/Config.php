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

namespace Grinet\BillingAddressAtShipping\Model\Data;

use Grinet\BillingAddressAtShipping\Api\Data\ConfigInterface;
use Grinet\BillingAddressAtShipping\Model\DescriptionSanitizer;
use Magento\Checkout\Model\ConfigProviderInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

class Config implements ConfigInterface, ConfigProviderInterface
{
    public function __construct(
        private ScopeConfigInterface $scopeConfig,
        private DescriptionSanitizer $sanitizer
    ) {
    }

    public function shouldMoveBillingUnderShipping(): bool
    {
        return $this->scopeConfig->isSetFlag(self::XML_PATH_SHOULD_MOVE_BILLING, ScopeInterface::SCOPE_STORE);
    }

    public function getConfig(): array
    {
        $active = $this->shouldMoveBillingUnderShipping();
        return ['grinetBillingAddressAtShipping' => [
            'isActive' => $active,
            'descriptionAbove' => $active ? $this->description('description_above') : '',
            'descriptionBelow' => $active ? $this->description('description_below') : ''
        ]];
    }

    private function description(string $field): string
    {
        return $this->sanitizer->sanitize((string) $this->scopeConfig->getValue(
            'grinet_billing_address_at_shipping/general/' . $field,
            ScopeInterface::SCOPE_STORE
        ));
    }
}
