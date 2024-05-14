import { Command } from "#base";
import { createQueueMetada, icon, res } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { QueryType, SearchQueryType, useMainPlayer } from "discord-player";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

new Command({
    name: "música",
    description: "Comando de música",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "tocar",
            description: "Tocar uma música",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "busca",
                    description: "Nome da música ou url",
                    type: ApplicationCommandOptionType.String,
                    required
                },
                {
                    name: "engine",
                    description: "Engine de busca",
                    type: ApplicationCommandOptionType.String,
                    choices: Object.values(QueryType).map(type => ({
                        name: type, value: type
                    }))
                }
            ]
        }
    ],
    async run(interaction){
        const { options, member, guild, channel, client } = interaction;

        const voiceChannel = member.voice.channel;
        if (!voiceChannel){
            interaction.reply(res.danger(`${icon("danger")} Você precisa estar em um canal de voz para usar este comando!`));
            return;
        }
        if (!channel){
            interaction.reply(res.danger(`${icon("danger")} Não possível utilizar este comando neste canal de texto!`));
            return;
        }

        const metadata = createQueueMetada({ channel, client, guild, voiceChannel });
        const player = useMainPlayer();
        const queue = player.queues.cache.get(guild.id);

        await interaction.deferReply({ ephemeral });

        switch(options.getSubcommand(true)){
            case "tocar":{
                const query = options.getString("busca", true);
                const searchEngine = options.getString("engine") ?? QueryType.YOUTUBE;

                try {
                    const { track, searchResult } = await player.play(voiceChannel as never, query, {
                        searchEngine: searchEngine as SearchQueryType,
                        nodeOptions: { metadata }
                    });

                    const display: string[] = [];

                    if (searchResult.playlist){
                        const { tracks, title, url } = searchResult.playlist;
                        display.push(
                            `${icon("success")} Adicionadas ${tracks.length} da playlist [${title}](${url})`,
                            ...tracks.map(track => `${track.title}`).slice(0, 8),
                            "..."
                        );
                    } else {
                        display.push(`${icon("success")} ${queue?.size ? "Adicionado à fila" : "Tocando agora"} ${track.title}`);
                    }
                    interaction.editReply(res.success(brBuilder(display)));
                } catch(_){
                    interaction.editReply(res.danger(`${icon("danger")} Não foi possível tocar a música`));
                }
                return;
            }
        }
    }
});