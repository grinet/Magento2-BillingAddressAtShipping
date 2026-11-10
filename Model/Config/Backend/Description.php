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

namespace Grinet\BillingAddressAtShipping\Model\Config\Backend;

use Magento\Framework\App\Config\Value;
use Magento\Framework\Exception\LocalizedException;

class Description extends Value
{
    public function beforeSave()
    {
        $value = (string) $this->getValue();
        $plain = preg_replace('~</?(?:strong|b)\s*>~i', '', $value);
        if (preg_match('~<[^>]*>~s', $plain)) {
            throw new LocalizedException(__(
                'Only <strong> and <b> tags without attributes are allowed in billing address descriptions.'
            ));
        }
        return parent::beforeSave();
    }
}
