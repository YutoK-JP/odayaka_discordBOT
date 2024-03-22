module.exports={
    name:'messageCreate',
    nick:'denger',
    once:false,

    execute(message, client, env){
        //botの場合、省略
        if(message.channel.type == "DM") return;
        if (message.author.bot || !(message.guild.id == env.log_guild)) return;
        //if(message.author.bot) return

        let words = env.WORDS
        let msg = message.content.toLowerCase();
        let count=0;
        //console.log(words);
        words.forEach(function(w){
            
            if(msg.includes(w)){
                count++;
            }
        });
        //console.log(count);
        if(count>2){
            message.delete();
            //console.log(client.users.cache.get(env.JYAPPER))
            client.users.cache.get(env.JYAPPER).send({embeds: 
                [{
                    title: "Denger message inform",
                    color: 0x6a5acd,
                    fields:[
                        {
                            name: "Author",
                            value: message.author.username
                        },
                        {
                            name: "Message",
                            value: message.content
                        },
                        {
                            name: "Guild",
                            value: message.channel.guild.name
                        },
                        {
                            name: "Channel",
                            value: message.channel.name
                        }
                    ]
                }]
            });
            return
        }
        if(msg.includes("http")){
            const fs = require('fs');

            let text = fs.readFileSync("./conf/scam-urls.txt");
            let ext = fs.readFileSync("./conf/exception-urls.txt");
            let lines = text.toString().split("\n");
            let elines = ext.toString().split("\n");
            lines.forEach(
                url => {
                    if(msg.includes("https://"+url) || msg.includes("http://"+url)){
                        for(let i=0; i<elines.length; i++){
                            if(msg.includes(elines[i])) return;
                        }
                        message.delete();
                        client.users.cache.get(env.JYAPPER).send({embeds: 
                            [{
                                title: "Denger message inform",
                                color: 0x6a5acd,
                                fields:[
                                    {
                                        name: "Author",
                                        value: message.author.username
                                    },
                                    {
                                        name: "Message",
                                        value: message.content
                                    },
                                    {
                                        name: "Guild",
                                        value: message.channel.guild.name
                                    },
                                    {
                                        name: "Channel",
                                        value: message.channel.name
                                    }
                                ]
                            }]
                        });

                        return
                    }
                }
            )
        }
    }
}