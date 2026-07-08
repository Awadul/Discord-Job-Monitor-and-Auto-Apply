import { Client } from 'discord.js-selfbot-v13';
import config from '../config.json' with { type: 'json' };
import chalk from 'chalk';
import crypto from 'crypto';
import { JSDOM } from 'jsdom';
import db from './database/data.database.js';

const client = new Client();
let servers;

// on the event of new threads beings generated in the servers
client.on('threadCreate', async (thread) => {
    // console.log(`New thread created: ${thread}`);
    // the client returns this tag as as the thread rather than the object to work on.
    // Example: New thread created: <#1520779790628687972>

    // we confirm that we want to work in this server first.
    if (config.Servers.some(data => data.ServerID === thread.guild.id)) {

        try {
            // get the starter message
            const threadName = thread.name;
            const body = await thread.fetchStarterMessage();
            console.log('\nThread Name: ', threadName);
            // User Agent Generation
            // Syntax: User-Agent: Mozilla/5.0 (<system-information>) <platform> (<platform-details>) <extensions>
            // Example: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36

            // operating systems
            const operating_systems = {
                "Windows": [
                    "Windows NT 10.0; Win64; x64",
                    "Windows NT 10.0; WOW64",
                    "Windows NT 11.0; Win64; x64"
                ],
                "Mac": [
                    "Macintosh; Intel Mac OS X 11_6_1",
                    "Macintosh; Intel Mac OS X 12_0_1"
                ],
                "Linux": [
                    "Linux; x86_64",
                    "X11; Ubuntu; Linux x86_64"
                ],
                "Android": [
                    "Android 11; Mobile; Linux; Android",
                ],
                "iOS": [
                    "iPhone; CPU iPhone OS 14_0 like Mac OS X",
                    "iPad; CPU OS 14_0 like Mac OS X"
                ]
            }

            const impressions = {
                "chrome": {
                    "99.0.4844.51": "chrome99",
                    "100.0.4896.60": "chrome100",
                    "101.0.4951.41": "chrome101",
                    "104.0.5112.79": "chrome104",
                    "107.0.5304.110": "chrome107",
                    "110.0.5481.104": "chrome110",
                    "116.0.5845.96": "chrome116",
                    "119.0.6071.104": "chrome119",
                    "120.0.6128.159": "chrome120",
                    "123.0.6138.62": "chrome123",
                    "124.0.6148.62": "chrome124",
                },
                "edge": {
                    "99.0.1150.55": "edge99",
                    "101.0.1210.47": "edge101",
                }
            }
            // languages
            const languages = [
                "en-US,en;q=0.9",
                "en-GB,en;q=0.8",
                "en-CA,en;q=0.9",
                "fr-FR,fr;q=0.7"
            ]

            const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

            const generateUserAgent = () => {
                // get a random browser name
                const browser_name = random(Object.keys(impressions));

                // get a random browser version
                const browser_version = random(Object.keys(impressions[browser_name]));

                // get a random major version
                const major_version = browser_version.split('.')[0];

                // impersonation -> chrome107 ..
                let impersonation;

                if (browser_name == 'chrome') {
                    impersonation = `chrome${major_version}`;
                } else if (browser_name == 'edge') {
                    impersonation = `edge${major_version}`;
                } else if (browser_name == 'firefox') {
                    impersonation = `firefox${major_version}`;
                } else if (browser_name == 'safari') {
                    impersonation = `safari${major_version}`;
                }

                // get a random os key
                let os_key;

                // get a random os based on the browser name
                if (browser_name == 'chrome' || browser_name == 'edge') {
                    os_key = random(['Windows', 'Mac', 'Linux']);
                } else if (browser_name == 'safari') {
                    os_key = random(['Mac', 'iOS']);
                } else {
                    os_key = random(Object.keys(operating_systems));
                }

                // get a random os based on the os key
                const os = random(operating_systems[os_key]);

                let ua;
                if (browser_name == 'chrome') {
                    ua = `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser_version} Safari/537.36`;
                } else if (browser_name == 'edge') {
                    ua = `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Edge/${browser_version} Safari/537.36`;
                } else if (browser_name == 'firefox') {
                    ua = `Mozilla/5.0 (${os}; rv:${major_version}.0) Gecko/${browser_version} Firefox/${major_version}.0`;
                } else if (browser_name == 'safari') {
                    ua = `Mozilla/5.0 (${os}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browser_version} Safari/605.1.15`;
                }

                return { ua, browser_name, browser_version, major_version, os_key, os, impersonation }
            }

            const solveChallenge = async (challengeBase64, userAgent) => {
                const jsCode = Buffer.from(challengeBase64, 'base64').toString('utf-8');
                const dom = new JSDOM('<!DOCTYPE html><body></body>', {
                    url: 'https://duck.ai/',
                    referrer: 'https://duck.ai/',
                    userAgent: userAgent,
                    runScripts: 'dangerously'
                });
                const { window } = dom;

                Object.defineProperty(window.navigator, 'userAgent', { get: () => userAgent, configurable: true });
                Object.defineProperty(window.navigator, 'webdriver', { get: () => false, configurable: true });
                Object.defineProperty(window.HTMLDivElement.prototype, 'offsetHeight', { get: () => 10, configurable: true });
                Object.defineProperty(window.HTMLDivElement.prototype, 'offsetWidth', { get: () => 10, configurable: true });
                Object.defineProperty(window.HTMLDivElement.prototype, 'scrollHeight', { get: () => 10, configurable: true });
                window.HTMLDivElement.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 10, bottom: 10, width: 10, height: 10 });
                Object.defineProperty(window.HTMLIFrameElement.prototype, 'contentWindow', {
                    get: () => ({ self: { toString: () => "[object Window]" } }),
                    configurable: true
                });

                try {
                    const scriptToRun = `window.challengeResult = ${jsCode}`;
                    const scriptElement = window.document.createElement('script');
                    scriptElement.textContent = scriptToRun;
                    window.document.body.appendChild(scriptElement);
                    const result = await window.challengeResult;
                    return result;
                } finally {
                    dom.window.close();
                }
            };

            const generateRequestHeaders = () => {

                let { ua, browser_name, browser_version, major_version, os_key, os, impersonation } = generateUserAgent();

                const requestHeaders = {
                    "Host": "duck.ai",
                    "Accept": impersonation.includes('ai') ? "text/event-stream" : "*/*",
                    "Accept-Language": random(languages),
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Content-Type": "application/json",
                    "Origin": "https://duck.ai",
                    "Referer": "https://duck.ai/",
                    "User-Agent": ua,
                    "Connection": "keep-alive",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "Pragma": "no-cache",
                    "Cache-Control": "no-cache"
                }

                if (browser_name == 'chrome' || browser_name == 'edge') {
                    requestHeaders["sec-ch-ua"] = `"Chromium";v="${major_version}", "Not_A Brand";v="99", "Google Chrome";v="${major_version}"`;
                    requestHeaders["sec-ch-ua-platform"] = `"Google Chrome"`;
                    requestHeaders["sec-ch-ua-mobile"] = os.includes(["Android", "iOS"]) ? "?1" : "?0";
                }

                return { requestHeaders, impersonation, browser_name, os };
            }

            // Helper to parse Server-Sent Events (SSE) from DuckDuckGo Chat API
            const parseSSEResponse = (data) => {
                const dataEntries = data.split('\n');
                const messages = [];
                for (const entry of dataEntries) {
                    if (entry.includes('data: ')) {
                        const jsonPart = entry.replace('data: ', '').trim();
                        if (jsonPart === '[DONE]') continue;
                        try {
                            const dataDict = JSON.parse(jsonPart);
                            if (dataDict.message) {
                                messages.push(dataDict.message);
                            }
                        } catch (e) {
                            // Ignore parsing errors for non-JSON/incomplete lines
                        }
                    }
                }
                return messages.join('');
            };

            // Putting the request to the AI to analyze and work around it
            const request_aiToAnalyze = async () => {
                const prompt = `You are writing a short outreach pitch for Awadul (GitHub: Awadul), a full stack developer, to post as a reply in a Discord hiring/opportunity thread.

ABOUT Awadul (only use what's relevant to this thread, don't dump everything):
- Full stack dev, JavaScript/TypeScript only stack (no Python)
- Core stack: React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Supabase
- AI integrations: OpenAI API (GPT-4o), RAG pipelines, pgvector
- Styling/motion: Tailwind CSS, Framer Motion
- Real projects: CV Customizer App (AI resume tool, GPT-4o backend), RADWI Electronics company website (built end to end), Cargo Express Freight CRM (RBAC, node-cron) and many more. just don't feel like these are the only ones.
- Portfolio: https://awadul.github.io

0. try to make it look like a real person wrote it instead of ai. And don't use any special characters or emojis.
1. HARD LIMIT: under 600 characters if a short/casual thread, under 1000 characters for a detailed job post. Never approach Discord's 2000 character message cap — long pitches get skipped.
2. Example of what to write: {"Hi, I'm a AI Engineer and a dev and have worked with various technologies including but not limited to Node.js, React.js, SQL/No-SQL Databases, Cloud Databases, Supabase and Firebase, python automations, Discord Api and other projects. 
\nIf you're interested, let's have a chat.
\nps -> here is my portfolio: https://awadul.github.io "}

THREAD INFO:
[THREAD INFO]
`;
                const { requestHeaders, impersonation, browser_name, os } = generateRequestHeaders();

                console.log('[Sending Request to AI]: ');
                try {
                    // putting it for 5 times loop
                    for (let i = 0; i < 5; i++) {
                        try {
                            // 1. Fetch challenge first from the status endpoint
                            const statusHeaders = { ...requestHeaders };

                            const statusResponse = await fetch('https://duck.ai/duckchat/v1/status', {
                                method: 'GET',
                                headers: {
                                    ...statusHeaders,
                                    'x-vqd-accept': '1'
                                }
                            });

                            if (!statusResponse.ok) {
                                throw new Error(`Failed to fetch status token: ${statusResponse.status}`);
                            }

                            const challengeBase64 = statusResponse.headers.get('x-vqd-hash-1');
                            if (!challengeBase64) {
                                throw new Error('x-vqd-hash-1 challenge header not found in status response');
                            }

                            // 2. Solve challenge
                            const startTime = Date.now();
                            const solution = await solveChallenge(challengeBase64, requestHeaders['User-Agent']);
                            const duration = Date.now() - startTime;

                            solution.meta.origin = "https://duck.ai";
                            solution.meta.stack = "Error\n    at l (https://duck.ai/dist/duckai-dist/entry.duckai.a3d90ba917238b581069.js:2:1543217)\n    at async https://duck.ai/dist/duckai-dist/entry.duckai.a3d90ba917238b581069.js:2:1381180";
                            solution.meta.duration = String(duration);

                            solution.client_hashes = solution.client_hashes.map(h =>
                                crypto.createHash('sha256').update(h).digest('base64')
                            );

                            const solutionBase64 = Buffer.from(JSON.stringify(solution)).toString('base64');
                            const journeyId = crypto.randomBytes(16).toString('hex');

                            const chatHeaders = {
                                ...requestHeaders,
                                'x-vqd-hash-1': solutionBase64,
                                'x-ddg-journey-id': journeyId
                            };

                            const { publicKey } = crypto.generateKeyPairSync('rsa', {
                                modulusLength: 2048
                            });
                            const jwk = publicKey.export({ format: 'jwk' });

                            const payload = {
                                model: 'mistral-small-2603',
                                metadata: {
                                    toolChoice: {
                                        NewsSearch: false,
                                        VideosSearch: false,
                                        LocalSearch: false,
                                        WeatherForecast: false
                                    }
                                },
                                messages: [
                                    {
                                        role: "user",
                                        content: `${prompt} Thread Title: ${thread.name || ''}\nContent: ${body ? body.content : ''}`
                                    }
                                ],
                                canUseTools: true,
                                canUseApproxLocation: null,
                                canDelegateImageGeneration: null,
                                durableStream: {
                                    messageId: crypto.randomUUID(),
                                    conversationId: crypto.randomUUID(),
                                    publicKey: {
                                        alg: "RSA-OAEP-256",
                                        e: "AQAB",
                                        ext: true,
                                        key_ops: ["encrypt"],
                                        kty: "RSA",
                                        n: jwk.n,
                                        use: "enc"
                                    }
                                }
                            };

                            const response = await fetch('https://duck.ai/duckchat/v1/chat',
                                {
                                    method: 'POST',
                                    headers: chatHeaders,
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (!response.ok) {
                                console.error(chalk.red(response));
                                throw new Error(`HTTP Error! Status: ${response.status}`);
                            }

                            const responseText = await response.text();
                            const parsedText = parseSSEResponse(responseText);
                            if (parsedText) {
                                return parsedText;
                            }

                            throw new Error("Empty response or unable to parse SSE response.");

                        } catch (err) {
                            if (i === 4) {
                                throw err; // throw on last attempt
                            }
                            console.log(`Attempt ${i + 1} failed, retrying in 2 seconds...`);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }

                } catch (error) {
                    console.error(chalk.red('[Error in AI Analysis Request]: There was error in request_aiToAnalyze: '));
                    console.error(chalk.red(error));
                    throw error;
                }
            }

            // check if the thread body matches the keywords to avoid rate limiting

            // const saved_job = db.addJob(thread.authorId, thread.guildId, thread.channelId, thread.name, thread.url, false, false, "");
            if (config.Keywords.some((keyword) => body.content.toLowerCase().includes(keyword))) {

                // console.log(chalk.yellow(`[Match] Keyword found: "${keyword}" in thread "${threadName}"`));

                // ask the ai about the response
                let analyze = "";
                try {
                    analyze = await request_aiToAnalyze();
                    console.log(chalk.cyan(`[AI Success] Generated Pitch for "${threadName}":\n${analyze}`));

                    /// update the record instance with the AI generated pitch and set the accounted to true
                    // db.updateJob(result.lastInsertRowid, 'accounted', 1);
                    // db.updateJob(result.lastInsertRowid, 'reply_message', analyze);
                } catch (error) {
                    console.error(chalk.red(`[AI Error] Failed to generate pitch for "${threadName}":`), error);
                }

                // send the dynamic AI pitch message in the thread
                if (analyze) {
                    setTimeout(async () => {
                        try {
                            await thread.send(analyze);
                            console.log(chalk.green(`[Discord Success] Sent AI pitch to thread: "${thread.name}"`));
                        } catch (error) {
                            console.error(chalk.red(`[Discord Error] Failed to send AI pitch to thread "${threadName}":`), error);
                        }
                    }, 2500);
                }

                // insert it into the db
                const result = db.addJob(thread.authorId, thread.guildId, thread.channelId, thread.name, thread.url, true, true, analyze);
                console.log(chalk.gray(`[Accounted] New thread "${threadName}" added to the database`));
                console.log(chalk.magenta(`[DB Insert] Row Number: ${result.lastInsertRowid}`));

                // send the message to the reporting server with the threadID and the owner
                try {
                    const reportingServer = await servers.get(config.reportingServerID);
                    const reportingChannel = await reportingServer.channels.fetch(config.reportingServerChannelID);
                    const putContentToLimit = body.content.slice(0, 1800);
                    await reportingChannel.send(`New thread created: ${thread}\nCreated By: ${thread.ownerId} \nContent: ${putContentToLimit}`);
                    console.log(chalk.green(`[Reporting Success] Sent thread creation notification for "${threadName}"`));

                } catch (error) {
                    console.error(chalk.red(`[Reporting Error] Failed to send report for "${threadName}":`), error);
                    // insert it into the db
                    // db.addJob(thread.authorId, thread.guildId, thread.channelId, thread.name, thread.url, true, false, "");
                }

            } else {
                const result = db.addJob(thread.authorId, thread.guildId, thread.channelId, thread.name, thread.url, false, false, "");
                console.log(chalk.gray(`[Skip] No keywords matched for thread: "${threadName}"`));
                console.log(chalk.magenta(`[DB Insert] Row Number: ${result.lastInsertRowid}`));

                // send to the not-accounted-for channel
                try {
                    const reportingServer = await servers.get(config.reportingServerID);
                    const notAccountedPostsChannel = await reportingServer.channels.fetch(config['notAccountedPostsChannel']);
                    const putContentToLimit = body.content.slice(0, 1800);
                    await notAccountedPostsChannel.send(`New thread created: ${thread}\nCreated By: ${thread.ownerId} \nContent: ${putContentToLimit}`);
                    console.log(chalk.green(`[Filtered Out Post]: No message was sent to thread: "${threadName}"`));

                } catch (error) {
                    console.error(chalk.red(`[Filtered Out Post] Failed to send report for "${threadName}":`), error);
                }
            }
        } catch (error) {
            console.error(chalk.red(`[Thread Handler Error] Exception in threadCreate handler for "${thread.name}":`), error);
        }
    } else {
        return;
    }
});


// login into discord
client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`);

    // check the servers for each and every server the user should be in that server
    servers = client.guilds.cache;

    // make sure the cache servers and the config servers are matching with each others.
    servers.forEach(server => {
        if (config.Servers.some(data => data.ServerID === server.id)) {
            console.log(`User is present in the server with id: ${server.id}\nServerName: ${server.name}`);
        } else {
            console.log(`User is not present in the server with \nServer ID: ${server.id}\nServerName: ${server.name}`);
        }
    });

});

client.login(config.token);
