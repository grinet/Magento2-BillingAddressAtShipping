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

namespace Grinet\BillingAddressAtShipping\Model;

class DescriptionSanitizer
{
    /** Escape everything first; restore only the two attribute-free formatting tags. */
    public function sanitize(string $value): string
    {
        $escaped = htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        return (string) preg_replace_callback(
            '~&lt;(/?)(strong|b)\s*&gt;~i',
            static fn (array $match): string => '<' . $match[1] . strtolower($match[2]) . '>',
            $escaped
        );
    }
}
