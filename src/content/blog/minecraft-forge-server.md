---
title: 'マイクラForgeサーバーの立て方|Create・工業Modで遊ぶ重量級サーバー構築ガイド'
description: 'Forgeサーバーの構築手順を、Createや工業系の大型Modを動かす前提で解説。CurseForgeからのMod導入、Modパックの導入、Fabricより重いForge鯖のメモリ設定やクラッシュ対処まで実体験ベースで紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/minecraft-forge-server.png'
---

「Createで大規模な機械を作りたい」「工業Modで自動化ラインを組みたい」——そういう大型Modは、その多くが **Forge**(または派生のNeoForge)向けに作られています。この記事では、[Fabricサーバー](/blog/minecraft-mod-server/)ではなくForgeサーバーを、重量級Modを動かす前提で建てる手順を解説します。

> バニラのマルチ構築([マイクラサーバーの立て方](/blog/minecraft-server-guide/))が済んでいる前提です。Java・systemd・ポート開放の基礎はそちらを参照してください。

## ForgeとFabric、どちらを選ぶべきか

すでに[Mod入りサーバーの記事](/blog/minecraft-mod-server/)でも触れましたが、選ぶ基準はシンプルです。

| | Forge | Fabric |
|---|---|---|
| 得意なMod | Create・工業・魔術・大型コンテンツ | 軽量化・便利系・最適化 |
| 動作の軽さ | 重め | 軽い |
| Modの数 | 大型Modが充実 | 最適化Modが充実 |
| メモリ消費 | 多い(8GB〜推奨) | 少なめ |

**入れたいMod(またはModパック)がForge対応なら、選択の余地なくForgeです。** Modは対応ローダーが決まっているので、「軽いからFabric」という選び方はできません。まず遊びたいModを決めて、それに従ってください。

## 必要スペック(Forgeは正直かなり重い)

Forgeの大型Modサーバーは、このブログで扱ってきた中で最もメモリを食います。目安はこうです。

| 構成 | 推奨メモリ |
|---|---|
| Forge + 単体Mod数個 | 6GB |
| 中規模Modパック(50〜100Mod) | 8GB |
| 大型Modパック(150Mod超) | 12〜16GB |

[VPS比較記事](/blog/game-vps-comparison/)でも書いた通り、ここをケチると起動すらしないことがあります。Createのような常時演算するModは特にCPUも使うので、メモリだけでなくコア数にも少し余裕を持たせてください。

<div class="affiliate-box">
<span class="label">PR</span>
<p>筆者のForge鯖は <strong>ConoHa for GAME</strong> のメモリ8GBプランで運用しています。プラン変更が管理画面から数分でできるので、「まず8GBで建てて、Modパックが重ければ16GBに上げる」運用がしやすいのが利点です。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7USU+6JSFM+50+79YXW2" rel="nofollow">【ConoHa for GAME】マルチプレイがかんたんにすぐ遊べるゲームサーバー</a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B7USU+6JSFM+50+79YXW2" alt=""></p>
</div>

## 手順1: Forgeサーバーをインストールする

