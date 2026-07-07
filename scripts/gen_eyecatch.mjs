import { createRequire } from 'module';
import { mkdirSync } from 'fs';

const require = createRequire('C:/Users/kamik/Desktop/game-server-lab/package.json');
const sharp = require('sharp');

const OUT = 'C:/Users/kamik/Desktop/game-server-lab/src/assets/eyecatch';
mkdirSync(OUT, { recursive: true });

const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo',sans-serif";

// アイコン: 100x100 viewBox の stroke パス
const icons = {
	cube: (c) => `
		<path d="M50 18 L82 34 L82 66 L50 82 L18 66 L18 34 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
		<path d="M18 34 L50 50 L82 34" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round"/>
		<line x1="50" y1="50" x2="50" y2="82" stroke="${c}" stroke-width="5"/>`,
	server: (c) => `
		<rect x="24" y="24" width="52" height="21" rx="5" fill="none" stroke="${c}" stroke-width="6"/>
		<rect x="24" y="55" width="52" height="21" rx="5" fill="none" stroke="${c}" stroke-width="6"/>
		<circle cx="35" cy="34.5" r="3.5" fill="${c}"/>
		<circle cx="35" cy="65.5" r="3.5" fill="${c}"/>
		<line x1="55" y1="34.5" x2="68" y2="34.5" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
		<line x1="55" y1="65.5" x2="68" y2="65.5" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
	puzzle: (c) => `
		<path d="M30 34 h14 a8 8 0 1 1 12 0 h14 v14 a8 8 0 1 0 0 12 v14 h-14 a8 8 0 1 0 -12 0 h-14 v-14 a8 8 0 1 1 0 -12 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`,
	gamepad: (c) => `
		<path d="M32 34 h36 a18 18 0 0 1 18 18 c0 12 -7 22 -14 22 c-6 0 -9 -8 -14 -8 h-16 c-5 0 -8 8 -14 8 c-7 0 -14 -10 -14 -22 a18 18 0 0 1 18 -18 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
		<line x1="36" y1="46" x2="36" y2="60" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<line x1="29" y1="53" x2="43" y2="53" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<circle cx="66" cy="48" r="4" fill="${c}"/>
		<circle cx="74" cy="58" r="4" fill="${c}"/>`,
	shield: (c) => `
		<path d="M50 18 L78 28 L78 50 C78 68 66 78 50 84 C34 78 22 68 22 50 L22 28 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
		<polyline points="38,50 47,59 63,41" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
	star: (c) => `
		<path d="M50 18 L59 39 L82 41 L65 56 L70 79 L50 67 L30 79 L35 56 L18 41 L41 39 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`,
	bolt: (c) => `
		<path d="M56 16 L28 56 L46 56 L42 84 L72 42 L53 42 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`,
	phone: (c) => `
		<rect x="20" y="32" width="60" height="38" rx="8" fill="none" stroke="${c}" stroke-width="6"/>
		<line x1="34" y1="45" x2="34" y2="57" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<line x1="28" y1="51" x2="40" y2="51" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<circle cx="64" cy="46" r="3.5" fill="${c}"/>
		<circle cx="72" cy="56" r="3.5" fill="${c}"/>`,
	gear: (c) => `
		<circle cx="50" cy="50" r="13" fill="none" stroke="${c}" stroke-width="6"/>
		<g stroke="${c}" stroke-width="6" stroke-linecap="round">
			<line x1="50" y1="22" x2="50" y2="30"/><line x1="50" y1="70" x2="50" y2="78"/>
			<line x1="22" y1="50" x2="30" y2="50"/><line x1="70" y1="50" x2="78" y2="50"/>
			<line x1="30" y1="30" x2="36" y2="36"/><line x1="64" y1="64" x2="70" y2="70"/>
			<line x1="70" y1="30" x2="64" y2="36"/><line x1="36" y1="64" x2="30" y2="70"/>
		</g>`,
	clock: (c) => `
		<circle cx="50" cy="52" r="28" fill="none" stroke="${c}" stroke-width="6"/>
		<polyline points="50,36 50,52 62,60" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M30 22 L20 30" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<path d="M70 22 L80 30" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
	lock: (c) => `
		<rect x="28" y="44" width="44" height="36" rx="8" fill="none" stroke="${c}" stroke-width="6"/>
		<path d="M36 44 v-8 a14 14 0 0 1 28 0 v8" fill="none" stroke="${c}" stroke-width="6"/>
		<circle cx="50" cy="60" r="5" fill="${c}"/>
		<line x1="50" y1="64" x2="50" y2="71" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
	link: (c) => `
		<path d="M44 62 L58 40" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<path d="M40 40 h-6 a14 14 0 0 0 0 28 h12 a14 14 0 0 0 13 -18" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<path d="M60 62 h6 a14 14 0 0 0 0 -28 h-12 a14 14 0 0 0 -13 18" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
	anvil: (c) => `
		<path d="M22 40 h44 a0 0 0 0 1 0 0 c0 10 -10 14 -18 14 h-2 v8 h14 v8 h-38 v-8 h14 v-8 c-12 0 -18 -8 -18 -18 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
		<line x1="66" y1="40" x2="78" y2="34" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
};

