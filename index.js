import { Client } from 'discord.js-selfbot-v13';
import config from './config.json' with { type: 'json' };

const client = new Client();

// on the event of new threads beings generated in the servers
client.on('threadCreate', async (thread) => {
    // console.log(`New thread created: ${thread}`);
    // the client returns this tag as as the thread rather than the object to work on.
    // Example: New thread created: <#1520779790628687972>

    // we confirm that we want to work in this server first.
    if (config.Servers.some(data => data.ServerID === thread.guild.id)) {


        // get the starter message
        const threadName = thread.name;
        const body = await thread.fetchStarterMessage();
        console.log('\nThread Name: ', threadName, '\nBody: ', body);


        // check if the thread body has matched the keywords
        for (let keyword in config.Keywords) {
            if (body.content.toLowerCase().includes(keyword.toLowerCase())) {
                console.log(`Keyword found: ${keyword}`);

                // send a message in the thread
                setTimeout(async () => await thread.send(`I'm interested in this job. You can contact me at ${config.email} or message me on <@${config.discordId}>`), 2500);
                break;
            }
        }

    }
    // // check if the server is in the config
    // if (config.Servers.some(data => data.ServerID === thread.guild.id && data.ChannelID === thread.channel.id)) {
    //     // check if the keywords are in the thread name
    //     if (config.Servers.some(data => data.Keywords.some(keyword => thread.name.toLowerCase().includes(keyword.toLowerCase())))) {
    //         console.log(`New thread created: ${thread.name}`);
    //         // here you can perform other actions like sending a message to the thread
    //         // you can also get the channel of the thread using thread.channel
    //         // and the guild of the thread using thread.guild
    //         // and the parent of the thread using thread.parent
    //         // and the thread name using thread.name
    //         // and the thread id using thread.id
    //         // and the thread type using thread.type
    //         // and the thread owner using thread.owner
    //         // and the thread owner id using thread.ownerId
    //         // and the thread member count using thread.memberCount
    //         // and the thread member count using thread.memberCount
    //         // and the thread member count using thread.memberCount
    //         // and the thread member count using thread.memberCount
    //     }
    // }

});


// login into discord
client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`);

    // check the servers for each and every server the user should be in that server
    const servers = client.guilds.cache;

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
