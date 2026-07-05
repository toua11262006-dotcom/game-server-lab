---
title: 'Valheim専用サーバーの立て方【VPS/Linux】SteamCMDで24時間ワールドを動かす'
description: 'Valheim(ヴァルヘイム)の専用サーバーをVPSに建てる手順を解説。SteamCMDでのインストール、パスワード設定の罠、systemdでの常時稼働、クロスプレイ対応まで実際の手順ベースで紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/valheim-server-guide.png'
---

Valheimは北欧神話の世界でサバイバルする定番Co-opゲームです。フレンドのPCでホストする方式だと「ホストがいない時間はワールドに入れない」問題が付きまといますが、専用サーバーを建てれば24時間いつでも各自のペースで探索できます。しかもValheimのサーバーは**驚くほど軽い**ので、安いVPSプランで十分動きます。

## 必要スペック(Palworldよりずっと軽い)

| 項目 | 最低 | 推奨 |
|---|---|---|
| メモリ | 2GB | 4GB |
| CPU | 2コア | 2〜4コア |
| ストレージ | 4GB | 10GB |

実測では2〜4人プレイならメモリ2GB台で安定します。[Palworld](/blog/palworld-server-guide/)のような16GB級の要求はないので、月1,000円前後のVPSプランで運用できるのが魅力です。

<div class="affiliate-box">
<span class="label">PR</span>
<p>ConoHa for GAMEにはValheimのテンプレートがあり、この記事の手順を踏まなくても管理画面から数分でサーバーが起動します。手順を学びたい人は下の手動構築を、とにかく早く遊びたい人はテンプレートをどうぞ。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7USU+6JSFM+50+79YXW2" rel="nofollow">【ConoHa for GAME】マルチプレイがかんたんにすぐ遊べるゲームサーバー</a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B7USU+6JSFM+50+79YXW2" alt=""></p>
</div>

## 手順1: SteamCMDをインストール

Ubuntu 24.04 での手順です。

```bash
add-apt-repository multiverse
dpkg --add-architecture i386
apt update
apt install -y steamcmd

# ゲームサーバー実行用の一般ユーザー
useradd -m steam
su - steam
```

## 手順2: Valheimサーバーをダウンロード

```bash
steamcmd +login anonymous +app_update 896660 validate +quit
```

`896660` がValheim Dedicated ServerのアプリIDです。1GB程度なのですぐ終わります。

## 手順3: 起動スクリプトを作る

サーバー本体は `start_server.sh` を書き換えて起動します。オリジナルを直接編集せず、コピーして自分用を作るのが安全です。

```bash
cd ~/Steam/steamapps/common/"Valheim dedicated server"
cp start_server.sh my_server.sh
```

`my_server.sh` の起動行を編集します。

```bash
./valheim_server.x86_64 -name "MyValheim" -port 2456 \
  -world "Midgard" -password "secret123" -public 0
```

各パラメータの意味と**ハマりどころ**:

- `-name` — サーバー名。**パスワードと同じ文字列を含むと起動失敗**します(意外と踏む罠)
- `-world` — ワールド名。初回起動時に自動生成されます
- `-password` — **5文字以上必須**。短いと起動しません
- `-public 0` — サーバーブラウザに載せない(IP直接指定で参加)。フレンド限定ならこれ推奨
- クロスプレイ(Xbox/PC Game Pass勢と遊ぶ)なら `-crossplay` を追加

## 手順4: systemdで常時稼働化

```bash
# rootに戻って作業
cat > /etc/systemd/system/valheim.service << 'EOF'
[Unit]
Description=Valheim Dedicated Server
After=network.target

[Service]
User=steam
WorkingDirectory=/home/steam/Steam/steamapps/common/Valheim dedicated server
ExecStart=/home/steam/Steam/steamapps/common/Valheim dedicated server/my_server.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now valheim
```

ファイアウォールは**UDP 2456〜2457**を開けます。

```bash
ufw allow 2456:2457/udp
```

## 手順5: 接続する

ゲーム内の「参加」→「IPアドレスで参加」で `VPSのIP:2456` を入力し、設定したパスワードを入れれば接続できます。

## ワールドデータのバックアップ

Valheimのワールドデータは `~/.config/unity3d/IronGate/Valheim/worlds_local/` にあります。拠点が育ってきたら消失対策として日次バックアップを仕込んでおきましょう。考え方は[マイクラ鯖の自動バックアップ](/blog/minecraft-server-backup/)と同じで、cron + tar で十分です。

```bash
# steamユーザーのcrontabに追加(毎朝4時)
0 4 * * * tar czf ~/valheim_backup_$(date +\%u).tar.gz -C ~/.config/unity3d/IronGate/Valheim worlds_local
```

曜日番号(`%u`)をファイル名に使うことで、7世代ローテーションが1行で実現できます。

## まとめ

- SteamCMD → app 896660 → 起動スクリプト編集 → systemd化で完成
- パスワードは5文字以上、サーバー名に含めない(2大ハマりポイント)
- 必要メモリは2〜4GBと軽量。VPS選びは[ゲームサーバー向けVPS比較](/blog/game-vps-comparison/)を参考にどうぞ
- ワールドデータは worlds_local を定期バックアップ
