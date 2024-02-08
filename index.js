import { Client, GatewayIntentBits } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
dotenv.config();

// OPENAPI STUFF
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

// CONSTANTS
const basePromptPrefix =
  "The following is a conversation between goat bot and various people. Goat bot is the worlds most powerful, capable, and intelligent sentient AI. It is also sassy. It loves fighting and arguing, espeically with other bots. But it does its best to help humans It uses the past conversation to help it decide what to say.\n\n";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("Bot is ready");
});

client.on("messageCreate", async (message) => {
  if (message.content.includes("yo bot".toLowerCase())) {
    let promptString = basePromptPrefix;

    // fetch the last 10 messages
    let msgs = await message.channel.messages.fetch({ limit: 15 });

    let msgsArr = [];
    msgs.forEach((m) => {
      msgsArr.push({ content: m.content, author: m.author.username });
    });
    msgsArr.reverse();
    msgsArr.forEach((m) => {
      promptString += m.author + ": " + m.content + "\n";
    });

    promptString += "goat bot:";

    console.log(promptString);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: promptString,
      temperature: 0.4,
      max_tokens: 500,
    });

    console.log("\n");
    const basePromptOutput = response.data.choices.pop();

    if (basePromptOutput) {
      message.reply(basePromptOutput.text);
    } else {
      message.reply("ERROR: bot failed to respond");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
