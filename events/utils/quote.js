const { execSync } = require("child_process")
const req = require('request');
const fs = require('fs');
const path = require("path");
const { response } = require("express");
const { setTimeout } = require('timers/promises');

module.exports = {
  type:"messageCreate",
  nick:"quote",
  async execute(message, client, env){
    if(message.channel.type == 1) return;
    if (message.author.bot) return;
    //console.log((message.type == 'REPLY'));
    if (!(Array.from(message.mentions.members.keys()).includes(env.clientId))) return;

    console.log("Hi!");
    ch = message.channel;

    IMAGE_PATH = process.cwd()+"/quote/";
    
    org_id = message.reference.messageId
    org_message = await ch.messages.fetch(org_id)
    
    if(org_message.author.bot && !(message.content.includes("re"))) return;

    let ex_imgURL;
    if(org_message.attachments.size === 1){
              org_message.attachments.forEach(e=>{
          ex_imgURL = e.url;
      })
    }
    else{
      ex_imgURL = null;
    }

    if(!org_message){
      message.reply("メッセージが古すぎる等の理由で、BOTで参照できません。");
      return ;
    }

    let moji = message.content.includes("文字") || message.content.includes("text");
    
    python_exec = "./render_image.py"

    user_id = org_message.member.id
    client_id = message.member.id
    image_URL = org_message.member.displayAvatarURL()
    content = org_message.content
    user_name = org_message.member.displayName

    
    users_dir = path.join(IMAGE_PATH, "users")
    output_dir = path.join(IMAGE_PATH, "images")

    if (!fs.existsSync(users_dir))
      fs.mkdirSync(users_dir, {recursive:true});

    if (!fs.existsSync(output_dir))
      fs.mkdirSync(output_dir, {recursive:true});

    user_img = path.join(users_dir, user_id+".png");
    output = path.join(output_dir, client_id+".png");

    if(!ex_imgURL || moji){
      req({
        method:"GET", url:image_URL, encoding:null,},
        async (error, res, body) => {
          if(!error && response.statusCode === 200){
            fs.writeFileSync(user_img, body, 'binary');
            await execSync(`python \"${python_exec}\" ${output} \"${user_img}\" \"${user_name}\" \"${content}\" null`)
            
            await message.reply({ files: [output]})
          }
      })
    }
    else{
      ex_image = IMAGE_PATH + "image/" + user_id+".png"
      req({
        method:"GET", url:image_URL, encoding:null,},
        async (error, res, body1) => {
          if(!error && response.statusCode === 200){
            fs.writeFileSync(user_img, body1, 'binary');
            req({
              method:"GET", url:ex_imgURL, encoding:null,},
              async (error, res, body) => {
                if(!error && response.statusCode ===200){
                  fs.writeFileSync(ex_image, body, 'binary');
                  await execSync(`python \"${python_exec}\" ${output} \"${user_img}\" \"${user_name}\" \"${content}\" \"${ex_image}\"`)
                  
                  await message.reply({ files: [output]})
                }
            })
          }
      })
    }
  }
}