import HozolClient from '../../lib/HozolClient';
import { GuildMember, Message, MessageEmbed, Role } from 'discord.js';

import { Command } from 'nukejs';
import { usernameResolver } from './../../helper/resolvers/usernameResolver';
import { primaryColor } from '../../settings';
import { User } from 'discord.js';

module.exports = class extends Command {
    /**
     * @param {any} file
     */
    constructor(file: any) {
        super(file, {
            name: 'userinfo',
            category: 'Information',
            runIn: ['text'],
            aliases: ['ui', 'whois', 'user'],
            botPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'See information on a Guild Member.',
            enabled: true,
            extendedHelp: "See infomration about a Guild Member's Join/Leave Date, Avatar, Roles, Connected Networks.",
            usage: '[Username|Mention|ID]',
        });
    }

    /**
     * @param {Message} message
     * @param {string[]} args
     * @param {HozolClient} client
     */
    async run(message: Message, args: string[], client: HozolClient) {
        await message.delete();
        let user;
        const allowedPerms: any[] = [];
        const disallowedPerms: any[] = [];
        if (args[0]) {
            await usernameResolver(message, args[0]).then((resolved: User) => {
                user = resolved;
            });
        }
        const target =
            // @ts-ignore
            <GuildMember>message.guild.members.cache.get(user?.id) || message.member;
        let rolemap: any[] | any = target?.roles.cache
            .sort((a: Role, b: Role) => b.position - a.position)
            .map((r) => r)
            .join(' ');
        if (rolemap.length > 1024) {
            rolemap = 'This User has Too Many Roles to be display.';
        }
        if (!rolemap) rolemap = 'No roles';
        if (target) {
            const joinDate = await target.joinedAt;
            const createdDate = await target.user.createdAt;
            const embed = new MessageEmbed()
                .setAuthor(
                    `User Information - ${target.user.username}`,
                    target.user.displayAvatarURL({ dynamic: true })
                )
                .addField(
                    'Joined At',
                    `${client.moment(joinDate).format('LLLL')} (${client.moment(joinDate).fromNow()})`
                )
                .addField(
                    'Registered At:',
                    `${client.moment(createdDate).format('LLLL')} (${client.moment(createdDate).fromNow()})`
                )
                .addField('User ID', target.id)
                .addField('Roles', rolemap)
                .setThumbnail(target.user.avatarURL({ dynamic: true }) || target.user.defaultAvatarURL)
                .setColor(colors(target.id))
                .setTimestamp()
                .setFooter(`Requester ID: ${message.author.id}`);
            const allPermissions: any[] = [
                'CREATE_INSTANT_INVITE',
                'KICK_MEMBERS',
                'BAN_MEMBERS',
                'ADMINISTRATOR',
                'MANAGE_CHANNELS',
                'MANAGE_GUILD',
                'ADD_REACTIONS',
                'VIEW_AUDIT_LOG',
                'PRIORITY_SPEAKER',
                'STREAM',
                'VIEW_CHANNEL',
                'SEND_MESSAGES',
                'SEND_TTS_MESSAGES',
                'MANAGE_MESSAGES',
                'EMBED_LINKS',
                'ATTACH_FILES',
                'READ_MESSAGE_HISTORY',
                'MENTION_EVERYONE',
                'USE_EXTERNAL_EMOJIS',
                'VIEW_GUILD_INSIGHTS',
                'CONNECT',
                'SPEAK',
                'MUTE_MEMBERS',
                'DEAFEN_MEMBERS',
                'MOVE_MEMBERS',
                'USE_VAD',
                'CHANGE_NICKNAME',
                'MANAGE_NICKNAMES',
                'MANAGE_ROLES',
                'MANAGE_WEBHOOKS',
                'MANAGE_EMOJIS',
            ];
            const perms = target.permissions.toArray();
            perms.forEach((perm) => {
                allowedPerms.push(allPermissions.splice(allPermissions.indexOf(perm), 1));
            });
            disallowedPerms.push(...allPermissions);

            embed.addField(
                'Allowed Permissions',
                `${allowedPerms.length > 0 ? `✅ \`${allowedPerms.join('`, `')}\`` : 'No Allowed Permission'}`
            );
            embed.addField(
                'Disallowed Permissions',
                `${disallowedPerms.length > 0 ? `❌ \`${disallowedPerms.join('`, `')}\`` : 'No Disallowed Permission'}`
            );
            await message.channel.send(embed);
        }
    }
};

function colors(memberID: string) {
    switch (memberID) {
        case '679145795714416661':
            return '#7c3fff';
        default:
            return primaryColor;
    }
}