[Forge公式サイト](https://files.minecraftforge.net/)で、遊びたいMinecraftのバージョンを選び、**Installer** をダウンロードします(Recommended版が安定しておすすめ)。VPS上での作業です。

```bash
mkdir /opt/forge && cd /opt/forge
wget -O forge-installer.jar '公式サイトで取得したInstallerのURL'

# サーバーとしてインストール(必要なファイル一式が展開される)
java -jar forge-installer.jar --installServer
```

インストールが終わると、`run.sh`(起動スクリプト)や `libraries/` などが生成されます。最近のForgeは `run.sh` 経由で起動するのが標準です。

```bash
# EULA同意
echo "eula=true" > eula.txt

# 初回起動(worldとconfigが生成される)
./run.sh nogui
```

## 手順2: メモリ割り当てを設定する

Forgeの `run.sh` は `user_jvm_args.txt` からJVM引数を読み込みます。ここでメモリと最適化フラグを指定します。

```bash
cat > user_jvm_args.txt << 'EOF'
-Xms8G
-Xmx8G
-XX:+UseG1GC
-XX:+ParallelRefProcEnabled
-XX:MaxGCPauseMillis=200
-XX:+UnlockExperimentalVMOptions
-XX:G1HeapRegionSize=8M
-XX:G1ReservePercent=20
-XX:InitiatingHeapOccupancyPercent=15
EOF
```

`-Xms` と `-Xmx` は同じ値にし、VPSの物理メモリより1〜2GB小さくします(8GBプランなら6〜7GBが安全)。これはForgeの起動フラグとしてコミュニティ標準の設定です。ラグ対策の詳細は[サーバーが重い時の対策記事](/blog/minecraft-server-lag-fix/)も参照してください。

## 手順3: Modを導入する

Forge Modの入手先は主に **CurseForge** です。サーバーの `mods/` フォルダに `.jar` を置くだけで導入できます。

```bash
cd /opt/forge/mods
wget 'CurseForgeのダウンロードURL(.jar)'
```

**Forgeで最も重要な注意点は「前提Mod(ライブラリMod)」です。** 大型Modは他のライブラリModに依存していることが多く、依存が欠けると起動時にクラッシュします。CurseForgeのMod紹介ページの「Relations(関連)」欄に必須の依存Modが書かれているので、必ず一緒に入れてください。

## 手順4: Modパックを丸ごと入れる場合

個別にModを集めるより、完成された **Modパック** を導入するほうが依存関係の事故が起きません。CurseForgeやFTBのModパックには「Server Pack(サーバー用一式)」が配布されているものが多く、これを使います。

```bash
mkdir /opt/forge-pack && cd /opt/forge-pack
wget -O serverpack.zip 'Modパックのserver pack URL'
unzip serverpack.zip
echo "eula=true" > eula.txt
# 同梱の start.sh / run.sh を使って起動
```

サーバーとクライアントで**同じModパックの同じバージョン**を使うのが鉄則です。参加者にはCurseForge App等で同じModパックを入れてもらってください。

## 手順5: systemd化

[バニラ記事](/blog/minecraft-server-guide/)と同じ要領ですが、`ExecStart` を `run.sh` に向けます。

```bash
cat > /etc/systemd/system/forge.service << 'EOF'
[Unit]
Description=Minecraft Forge Server
After=network.target

[Service]
WorkingDirectory=/opt/forge
ExecStart=/opt/forge/run.sh nogui
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now forge
```

ポート開放(TCP 25565)も忘れずに。Modが増えると初回起動に数分かかることがあるので、`systemctl status forge` がactiveでも、実際にログインできるまで少し待ってください。

## つまずきポイント(筆者の実体験)

- **起動中にクラッシュして落ちる** → `logs/latest.log` か `crash-reports/` を確認。9割は前提Modの不足かMod同士のバージョン不一致です。ログの末尾に「Missing or unsupported mandatory dependencies」と出ていたら依存Mod漏れ
- **起動が異常に遅い/メモリ不足で落ちる** → 大型Modパックは8GBでも足りないことがあります。`-Xmx` を上げるか、VPSのプランを上げる。スワップに乗ると激重になるので物理メモリで足りる構成にするのが基本
- **Modを更新したらワールドが壊れた** → Forge Modはブロックやアイテムを追加するため、Modを抜くとそのブロックが消えます。**更新・削除の前に必ず[バックアップ](/blog/minecraft-server-backup/)** を取ってください。これは事故ってからでは遅いです
- **NeoForgeと間違える** → 新しめのバージョンではForgeから派生した「NeoForge」が主流になりつつあります。入れたいModがNeoForge向けなら、Forgeではなくそちらのインストーラを使ってください(手順はほぼ同じです)

## まとめ

- Create・工業・大型コンテンツ系Modを遊ぶならForge(またはNeoForge)一択
- とにかく重い。メモリは中規模で8GB、大型で16GBを見込む
- 個別Modは前提Modの同梱を、Modパックはサーバー/クライアントのバージョン一致を徹底
- 軽さや最適化重視なら[Fabricサーバー](/blog/minecraft-mod-server/)、まず基礎からなら[バニラ構築ガイド](/blog/minecraft-server-guide/)へ
