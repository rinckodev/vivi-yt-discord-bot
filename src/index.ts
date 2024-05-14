import { createClient } from "#base"; 
import { Player } from "discord-player";
import "./tools/index.js";

const client = createClient({
    commands: {
        guilds: ["1055933117522776064"]
    }
});
client.start();

const player = new Player(client as never);
player.extractors.loadDefault();