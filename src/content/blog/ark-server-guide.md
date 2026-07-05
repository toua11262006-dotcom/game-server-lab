---
title: 'ARK専用サーバーの立て方【Linux/VPS】SteamCMDでSurvival Evolved鯖を建てる'
description: 'ARK: Survival Evolvedの専用サーバーをVPSに建てる手順を解説。SteamCMDでのインストール、GameUserSettings.iniの倍率設定、メモリ対策、Ascended(ASA)のLinux事情まで正直に紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/ark-server-guide.png'
---

恐竜サバイバルの金字塔ARK。公式サーバーは人が多くて資源の取り合いになりがちですが、専用サーバーを建てれば**テイム倍率も採取倍率も自分たちの好きなバランス**で、フレンドだけの島を24時間動かせます。この記事はSteamCMDで建てるARK: Survival Evolved(ASE)のLinuxサーバー手順です。

## 先に正直な話: ASEとASAどっちの鯖?

- **ARK: Survival Evolved (ASE)** — 公式のLinux専用サーバーがあり、この記事の手順でVPSに建てられます
- **ARK: Survival Ascended (ASA)** — 公式Linuxサーバーが**存在しません**。WindowsサーバーをProton/Wine経由で動かす非公式手段はありますが、トラブル耐性が要求されるので万人向けではありません

フレンドとワイワイやる目的ならASE鯖は今でも十分現役です。以下ASE前提で進めます。

## 必要スペック(ARKは重い)

| 項目 | 最低 | 推奨 |
|---|---|---|
| メモリ | 8GB + スワップ | 16GB |
| CPU | 4コア | 4コア以上 |
| ストレージ | **30GB以上** | 50GB |

注意すべきは**ストレージ**です。サーバー本体だけで20GB超あるので、ディスク容量の小さい格安プランだとインストールの時点で詰みます。

<div class="affiliate-box">
<span class="label">PR</span>
<p>ConoHa for GAMEにはARK: Survival Evolvedのテンプレートがあり、メモリ8GB以上のプランを選べば管理画面から数分で起動できます。手動構築が面倒になったらこちらへどうぞ。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7USU+6JSFM+50+79YXW2" rel="nofollow">【ConoHa for GAME】マルチプレイがかんたんにすぐ遊べるゲームサーバー</a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B7USU+6JSFM+50+79YXW2" alt=""></p>
</div>

## 手順1: SteamCMDと下準備

Ubuntu 24.04 での手順です。ARKはオープンファイル数の上限も引き上げが必要です。

```bash
add-apt-repository multiverse
dpkg --add-architecture i386
apt update
apt install -y steamcmd

# ファイルディスクリプタ上限を引き上げ(ARK必須)
echo "fs.file-max=100000" >> /etc/sysctl.conf
sysctl -p
echo "* soft nofile 1000000" >> /etc/security/limits.conf
echo "* hard nofile 1000000" >> /etc/security/limits.conf

useradd -m steam
su - steam
```

## 手順2: ARKサーバーをダウンロード(長い)

```bash
steamcmd +login anonymous +app_update 376030 validate +quit
```

`376030` がARK Survival Evolved Dedicated ServerのアプリIDです。**20GB超のダウンロード**になるので、VPSの回線でも10〜20分は見ておいてください。

## 手順3: 起動して初期生成

```bash
cd ~/Steam/steamapps/common/"ARK Survival Evolved Dedicated Server"/ShooterGame/Binaries/Linux
./ShooterGameServer TheIsland?listen?SessionName=MyARK?ServerPassword=secret123?ServerAdminPassword=admin456 -server -log
```

初回起動は設定ファイル生成のため数分かかります。「Full Startup」のログが出たら `Ctrl+C` で止めて設定に進みます。

## 手順4: 倍率設定(自分鯖の醍醐味)

`ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini` の `[ServerSettings]` セクションに倍率を書きます。社会人フレンド鯖でよく使う「公式の3〜5倍でサクサク」設定の例:

```ini
[ServerSettings]
TamingSpeedMultiplier=5.0
HarvestAmountMultiplier=3.0
XPMultiplier=3.0
DifficultyOffset=1.0
OverrideOfficialDifficulty=5.0
```

`OverrideOfficialDifficulty=5.0` で野生恐竜の最高レベルが150になります(公式サーバー相当)。テイム時間はデフォルトだと平気で数時間かかるので、`TamingSpeedMultiplier` は上げておくのがおすすめです。

## 手順5: systemdで常時稼働化

```bash
# rootに戻って作業
cat > /etc/systemd/system/ark.service << 'EOF'
[Unit]
Description=ARK Survival Evolved Dedicated Server
After=network.target

[Service]
User=steam
WorkingDirectory=/home/steam/Steam/steamapps/common/ARK Survival Evolved Dedicated Server/ShooterGame/Binaries/Linux
ExecStart=/home/steam/Steam/steamapps/common/ARK Survival Evolved Dedicated Server/ShooterGame/Binaries/Linux/ShooterGameServer TheIsland?listen?SessionName=MyARK?ServerPassword=secret123?ServerAdminPassword=admin456 -server -log
LimitNOFILE=100000
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now ark
```

ポートは**UDP 7777、7778、27015**の3つを開けます。

```bash
ufw allow 7777/udp
ufw allow 7778/udp
ufw allow 27015/udp
```

## 手順6: 接続する

Steamのサーバーブラウザ(表示 → ゲームサーバー → お気に入り)に `VPSのIP:27015` を追加すると一覧に出ます。ゲーム内サーバー検索は「非公式」「パスワード保護あり」フィルタを有効にして探してください。

## メモリ8GBで運用する場合の保険

ARKサーバーはマップと恐竜数によってメモリ使用量が伸びます。8GBプランならスワップ確保 + 深夜の定期再起動を仕込んでおくと安定します。やり方は[Palworld鯖のメモリ不足対策](/blog/palworld-server-guide/)と同じです。

```bash
fallocate -l 8G /swapfile
chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

セーブデータ(`ShooterGame/Saved/SavedArks/`)のバックアップも忘れずに。仕組みは[自動バックアップの記事](/blog/minecraft-server-backup/)が流用できます。

## まとめ

- ASEは公式Linuxサーバーあり、ASAは無し(2026年時点)。フレンド鯖ならASEで十分
- ダウンロード20GB超・メモリ8〜16GB・ディスク30GB以上を確保してから着手
- 倍率設定(GameUserSettings.ini)こそ自分鯖の醍醐味。テイム倍率は上げておこう
- VPS選びに迷ったら[ゲームサーバー向けVPS比較](/blog/game-vps-comparison/)へ
