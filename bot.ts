import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { WebSocketShardEvents } from '@discordjs/ws';
import chalk from 'chalk';
import Table from 'cli-table3';
import figlet from 'figlet';
import { ClientQuest } from './src/client';
import { Quest } from './src/quest';

function parseTokens(raw: string | undefined): string[] {
	if (!raw) return [];
	// Allow comma, newline, or whitespace separated tokens
	return raw
		.split(/[\s,]+/g)
		.map((t) => t.trim())
		.filter(Boolean);
}

const TOKENS = parseTokens(process.env.TOKEN);
if (TOKENS.length === 0) {
	console.error(
		chalk.red(
			'Missing TOKEN env var. Provide one or multiple tokens separated by comma/newline.',
		),
	);
	process.exit(1);
}

const QUEST_DB: Record<string, { name: string; duration: number }> = {
	'1432436088508780675': { name: 'R.E.P.O. Monster', duration: 900 },
	'1436125144404725770': { name: 'Download Comet Browser', duration: 900 },
	'1439764528715010058': { name: 'New Season Ahsarah', duration: 900 },
	'1440059727005614090': { name: 'Opera GX', duration: 42 },
	'1418350811687419914': { name: 'The Power of Nitro', duration: 24 },
	'1425677992721514516': { name: 'Battlefield 6 Launch', duration: 900 },
	'1432424574561026070': { name: 'Dance with a Demon', duration: 900 },
	'1435391191834165398': { name: 'ABI Red Drops Fest', duration: 900 },
	'1437518140476100638': { name: 'Marvel Rivals S5.0', duration: 900 },
	'1431027486506094623': { name: 'Amazon Luna', duration: 29 },
	'1428083229587669155': { name: 'Bloons TD 6 Dart Monkey', duration: 900 },
	'1428459919212019874': { name: 'Crimson Desert', duration: 29 },
	'1435016951251603496': { name: 'Courtroom Chaos', duration: 75 },
	'1421275302923079721': { name: 'Space Marine 2 Free Demo', duration: 900 },
	'1435012985872715946': { name: 'Anno 117', duration: 158 },
	'1432205768106705070': { name: 'Battlefield REDSEC', duration: 900 },
	'1435367355759726642': { name: 'King of Meat Sale', duration: 29 },
	'1436481141711442101': { name: 'Where Winds Meet Launch', duration: 900 },
	'1430279721777762495': { name: 'PvZ Replanted', duration: 900 },
	'1432798014786764871': { name: 'Honkai: Star Rail', duration: 900 },
	'1410358070831480904': { name: 'Mobile Orbs Intro', duration: 31 },
	'1428139680477614150': { name: 'ARC Raiders', duration: 91 },
	'1432410015721062480': { name: 'ARC Raiders', duration: 900 },
	'1427820398283722833': { name: 'Painkiller', duration: 99 },
	'1427811805065121875': {
		name: 'Battlefield 6 on PS5 Video',
		duration: 29,
	},
	'1435777559475257428': { name: 'Amazon', duration: 29 },
	'1422714633357103315': { name: 'Monopoly at McD\u2019s', duration: 96 },
	'1435324548827451605': { name: 'GO Wild Area 2025', duration: 29 },
	'1437537235133005914': {
		name: 'Call of Duty: Black Ops 7',
		duration: 900,
	},
	'1438202046804136028': {
		name: 'Microsoft Edge - Your AI Browser',
		duration: 29,
	},
	'1428092429030129755': {
		name: 'Chainsaw Man \u2013 The Movie: Reze Arc',
		duration: 61,
	},
	'1434969640194539610': { name: 'Dinkum on Switch', duration: 89 },
	'1438642430571315290': {
		name: 'Alloyed Collective Gupdoption',
		duration: 900,
	},
	'1433219183411462265': { name: 'Palworld Collab', duration: 900 },
	'1435003145339273317': { name: 'The Running Man', duration: 148 },
	'1433542422268350574': { name: 'Firefox', duration: 19 },
	'1430258734113755247': { name: 'Jurassic World Rebirth', duration: 29 },
	'1432770475590684784': { name: 'Fortnite Discord', duration: 900 },
	'1438303745166409840': { name: 'EVE Online Video', duration: 89 },
	'1425291943302398073': { name: 'Discord Halloween 2025', duration: 22 },
	'1427829905323724922': { name: 'Bugonia', duration: 114 },
};

type ActiveQuestStatus = 'Running' | 'Done';

type ActiveQuest = {
	id: string;
	name: string;
	reward: string;
	remaining: number;
	status: ActiveQuestStatus;
};

type UserInfo = {
	username: string;
	id: string;
};

type AccountState = {
	tokenIndex: number;
	client: ClientQuest;
	user: UserInfo | null;
	activeQuests: ActiveQuest[];
	intervalId: NodeJS.Timeout | null;
	status: 'Connecting' | 'Running' | 'Finished' | 'Error';
	error?: string;
};

const accounts: AccountState[] = TOKENS.map((token, idx) => ({
	tokenIndex: idx,
	client: new ClientQuest(token),
	user: null,
	activeQuests: [],
	intervalId: null,
	status: 'Connecting',
}));

function formatTime(seconds: number): string {
	if (seconds <= 0) return chalk.bold.green('\u2714 DONE');

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
}

