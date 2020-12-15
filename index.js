const Discord = require('discord.js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const client = new Discord.Client();
dotenv.config();

const keyITAD = process.env.ITAD_TOKEN;
const keyClientDiscord = process.env.BOT_TOKEN
let gameTitle;
let urlITAD;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
  if (msg.content.startsWith('!help')) 
  {
    msg.reply("Utilise la commande !deals pour rechercher des bons deals, teste !deals Spyro") 
  }

  if (msg.content.startsWith('!deals')) 
  {
    const gameRequested = msg.content.replace('!deals ','');

    if(gameRequested !== "!deals")
    {
      const prices = await getPrices(gameRequested);
  
      if(prices)
      {
        msg.reply(createMessageEmbed(prices));
      }
      else
      {
        msg.reply(`Pas de deals trouvés pour la recherche ${gameRequested}`);
      }
    }
    else
    {
      msg.reply('Renseigne un nom de jeu bg')
    }
  }
});


async function getPrices(query) 
{
  const plainGame = await getPlain(query);
  console.log(plainGame);
  return fetch(`https://api.isthereanydeal.com/v01/game/prices/?key=${keyITAD}&plains=${plainGame}`)
  .then(res => res.json())
  .then(json => 
  {
    console.log(json.data)
    if(json.data[plainGame].list.length > 0)
    {
      urlITAD = json.data[plainGame].urls.game;
      return json.data[plainGame].list;
    }
    else
    {
      throw new Error("No results");
    }
  })
  .catch(error => null);
}

async function getPlain(query)
{
  return fetch(`https://api.isthereanydeal.com/v02/search/search/?key=${keyITAD}&q=${query}&limit=1&strict=0`)
  .then(res => res.json())
  .then(json => 
  {
    console.log(json.data.results[0]);
    if(json.data.results.length > 0)
    {
      gameTitle = json.data.results[0].title;
      return json.data.results[0].plain;
    }
    else
    {
      throw new Error("No results");
    }
  })
  .catch(error => null);
}

function createMessageEmbed(listPrices)
{
  return pricesOfTheGame = new Discord.MessageEmbed()
  .setColor('#0099ff')
  .setTitle(`Les meilleurs deals pour ${gameTitle}`)
  .setThumbnail("https://styles.redditmedia.com/t5_2vt3j/styles/communityIcon_fucq9kylz0m21.jpg?width=256&s=ccc4d6f58f1633d0ed0d46e26852454ff4b762e9")
  .setDescription("Sah what a bot stylé")
  .setURL(urlITAD)
  .addFields(createFields(listPrices))
}

function createFields(listPrices)
{
  const titles = listPrices.map(x => x.shop.name);
  const newPrices = listPrices.map(x => x.price_new + "€");
  const oldPrices = listPrices.map(x => x.price_old + "€");
  const cuts = listPrices.map(x => x.price_cut + "%");

  const fields = [
    {
      name: 'Vendeur',
      value: titles.join('\n'),
      inline: true
    },
    {
      name: 'Nouveau prix',
      value: newPrices.join('\n'),
      inline: true
    },
    {
      name: 'Ancien prix',
      value: oldPrices.join('\n'),
      inline: true
    }
  ]

  return fields;
}

client.login(keyClientDiscord);