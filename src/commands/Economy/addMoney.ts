import HozolClient from '../../lib/HozolClient';
import { Message, MessageEmbed } from 'discord.js';
import { Command } from 'nukejs';
import { primaryColor } from '../../settings';
import { usernameResolver } from '../../helper';

module.exports = class extends Command {
    /**
     * @param {any} file
     */
    constructor(file: any) {
        super(file, {
            name: 'addmoney',
            category: 'Economy',
            runIn: ['text'],
            aliases: ['addcoins'],
            userPerms: ['MANAGE_ROLES'],
            description: "Add money to the User's Wallet.",
            enabled: true,
            extendedHelp: "Add money to the User's Wallet.",
            usage: '',
        });
    }

    /**
     * @param {Message} message
     * @param {string[]} args
     * @param {HozolClient} client
     */
    async run(message: Message, args: string[], client: HozolClient) {
        if (!message.guild) return;
        await message.delete();
        if (!args)
            throw new Error(
                'You must provide a user you would like to add money to and the amount of money you would like to add'
            );
        const guildSettings = await message.guild.settings();
        const target = await message.guild?.members.cache.get((await usernameResolver(message, args[0])).id);
        if (!target) throw new Error('There was a problem getting the target specified');
        const moneyAdding = parseInt(args[1]);
        if (moneyAdding > 0 && !isNaN(moneyAdding)) {
            if (await target.addMoney(moneyAdding)) {
                const targetProfile = await target?.profile();
                const embed = new MessageEmbed()
                    .setTitle(`Added Money to ${target.user.username}'s Wallet`)
                    .addField('Money Added', `${guildSettings.currency}${moneyAdding}`)
                    .addField('Wallet Balance', `${guildSettings.currency}${targetProfile.coins}`)
                    .setColor(primaryColor)
                    .setTimestamp()
                    .setFooter(`User ID ${message.author.username}`);
                message.channel.send(embed);
            } else {
                throw new Error('There was an issue adding money to that user');
            }
        } else {
            throw new Error(`Please make sure the money you're adding is greater than 1 and is a number`);
        }
    }
};
