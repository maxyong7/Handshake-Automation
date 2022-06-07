const username = "myongxc8@gmail.com";
const password = "Abc12321O)I(U*Y&";

const puppeteer = require('puppeteer'); // v13.0.0 or later
const fs = require('fs');
const cookiesFilePath = 'cookies.json';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);

  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time)
    });
  }

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
    const isInViewport = await element.isIntersectingViewport({ threshold: 0 });
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
      return await element.isIntersectingViewport({ threshold: 0 });
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
    await targetPage.setViewport({ "width": 1084, "height": 937 })
  }
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    await targetPage.goto("https://collegeboard.wd1.myworkdayjobs.com/en-US/Careers/login");
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    const element = await waitForSelectors([["aria/Email Address"], ["#input-6"]], targetPage, { timeout, visible: true });
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({ offset: { x: 266, y: 18 } });
    await element.type(username);

  }
  {
    const targetPage = page;
    const element = await waitForSelectors([["aria/Password"], ["#input-7"]], targetPage, { timeout, visible: true });
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({ offset: { x: 66, y: 24 } });
    await element.type(password);
  }
  {
    const targetPage = page;
    const element = await waitForSelectors([["#wd-Authentication-NO_METADATA_ID-uid6 > div > div.css-ecyovj > bdo > form > div.css-1s1r74k > div > div > div > div > div"]], targetPage, { timeout, visible: true });
    await element.click({ offset: { x: 68, y: 18 } });
    // Save Session Cookies
    console.log("delay");
    await delay(5000);
    const cookiesObject = await page.cookies()
    await delay(5000);
    // Write cookies to temp file to be used in other profile pages
    fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
      function (err) {
        if (err) {
          console.log('The file could not be written.', err)
        }
        console.log('Session has been successfully saved')
      })
  }
  // {
  //   const fs = require(fs);
  //   const cookiesFilePath = 'cookies.json';
  //   // Save Session Cookies
  //   const cookiesObject = await page.cookies()
  //   // Write cookies to temp file to be used in other profile pages
  //   fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
  //     function (err) {
  //       if (err) {
  //         console.log('The file could not be written.', err)
  //       }
  //       console.log('Session has been successfully saved')
  //     })
  // }

  // await browser.close();
})();
