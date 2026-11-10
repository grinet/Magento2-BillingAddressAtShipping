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

namespace Grinet\BillingAddressAtShipping\Test\Unit;

use Grinet\BillingAddressAtShipping\Api\Data\ConfigInterface;
use Grinet\BillingAddressAtShipping\Block\LayoutProcessor\Checkout\BillingFormHandler;
use Grinet\BillingAddressAtShipping\Model\DescriptionSanitizer;
use Grinet\BillingAddressAtShipping\Model\Data\Config;
use Magento\Checkout\Block\Checkout\AttributeMerger;
use Magento\Checkout\Model\Session;
use Magento\Customer\Model\AttributeMetadataDataProvider;
use Magento\Customer\Model\Options;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Stdlib\ArrayManager;
use Magento\Quote\Model\Quote;
use Magento\Ui\Component\Form\AttributeMapper;
use PHPUnit\Framework\TestCase;

class CheckoutTest extends TestCase
{
    public function testDescriptionsAllowOnlyAttributeFreeBoldTags(): void
    {
        $sanitizer = new DescriptionSanitizer();
        self::assertSame('Text <strong>bold</strong> <b>also bold</b>', $sanitizer->sanitize('Text <strong>bold</strong> <b>also bold</b>'));
        foreach (['<script>alert(1)</script>', '<b onclick="alert(1)">x</b>', '<img src=x onerror=alert(1)>', '&lt;script&gt;', '<svg/onload=alert(1)>'] as $input) {
            $html = $sanitizer->sanitize($input);
            self::assertDoesNotMatchRegularExpression('~<(?!/?(?:strong|b)>)[^>]+>~i', $html);
        }
        self::assertSame('', $sanitizer->sanitize(''));
    }

    public function testAdminRejectsUnsupportedHtml(): void
    {
        foreach (['<a href="/">Link</a>', '<b class="x">Bold</b>', '<script>alert(1)</script>'] as $input) {
            $backend = $this->getMockBuilder(\Grinet\BillingAddressAtShipping\Model\Config\Backend\Description::class)
                ->disableOriginalConstructor()->onlyMethods([])->getMock();
            $backend->setValue($input);
            try {
                $backend->beforeSave();
                self::fail('Unsupported HTML was accepted.');
            } catch (\Magento\Framework\Exception\LocalizedException $exception) {
                self::assertStringContainsString('without attributes', $exception->getMessage());
            }
        }
    }

    public function testDisabledConfigurationDoesNotExposeDescriptions(): void
    {
        $scope = $this->createMock(ScopeConfigInterface::class);
        $scope->method('isSetFlag')->willReturn(false);
        $scope->expects(self::never())->method('getValue');
        self::assertSame(['grinetBillingAddressAtShipping' => [
            'isActive' => false, 'descriptionAbove' => '', 'descriptionBelow' => ''
        ]], (new Config($scope, new DescriptionSanitizer()))->getConfig());
    }

    public function testActiveConfigurationUsesStoreScopeAndEscapesDescriptions(): void
    {
        $scope = $this->createMock(ScopeConfigInterface::class);
        $scope->expects(self::once())->method('isSetFlag')->with(ConfigInterface::XML_PATH_SHOULD_MOVE_BILLING, 'store')->willReturn(true);
        $scope->expects(self::exactly(2))->method('getValue')->willReturnCallback(function ($path, $scopeType) {
            self::assertSame('store', $scopeType);
            return str_ends_with($path, 'description_above') ? '<strong>Hello</strong>' : '<img src=x>';
        });
        $data = (new Config($scope, new DescriptionSanitizer()))->getConfig()['grinetBillingAddressAtShipping'];
        self::assertSame('<strong>Hello</strong>', $data['descriptionAbove']);
        self::assertSame('&lt;img src=x&gt;', $data['descriptionBelow']);
    }

    public function testLayoutMovesBillingButPreservesPaymentExtensions(): void
    {
        $array = new ArrayManager();
        $layout = $array->set(ConfigInterface::XML_PATH_NATIVE_PAYMENT_LIST, [], [
            'checkmo-form' => ['component' => 'Magento_Checkout/js/view/billing-address'],
            'before-place-order' => ['component' => 'uiComponent'],
            'custom-payment' => ['component' => 'Vendor/js/payment']
        ]);
        $layout = $array->set(ConfigInterface::XML_PATH_NATIVE_BILLING_ADDRESS_FORM, $layout, ['component' => 'Magento_Checkout/js/view/billing-address']);
        $layout = $array->set(dirname(ConfigInterface::XML_PATH_BILLING_ADDRESS_DESTINATION), $layout, []);
        $output = $this->processor(true, false)->process($layout);
        self::assertFalse($array->exists(ConfigInterface::XML_PATH_NATIVE_BILLING_ADDRESS_FORM, $output));
        self::assertFalse($array->exists(ConfigInterface::XML_PATH_NATIVE_PAYMENT_LIST . '/checkmo-form', $output));
        self::assertTrue($array->exists(ConfigInterface::XML_PATH_NATIVE_PAYMENT_LIST . '/custom-payment', $output));
        self::assertTrue($array->exists(ConfigInterface::XML_PATH_NATIVE_PAYMENT_LIST . '/before-place-order', $output));
        self::assertSame('Grinet_BillingAddressAtShipping/js/view/billing-address', $array->get(ConfigInterface::XML_PATH_BILLING_ADDRESS_DESTINATION . '/component', $output));
        self::assertSame($layout, $this->processor(false, false)->process($layout));
        self::assertSame($layout, $this->processor(true, true)->process($layout));
        self::assertSame([], $this->processor(true, false)->process([]));
    }

    private function processor(bool $active, bool $virtual): BillingFormHandler
    {
        $config = $this->createMock(ConfigInterface::class);
        $config->method('shouldMoveBillingUnderShipping')->willReturn($active);
        $quote = $this->getMockBuilder(Quote::class)->disableOriginalConstructor()->onlyMethods(['isVirtual'])->getMock();
        $quote->method('isVirtual')->willReturn($virtual);
        $session = $this->createMock(Session::class);
        $session->method('getQuote')->willReturn($quote);
        $metadata = $this->createMock(AttributeMetadataDataProvider::class);
        $metadata->method('loadAttributesCollection')->willReturn([]);
        $merger = $this->createMock(AttributeMerger::class);
        $merger->method('merge')->willReturn([]);
        return new BillingFormHandler(
            $config,
            $metadata,
            $this->createMock(AttributeMapper::class),
            $merger,
            $session,
            new ArrayManager(),
            $this->createMock(Options::class)
        );
    }
}