function getQuestData(quest: Quest): {
	name: string;
	duration: number;
	reward: string;
} {
	const questId = quest.id || quest.config?.id || 'unknown';
	let name = questId;
	let duration = 900;
	let reward = 'Unknown';

	if (QUEST_DB[questId]) {
		name = QUEST_DB[questId].name;
		duration = QUEST_DB[questId].duration;
	} else if (quest.config?.messages?.quest_name) {
		name = quest.config.messages.quest_name.trim();
	} else {
		name = questId.toString().replace(/_/g, ' ').replace(/-/g, ' ');
	}

	const tasks = quest.config?.task_config?.tasks;
	if (tasks) {
		const firstTaskKey = Object.keys(tasks)[0] as keyof typeof tasks;
		if (tasks[firstTaskKey]?.target) {
			duration = tasks[firstTaskKey].target;
		}
	}

	const rewards = quest.config?.rewards_config?.rewards;
	if (rewards && rewards.length > 0) {
		if (rewards[0].messages?.name) {
			reward = rewards[0].messages.name;
		} else if (rewards[0].orb_quantity) {
			reward = `${rewards[0].orb_quantity} Orbs`;
		}
	}

	return { name, duration, reward };
}

function renderScreen() {
	console.clear();
	console.log(
		chalk.cyan(
			figlet.textSync('Auto Quest lfathh', {
				font: 'Slant',
			}),
		),
	);
	console.log(
		chalk.bold.green(
			`\n\u2705  SYSTEM RUNNING... (${accounts.length} account${
				accounts.length === 1 ? '' : 's'
			})`,
		),
	);

	accounts.forEach((acc, accIndex) => {
		const header = `ACCOUNT #${accIndex + 1} \u2022 ${acc.status}`;
		console.log(chalk.bold.white(`\n${'-'.repeat(header.length)}`));
		console.log(chalk.bold.white(header));
		console.log(chalk.bold.white(`${'-'.repeat(header.length)}`));

		if (acc.status === 'Error') {
			console.log(chalk.red(acc.error ?? 'Unknown error'));
			return;
		}

		const userTable = new Table({
			head: [chalk.white('User Account'), chalk.white('User ID')],
			colWidths: [30, 25],
			style: {
				border: ['white'],
				'padding-left': 1,
				'padding-right': 1,
			},
		});
		userTable.push([
			chalk.yellow(acc.user?.username ?? '...'),
			chalk.cyan(acc.user?.id ?? '...'),
		]);
		console.log(userTable.toString());

		const questTable = new Table({
			head: [
				chalk.white('No'),
				chalk.white('Quest Name'),
				chalk.white('Reward'),
				chalk.white('Time Left'),
				chalk.white('Status'),
			],
			colWidths: [6, 35, 20, 15, 15],
			colAligns: ['center', 'left', 'center', 'center', 'center'],
			style: {
				border: ['white'],
			},
		});

		acc.activeQuests.forEach((quest, index) => {
			let timerColor = chalk.yellow;
			if (quest.remaining < 60 && quest.remaining > 0) {
				timerColor = chalk.red;
			}

			questTable.push([
				index + 1,
				chalk.cyan(quest.name),
				chalk.magenta(quest.reward),
				timerColor(formatTime(quest.remaining)),
				quest.status === 'Running'
					? chalk.blue('\u25b6 Running')
					: chalk.green('\u2714 Done'),
			]);
		});

		console.log(chalk.bold.white('\n\u{1F4CB}  LIVE PROGRESS'));
		console.log(questTable.toString());
	});

	console.log(chalk.gray('\n>> Press Ctrl+C to stop.'));
}

async function runAccount(acc: AccountState): Promise<void> {
	try {
		acc.client.websocketManager.on(
			WebSocketShardEvents.Closed,
			({ code }: { code: number }) => {
				if (acc.status === 'Connecting') {
					acc.status = 'Error';
					acc.error = `Gateway closed during connect (code ${code}).`;
					renderScreen();
				}
			},
		);
		acc.client.websocketManager.on(
			WebSocketShardEvents.Error,
			({ error }: { error: Error }) => {
				if (acc.status === 'Connecting') {
					acc.status = 'Error';
					acc.error = `Gateway error during connect: ${error.message}`;
					renderScreen();
				}
			},
		);

		acc.client.once(
			GatewayDispatchEvents.Ready,
			async ({ data }: { data: { user: UserInfo } }) => {
				acc.user = data.user;
				console.log(
					chalk.cyan(
						`[Account #${acc.tokenIndex + 1}] Fetching quests...`,
					),
				);
				await acc.client.fetchQuests();

				const manager = acc.client.questManager;
				const validQuests = manager?.filterQuestsValid() ?? [];

				if (validQuests.length === 0) {
					acc.status = 'Finished';
					acc.activeQuests = [];
					renderScreen();
					return;
				}

				acc.status = 'Running';
				acc.activeQuests = validQuests.map((quest) => {
					const details = getQuestData(quest);
					return {
						id: quest.id,
						name: details.name,
						reward: details.reward,
						remaining: details.duration,
						status: 'Running',
					};
				});

				acc.intervalId = setInterval(() => {
					acc.activeQuests.forEach((quest) => {
						if (quest.remaining > 0) quest.remaining--;
						else quest.status = 'Done';
					});
					renderScreen();
				}, 1000);

				renderScreen();

				await Promise.allSettled(
					validQuests.map((quest) => manager!.doingQuest(quest)),
				);

				if (acc.intervalId) clearInterval(acc.intervalId);
				acc.intervalId = null;
				acc.status = 'Finished';
				renderScreen();
			},
		);

		await acc.client.connect();
	} catch (e: any) {
		if (acc.intervalId) clearInterval(acc.intervalId);
		acc.intervalId = null;
		acc.status = 'Error';
		acc.error = e?.message ?? String(e);
		renderScreen();
	}
}

renderScreen();
Promise.all(accounts.map((acc) => runAccount(acc))).catch(() => {
	// errors are handled per-account
});
