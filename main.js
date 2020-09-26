const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require("./config.json")

var queue = new Map();
let songTitle = null;

const ytdl = require('ytdl-core');


client.on('ready', () => console.log("Já estou funcionando!"));



client.on('message', async (message) => {
    if(message.author.bot) return;
    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    try{
    if(command == "purpose"){
        const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#17BBDC')
	.setTitle('JukeBot')
	.setDescription('Meu propósito é tocar lives do Youtube. **Apenas isso ;u;**. Eu também toco músicas, mas ainda não aceito filas de reprodução.')
	.setThumbnail('https://i.imgur.com/PPr3sJm.png')
	.addFields(
		{ name: 'Prefixo', value: '*', inline: true },
		{ name: 'Comandos', value: 'play; stop; now; livelist; purpose', inline: true },
	)
	.setTimestamp()
	.setFooter('Obrigado por me ajudar a cumprir meu propósito ♥ ', 'https://i.imgur.com/PPr3sJm.png');

    message.channel.send(exampleEmbed);
    }}catch{
        return;
    }

    if(command == "play") {
        if(!args[0]) return;
        let url = args.join(" ");
        if(!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) return message.channel.send("Este bot apenas aceita links do Youtube!");

        let vc = message.member.voice;
        
        let songinfo = await ytdl.getInfo(url);
        let song = {
            title: songinfo.videoDetails.title,
            url: songinfo.videoDetails.video_url
            }
            songTitle = song.title;

            let queueConst = {
                textChannel: message.channel,
                voiceChannel: vc.channel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };

            queue.set(message.guild.id, queueConst);
            queueConst.songs.push(song);

            try {
                let connection = await vc.channel.join();
                queueConst.connection = connection
                playSong(message.guild, queueConst.songs[0])
            } catch (error) {
                console.log(error);
                queue.delete(message.guild.id);
                return message.channel.send("Erro: " + error);
            }

        }

    if(command == 'stop'){
        let vc = message.member.voice;
        vc.channel.leave()
        songTitle = null;
        message.reply("Não é um adeus, é apenas um até logo :arrows_counterclockwise:");
    }

    if(command == 'now'){
        if(songTitle == null) return message.channel.send('Não estou tocando nada agora :C');
        message.channel.send('Estou sintonizado em: **'+songTitle+'**! :headphones:');
    }

    if(command == 'livelist'){
        message.author.send("Heya! Aqui vai a lista de lives disponíveis para você assistir!")
    }


})

async function playSong(guild, song) {
    let serverQueue = queue.get(guild.id);

    if(!song){
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url)).on('end', () => {
        serverQueue.songs.shift();
        playSong(guild, serverQueue.songs[0]);
    })
    .on('error', () => {
        console.log(error)
    })

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(token)

if(client.user != null){
    client.user.setActivity('discord.js', { type: 'WATCHING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);

}
