import puppeteer, { customQueryHandlerNames, ElementHandle } from 'puppeteer'
import { isCatchClause } from 'typescript'
import * as secrets from './secrets'
const fs = require('fs')
const cookiesFilePath = './cookies_handshake.json'
const href_logs_FilePath = './href_logs.json'

const randomIntFromInterval = (min: number, max: number) => { // min inclusive and max exclusive
    return Math.floor(Math.random() * (max - min) + min);
}

let sleep_for = async (page: puppeteer.Page, min: number, max: number) => {
    let sleep_duration = randomIntFromInterval(min, max);
    console.log('waiting for', sleep_duration / 1000, 'seconds');
    await page.waitForTimeout(sleep_duration);// simulate some quasi human behaviour
}

let sign_in = async (page: puppeteer.Page) => { //To Sign In
    try {
        const login_page = await page.$x(`//a[@data-bind="click: track_sso_click"]`)
        if (login_page.length > 0) {
            await login_page[0].focus()
            await login_page[0].click()
            await page.waitForXPath(`//input[@id="identifier"]`, { timeout: 0 })
            const star_id_username = await page.$x(`//input[@id="identifier"]`)
            await star_id_username[0].focus()
            await star_id_username[0].click({ clickCount: 4 })
            await star_id_username[0].type(secrets.star_id_username)
            const star_id_password = await page.$x(`//input[@id="password"]`)
            await star_id_password[0].focus()
            await star_id_password[0].click({ clickCount: 4 })
            await star_id_password[0].type(secrets.star_id_password)
            await sleep_for(page, 500, 1000)
            const sign_in_button = await page.$x(`//button[@aria-label="submit"]`)
            await sign_in_button[0].focus()
            await sign_in_button[0].click()
        }

    } catch (e) {
        console.log("Error in Sign In:", e);
    }
}

