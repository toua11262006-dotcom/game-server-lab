---
title: 'Palworld専用サーバーの立て方【Linux/VPS対応】SteamCMDで建てる手順を完全解説'
description: 'Palworld(パルワールド)の専用サーバーをVPSに建てる手順を解説。SteamCMDでのインストールからsystemdでの常時稼働、メモリ不足対策まで、実際に運用した経験に基づいて紹介します。'
pubDate: '2026-07-05'
heroImage: '../../assets/eyecatch/palworld-server-guide.png'
---

Palworldのマルチプレイは誰かのPCでホストすると「ホストが寝たら全員解散」になります。専用サーバーを建てれば24時間ワールドが動き続け、各自が好きな時間にログインできます。この記事ではVPS上にLinux版の専用サーバーを建てる手順を解説します。

## 必要スペック(ここをケチると落ちます)

Palworldのサーバーは**かなりメモリを食います**。公式の推奨は16GBですが、実測では4人程度なら8GBでも動きます。ただし8GBの場合は後述のスワップ設定が実質必須です。

| 人数 | メモリ | 備考 |
|---|---|---|
| 〜4人 | 8GB | スワップ設定推奨 |
| 4〜8人 | 16GB | 快適 |
| CPU | 4コア以上 | |

<div class="affiliate-box">
<span class="label">PR</span>
<p>メモリ8GB以上のプランがあるVPSなら基本どこでも動きます。筆者はConoHa VPSを使用。時間課金なので「フレンドとやる期間だけ建てる」運用と相性が良いです。Palworldのテンプレートを使えばこの記事の手順なしでも起動できます。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7U0Y+3C9KZ6+50+4YX6PU" rel="nofollow">サービス開発やテスト環境に便利な【ConoHa】</a>
<img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4B7U0Y+3C9KZ6+50+4YX6PU" alt=""></p>
</div>

## 手順1: SteamCMDをインストール

Ubuntu 24.04 での手順です。専用サーバーはSteamの配信ツール「SteamCMD」経由でダウンロードします。

```bash
# 32bitライブラリを有効化してSteamCMDを導入
add-apt-repository multiverse
dpkg --add-architecture i386
apt update
apt install -y steamcmd

# 実行用の一般ユーザーを作成(rootでのゲームサーバー運用は非推奨)
useradd -m steam
su - steam
```

## 手順2: Palworldサーバーをダウンロード

```bash
steamcmd +login anonymous +app_update 2394010 validate +quit
```

`2394010` がPalworld Dedicated ServerのアプリIDです。5GB前後ダウンロードするので数分待ちます。

## 手順3: 起動確認と設定

```bash
cd ~/Steam/steamapps/common/PalServer
./PalServer.sh
```

起動したら `Ctrl+C` で一度止めて、設定ファイルを編集します。初回起動後にデフォルト設定をコピーして使います。

```bash
cp DefaultPalWorldSettings.ini Pal/Saved/Config/LinuxServer/PalWorldSettings.ini
```

`PalWorldSettings.ini` で最低限変えておくべき項目:

- `ServerName=` — サーバー一覧に表示される名前
- `ServerPassword=` — 参加パスワード(**必ず設定**。無設定だと世界中の誰でも入れます)
- `AdminPassword=` — 管理コマンド用パスワード

## 手順4: systemdで常時稼働化

```bash
# rootに戻って作業
cat > /etc/systemd/system/palworld.service << 'EOF'
[Unit]
Description=Palworld Dedicated Server
After=network.target

[Service]
User=steam
WorkingDirectory=/home/steam/Steam/steamapps/common/PalServer
ExecStart=/home/steam/Steam/steamapps/common/PalServer/PalServer.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now palworld
```

ファイアウォールはPalworldの**UDP 8211**を開けます。

```bash
ufw allow 8211/udp
```

## 手順5: 接続する

ゲーム内の「マルチプレイに参加する(専用サーバー)」で、画面下の接続欄に `VPSのIP:8211` を入力して接続します。

## メモリ不足対策(8GBプランの場合)

Palworldサーバーはプレイ時間が伸びるとメモリ使用量がじわじわ増えます(いわゆるメモリリーク傾向)。8GBプランで運用するなら次の2つを入れておくと安定します。

```bash
# 1. スワップを4GB確保(物理メモリが尽きたときの保険)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 2. 毎朝5時にサーバーを自動再起動してメモリを解放
crontab -e
# 以下を追加
0 5 * * * systemctl restart palworld
```

筆者はこの構成で運用して、それ以降メモリ起因のクラッシュは起きていません。

## まとめ

- SteamCMD → app 2394010 → systemd化、の3ステップで24時間サーバーが完成
- パスワード設定とUDP 8211の開放を忘れずに
- 8GB運用はスワップ+定期再起動でカバー。人数が増えたら素直に16GBへ
- VPS選びに迷ったら[ゲームサーバー向けVPS比較](/blog/game-vps-comparison/)もどうぞ