const posts = [
	{ slug: 'minecraft-server-guide', bg: '#173404', mid: '#97C459', light: '#EAF3DE', chipB: '#3B6D11', chipT: '#C0DD97', cat: '入門', icon: 'cube', title: 'マイクラ鯖の立て方' },
	{ slug: 'game-vps-comparison', bg: '#042C53', mid: '#85B7EB', light: '#E6F1FB', chipB: '#185FA5', chipT: '#B5D4F4', cat: '比較', icon: 'server', title: 'ゲーム鯖VPS比較' },
	{ slug: 'minecraft-mod-server', bg: '#26215C', mid: '#AFA9EC', light: '#EEEDFE', chipB: '#534AB7', chipT: '#CECBF6', cat: 'Mod', icon: 'puzzle', title: 'Mod鯖をFabricで' },
	{ slug: 'palworld-server-guide', bg: '#412402', mid: '#EF9F27', light: '#FAEEDA', chipB: '#854F0B', chipT: '#FAC775', cat: '構築', icon: 'gamepad', title: 'Palworld専用鯖' },
	{ slug: 'multiplayer-without-port-forwarding', bg: '#501313', mid: '#F09595', light: '#FCEBEB', chipB: '#A32D2D', chipT: '#F7C1C1', cat: '安全', icon: 'shield', title: 'ポート開放不要マルチ' },
	{ slug: 'conoha-for-game-review', bg: '#04342C', mid: '#5DCAA5', light: '#E1F5EE', chipB: '#0F6E56', chipT: '#9FE1CB', cat: 'レビュー', icon: 'star', title: 'ConoHa for GAME解説' },
	{ slug: 'minecraft-server-lag-fix', bg: '#412402', mid: '#EF9F27', light: '#FAEEDA', chipB: '#854F0B', chipT: '#FAC775', cat: '高速化', icon: 'bolt', title: 'マイクラ鯖が重い時' },
	{ slug: 'minecraft-bedrock-server', bg: '#042C53', mid: '#85B7EB', light: '#E6F1FB', chipB: '#185FA5', chipT: '#B5D4F4', cat: '統合版', icon: 'phone', title: '統合版鯖の立て方' },
	{ slug: 'palworld-server-settings', bg: '#26215C', mid: '#AFA9EC', light: '#EEEDFE', chipB: '#534AB7', chipT: '#CECBF6', cat: '設定', icon: 'gear', title: 'Palworld設定全解説' },
	{ slug: 'minecraft-server-backup', bg: '#173404', mid: '#97C459', light: '#EAF3DE', chipB: '#3B6D11', chipT: '#C0DD97', cat: '運用', icon: 'clock', title: '自動バックアップ' },
	{ slug: 'valheim-server-guide', bg: '#04342C', mid: '#5DCAA5', light: '#E1F5EE', chipB: '#0F6E56', chipT: '#9FE1CB', cat: '構築', icon: 'gamepad', title: 'Valheim専用鯖' },
	{ slug: 'ark-server-guide', bg: '#501313', mid: '#F09595', light: '#FCEBEB', chipB: '#A32D2D', chipT: '#F7C1C1', cat: '構築', icon: 'gamepad', title: 'ARK専用鯖' },
	{ slug: 'minecraft-plugin-guide', bg: '#26215C', mid: '#AFA9EC', light: '#EEEDFE', chipB: '#534AB7', chipT: '#CECBF6', cat: 'プラグイン', icon: 'puzzle', title: 'プラグイン導入' },
	{ slug: 'minecraft-server-security', bg: '#042C53', mid: '#85B7EB', light: '#E6F1FB', chipB: '#185FA5', chipT: '#B5D4F4', cat: '防衛', icon: 'lock', title: '荒らし対策' },
	{ slug: 'minecraft-geyser-crossplay', bg: '#412402', mid: '#EF9F27', light: '#FAEEDA', chipB: '#854F0B', chipT: '#FAC775', cat: 'クロスプレイ', icon: 'link', title: 'Java×統合版' },
	{ slug: 'minecraft-forge-server', bg: '#4A1B0C', mid: '#F0997B', light: '#FAECE7', chipB: '#993C1D', chipT: '#F5C4B3', cat: 'Forge', icon: 'anvil', title: 'Forge鯖の立て方' },
];

function svgFor(p) {
	const chipW = 64 + p.cat.length * 42;
	return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
	<rect width="1200" height="630" fill="${p.bg}"/>
	<circle cx="1120" cy="560" r="260" fill="none" stroke="${p.mid}" stroke-width="2" opacity="0.25"/>
	<circle cx="1160" cy="600" r="380" fill="none" stroke="${p.mid}" stroke-width="2" opacity="0.15"/>
	<rect x="80" y="72" width="${chipW}" height="66" rx="33" fill="none" stroke="${p.chipB}" stroke-width="3"/>
	<text x="${80 + chipW / 2}" y="116" text-anchor="middle" font-family="${FONT}" font-size="34" fill="${p.chipT}">${p.cat}</text>
	<g transform="translate(920,60) scale(2.2)">${icons[p.icon](p.mid)}</g>
	<text x="80" y="472" font-family="${FONT}" font-size="76" font-weight="bold" fill="${p.light}">${p.title}</text>
	<line x1="84" y1="512" x2="244" y2="512" stroke="${p.mid}" stroke-width="6" stroke-linecap="round"/>
	<text x="80" y="566" font-family="${FONT}" font-size="32" fill="${p.mid}">ゲーム鯖ラボ</text>
</svg>`;
}

for (const p of posts) {
	const svg = svgFor(p);
	await sharp(Buffer.from(svg), { density: 96 }).png().toFile(`${OUT}/${p.slug}.png`);
	console.log('generated:', p.slug);
}
console.log('done');