let application_results = async (page: puppeteer.Page, browser: puppeteer.Browser) => { //To go through list and apply for jobs
    try {
        await page.waitForXPath(`//a[@data-hook="jobs-card"]`, { timeout: 0 })
        // Save Session Cookies
        const cookiesObject = await page.cookies()
        // Write cookies to temp file to be used in other profile pages
        fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
            function () {
                try {
                    console.log('Session has been successfully saved')
                } catch (e) {
                    console.log('The file could not be written.', e)
                }

            }
        )

        let next_page = await page.$x(`//*[@id="skip-to-content"]/div[3]/div/div[1]/div/form/div[2]/div/div/div[1]/div[2]/div/div[2]/div/div/button[2]`)
        while (next_page.length != 0) {
            const search_results_panel = await page.$x(`//a[@data-hook="jobs-card"]`)
            const total_jobs = search_results_panel.length


            for (let i = 0; i < total_jobs; i++) {
                await search_results_panel[i].focus()
                await search_results_panel[i].click()
                // await sleep_for(page, 2000, 3000)
                try {
                    await page.waitForXPath(`//div[@data-hook="posted-date"]`, { timeout: 10000 })
                    const quick_apply = await page.$x(`//button[@data-hook="apply-button" and span="Quick Apply"]`)
                    const apply = await page.$x(`//button[@data-hook="apply-button" and span="Apply"]`)
                    if (quick_apply.length > 0) {
                        await quick_apply[0].focus()
                        await quick_apply[0].click()
                    }
                    else if (apply.length > 0) {
                        await apply[0].focus()
                        await apply[0].click()
                    }

                    if (quick_apply.length > 0 || apply.length > 0) {

                        await page.waitForXPath('//span[@data-hook="submit-application"]')
                        const attach_resume_dropbox = await page.$x(`//div[@class="Select-placeholder"]`)
                        if (attach_resume_dropbox.length == 1) {
                            await attach_resume_dropbox[0].focus()
                            await attach_resume_dropbox[0].click()
                            await page.waitForXPath(`//div[@role="option"]`)
                            const select_resume = await page.$x(`//div[@role="option"]`)
                            await select_resume[0].click()
                        }
                        if (attach_resume_dropbox.length > 1) {
                            const attach_cover_letter_dropbox = await page.$x(`(//div[@class="Select-placeholder"])[2]`)
                            await attach_resume_dropbox[0].focus()
                            await attach_resume_dropbox[0].click()
                            await page.waitForXPath(`//div[@role="option"]`)
                            const select_resume = await page.$x(`//div[@role="option"]`)
                            console.log("select_resume.length = " + select_resume.length)
                            await select_resume[0].click()

                            //Check for Cover Letter
                            if (attach_cover_letter_dropbox.length > 0) {
                                await attach_cover_letter_dropbox[0].focus()
                                await attach_cover_letter_dropbox[0].click()
                                await page.waitForXPath(`//div[@role="option"]`)
                                const select_cover_letter = await page.$x(`//div[@class="Select-menu-outer"]`)
                                await select_cover_letter[0].click()

                            }

                        }
                        await sleep_for(page, 1500, 2000)
                        //Click "Submit Application" button
                        let submit_application_check = await page.$x('//button[@data-hook="button"][(@disabled="")]')
                        if (submit_application_check.length < 1) {
                            const submit_application_button = await page.$x('//span[@data-hook="submit-application"]')
                            await submit_application_button[0].focus()
                            console.log("not clicking")
                            //await submit_application_button[0].click()
                        }
                        else {
                            //XPath reference
                            const link_ref = await page.$x(`//*[@id="skip-to-content"]/div[3]/div/div[1]/div/form/div[2]/div/div/div[2]/div[1]/div[1]/h1/a`)
                            //Get link from @href value of XPath
                            const link_urls = await page.evaluate((...link_ref) => {
                                return link_ref.map(e => e.href);
                            }, ...link_ref)
                            console.log(link_urls)
                            //Log @href value to local JSON file
                            var href_log_read = fs.readFileSync(href_logs_FilePath);
                            var href_log_data = JSON.parse(href_log_read);
                            link_urls.push(href_log_data)
                            fs.writeFile(href_logs_FilePath, JSON.stringify(link_urls),
                                function () {
                                    try {
                                        console.log('@href logs has been successfully saved')
                                    } catch (e) {
                                        console.log('@href logs could not be written.', e)
                                    }

                                }
                            )
                            //Open @href link in a new tab
                            const page_2 = await browser.newPage()
                            await page_2.setViewport({
                                width: 1920, height: 780,
                                deviceScaleFactor: 1,
                            })
                            await page_2.goto(link_urls[0], { waitUntil: 'networkidle2' })
                            //Return to old tab
                            await page.bringToFront();


                        }

                        const apply_pop_up = await page.$x('//span[@data-hook="apply-modal-content"]')
                        if (apply_pop_up.length > 0) {
                            const dismiss_button = await page.$x('//button[@class="style__dismiss___Zotdc"]')
                            if (dismiss_button.length > 0) {
                                await dismiss_button[0].focus()
                                await dismiss_button[0].click()
                            }
                        }



                    }
                    // await page.waitForXPath()
                    // cost submit_application = await page.$x(`//span[@data-hook="submit-application"]`)
                    // if (quick_apply.length > 0 || apply.length > 0) {
                    //     await page.waitForXPath('//span[text()="Upload New"]', { timeout: 0 })
                    //     await sleep_for(page, 1000, 1500);
                    //     const click_random_pop_up = await page.$x('//span[@data-hook="apply-modal-content"]')
                    //     await click_random_pop_up[0].click
                    //     const upload_resume = await page.$x('//span[text()="Upload New"]')
                    //     console.log(upload_resume.length)
                    //     if (upload_resume.length == 1) {
                    //         console.log("1")
                    //         const [fileChooser] = await Promise.all([
                    //             page.waitForFileChooser(),
                    //             upload_resume[0].click, // some button that triggers file selection
                    //         ])
                    //         await sleep_for(page, 1000, 1500);
                    //         await fileChooser.accept([secrets.handshake_resume])

                    //     }

                    //     if (upload_resume.length == 2) {
                    //         console.log("2")
                    //         await upload_resume[0].click
                    //         const [fileChooser_1] = await Promise.all([
                    //             page.waitForFileChooser(),
                    //             upload_resume[0].click, // some button that triggers file selection
                    //         ])
                    //         await sleep_for(page, 1000, 1500);
                    //         await fileChooser_1.accept([secrets.handshake_resume])

                    //         await sleep_for(page, 1500, 2000)
                    //         const [fileChooser_2] = await Promise.all([
                    //             page.waitForFileChooser(),
                    //             upload_resume[1].click, // some button that triggers file selection
                    //         ])
                    //         await sleep_for(page, 1000, 1500);
                    //         await fileChooser_2.accept([secrets.handshake_cover_letter])

                    //     }
                    // let submit_application_check = await page.$x('//button[@data-hook="button"][(@disabled="")]')
                    // if (submit_application_check.length < 1) {
                    //     const submit_application_button = await page.$x('//span[@data-hook="submit-application"]')
                    //     await submit_application_button[0].focus()
                    //     //await submit_application_button[0].click()

                    // }
                } catch (e) {
                    console.log(e)
                    await search_results_panel[i - 1].focus()
                    await search_results_panel[i - 1].click()
                    i -= 1
                    //const link_ref = await page.$x(`//*[@id="skip-to-content"]/div[3]/div/div[1]/div/form/div[2]/div/div/div[2]/div[1]/div[1]/h1/a`)
                    const link_ref = await page.$x(`//*[@id="skip-to-content"]/div[3]/div/div[1]/div/form/div[2]/div/div/div[2]/div[1]/div[1]/h1/a/@href`)
                    const link_urls = await page.evaluate((...link_ref) => {
                        return link_ref.map(e => e.href);
                    }, ...link_ref)
                    console.log(link_urls)
                    var href_log_read = fs.readFileSync(href_logs_FilePath);
                    var href_log_data = JSON.parse(href_log_read);
                    link_urls.push(href_log_data)
                    fs.writeFile(href_logs_FilePath, JSON.stringify(link_urls),
                        function () {
                            try {
                                console.log('@href logs has been successfully saved')
                            } catch (e) {
                                console.log('@href logs could not be written.', e)
                            }

                        }
                    )
                }

            }
            //Check for "Next Page" button
            next_page = await page.$x(`//*[@id="skip-to-content"]/div[3]/div/div[1]/div/form/div[2]/div/div/div[1]/div[2]/div/div[2]/div/div/button[2][not(@disabled="")]`)
            if (next_page.length > 0) {
                await next_page[0].focus()
                await next_page[0].click()
                await page.waitForXPath(`//a[@data-hook="jobs-card"]`, { timeout: 0 })
            }
            if (next_page.length == 0) {
                console.log("done")
                break
            }

        }



    } catch (e) {
        console.log("Error in Application Results:", e);
        const link_ref = await page.$x(`//*[@id="skip-to-content"]/div[3]/div/div[1]/div/form/div[2]/div/div/div[2]/div[1]/div[1]/h1/a`)
        console.log(link_ref)
    }
}


