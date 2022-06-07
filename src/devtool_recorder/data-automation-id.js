const puppeteer = require('puppeteer'); // v13.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    async function waitForSelectors(selectors, frame, options) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

    async function scrollIntoViewIfNeeded(element, timeout) {
      await waitForConnected(element, timeout);
      const isInViewport = await element.isIntersectingViewport({threshold: 0});
      if (isInViewport) {
        return;
      }
      await element.evaluate(element => {
        element.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'auto',
        });
      });
      await waitForInViewport(element, timeout);
    }

    async function waitForConnected(element, timeout) {
      await waitForFunction(async () => {
        return await element.getProperty('isConnected');
      }, timeout);
    }

    async function waitForInViewport(element, timeout) {
      await waitForFunction(async () => {
        return await element.isIntersectingViewport({threshold: 0});
      }, timeout);
    }

    async function waitForSelector(selector, frame, options) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }

    async function waitForElement(step, frame, timeout) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      }, timeout);
    }

    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }

    async function querySelectorAll(selector, frame) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (i === 0) {
          elements = await frame.$$(part);
        } else {
          const tmpElements = elements;
          elements = [];
          for (const el of tmpElements) {
            elements.push(...(await el.$$(part)));
          }
        }
        if (elements.length === 0) {
          return [];
        }
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }

    async function waitForFunction(fn, timeout) {
      let isActive = true;
      setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }
    {
        const targetPage = page;
        await targetPage.setViewport({"width":1903,"height":937})
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto("https://collegeboard.wd1.myworkdayjobs.com/en-US/Careers/job/New-York%2C-NY/Technical-Support-Specialist---Pre-AP-Programs_REQ000647/apply/autofillWithResume?source=LinkedIn");
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#\\32 "],["aria/No"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 11.5, y: 3.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=countryDropdown]"],["aria/Country United States of America required"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 63.5, y: 14.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#\\32 a7c72a6-6437-4abf-be8a-020fc9950ecd > div"],["aria/United States of America","aria/[role=\"generic\"]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 51, y: 6} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=legalNameSection_firstName]"],["aria/First Name*"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 118.5, y: 21.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=legalNameSection_lastName]"],["aria/Last Name*"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 62.5, y: 13.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=addressSection_addressLine1]"],["aria/Address Line 1"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 104.5, y: 22.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=addressSection_city]"],["aria/City"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 68.5, y: 18.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=addressSection_countryRegion]"],["aria/State Minnesota"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 152.5, y: 15.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#\\33 6f250f3-059b-4133-a447-f8d56339f36c > div"],["aria/Minnesota","aria/[role=\"generic\"]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 117, y: 11} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=addressSection_postalCode]"],["aria/Postal Code"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 122.5, y: 13.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=phone-device-type]"],["aria/Phone Device Type Personal Cell required"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 114.5, y: 24.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#\\34 43bd5dd-57a1-4da1-b062-453bd877fb24 > div"],["aria/Personal Cell","aria/[role=\"generic\"]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 69, y: 6} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=phone-number]"],["aria/Phone Number*"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 203.5, y: 21.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=bottom-navigation-next-button]"],["aria/Save and Continue"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 126.875, y: 17} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=jobTitle]"],["aria/Work Experience 1[role=\"group\"]","aria/Job Title*"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 269.5, y: 13.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=company]"],["aria/Work Experience 1[role=\"group\"]","aria/Company*"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 141.5, y: 21.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=location]"],["aria/Work Experience 1[role=\"group\"]","aria/Location"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 168.5, y: 11.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=spinnerDisplay]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 8.5, y: 9.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=spinnerDisplay]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 22.546875, y: 15.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=spinnerDisplay]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 6.5, y: 11.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=spinnerDisplay]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 12.546875, y: 9.890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["[data-automation-id=description]"],["aria/Work Experience 1[role=\"group\"]","aria/Role Description"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 177.5, y: 28.890625} });
    }

    await browser.close();
})();