let main_actual = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false, slowMo: 0 });
        const page = await browser.newPage();
        //const URL = 'https://stcloudstate.joinhandshake.com/stu/postings?page=1&per_page=25&sort_direction=desc&sort_column=default&query=graphic&job.salary_types%5B%5D=1&job.job_types%5B%5D=3&job.job_types%5B%5D=9&job.student_screen.work_auth_not_required=true&job.student_screen.accepts_opt_cpt_candidates=true&employment_type_names%5B%5D=Part-Time&employment_type_names%5B%5D=Full-Time'
        //const URL = 'https://stcloudstate.joinhandshake.com/stu/postings?page=1&per_page=25&sort_direction=desc&sort_column=default&query=intern&job.salary_types%5B%5D=1&job.job_types%5B%5D=3&job.student_screen.work_auth_not_required=true&job.student_screen.accepts_opt_cpt_candidates=true'
        const URL = 'https://stcloudstate.joinhandshake.com/stu/postings?page=1&per_page=25&sort_direction=desc&sort_column=default&query=intern%20design&job.salary_types%5B%5D=1&job.job_types%5B%5D=6&job.student_screen.work_auth_not_required=true&job.student_screen.accepts_opt_cpt_candidates=true'
        await page.setViewport({
            width: 1920, height: 780,
            deviceScaleFactor: 1,
        });
        //If want to use pre-saved cookies
        if (secrets.check_for_cookie_handshake) {
            //Check for Cookies
            const previousSession = fs.existsSync('cookies_handshake.json')
            if (previousSession) {

                // If file exist load the cookies
                const cookiesString = fs.readFileSync('cookies_handshake.json');
                const parsedCookies = JSON.parse(cookiesString);
                if (parsedCookies.length !== 0) {
                    for (let cookie of parsedCookies) {
                        await page.setCookie(cookie)
                    }
                    console.log('Session has been loaded in the browser')
                    await page.goto(URL, { waitUntil: 'networkidle2' });
                    await application_results(page, browser)
                }
            }
        }
        else {
            await page.goto(URL, { waitUntil: 'networkidle2' });
            await sign_in(page)
            await application_results(page, browser)
        }



    } catch (e) {
        console.log(e);
    }
}

let main = async () => {
    main_actual()
}

main(); //bootstrap