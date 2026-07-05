---
title: '【2026年版】マイクラのマルチサーバーの立て方|VPSで自分専用サーバーを建てる完全ガイド'
description: 'マインクラフトのマルチプレイサーバーをVPSに建てる手順を、実際に運用中の筆者が完全解説。VPSの契約からJavaの導入、サーバーの起動、友達を招待するまでを画面通りに進めるだけで完成します。'
pubDate: '2026-07-05'
heroImage: '../../assets/eyecatch/minecraft-server-guide.png'
---

「友達とマイクラのマルチプレイがしたい。でもRealmsは物足りないし、Modも入れたい」——そうなったら自分のサーバーを建てるのが一番です。この記事では、実際にVPS上でマイクラサーバーを運用している筆者が、契約から友達を招待するまでの手順をそのまま公開します。

## サーバーを建てる方法は3つある

| 方法 | 月額の目安 | 手軽さ | 自由度 |
|---|---|---|---|
| 自宅PCでサーバー起動 | 0円(電気代別) | △ ポート開放が必要 | ○ |
| Minecraft Realms | 約1,300円 | ◎ | × Mod不可 |
| **VPS(この記事)** | 約1,000円〜 | ○ | ◎ Mod・プラグイン自由 |

自宅サーバーは無料ですが、ルーターのポート開放で自宅のIPアドレスを公開することになり、セキュリティ面の不安が残ります。PCを点けっぱなしにする必要もあります。VPSなら24時間稼働・自宅IPの公開なし・Modも自由です。

## 必要なもの

- マインクラフト Java版(参加する全員分)
- VPS(メモリ**4GB**プラン推奨。2〜3人のバニラなら2GBでも動きますが、人数やModが増えると足りなくなります)

<div class="affiliate-box">
<span class="label">PR</span>
<p>筆者のサーバーは <strong>ConoHa VPS</strong> で稼働しています。マイクラ用のテンプレートが用意されているので、この記事の手順の大半をスキップして数分でサーバーを起動することもできます。時間課金制なので「週末だけ建てて試す」使い方もOKです。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7U0Y+3C9KZ6+50+4YX6PU" rel="nofollow">サービス開発やテスト環境に便利な【ConoHa】</a>
<img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4B7U0Y+3C9KZ6+50+4YX6PU" alt=""></p>
</div>

## 手順1: VPSを契約する

OSは **Ubuntu 24.04** を選択します。プランはメモリ4GBを推奨。契約が完了すると、サーバーのIPアドレスとrootパスワードが発行されます。

## 手順2: サーバーに接続して基本設定

WindowsならPowerShell、Macならターミナルを開いて、SSHで接続します。

```bash
ssh root@あなたのサーバーIP
```

接続できたら、まずパッケージを最新化してJava 21をインストールします(Minecraft 1.20.5以降はJava 21が必要です)。

```bash
apt update && apt upgrade -y
apt install -y openjdk-21-jre-headless
java -version   # 21.x と表示されればOK
```

## 手順3: マイクラサーバーを設置する

公式サイトから最新のサーバーファイルをダウンロードします。URLは[minecraft.net のサーバーダウンロードページ](https://www.minecraft.net/ja-jp/download/server)で最新版を確認してください。

```bash
mkdir /opt/minecraft && cd /opt/minecraft
wget -O server.jar 'ダウンロードページで取得したURL'

# 初回起動(EULA同意ファイルが生成される)
java -Xms2G -Xmx3G -jar server.jar nogui
```

初回はEULA(利用規約)への同意を求められて停止します。`eula.txt` を編集して同意します。

```bash
sed -i 's/eula=false/eula=true/' eula.txt
```

`-Xmx3G` はサーバーに割り当てるメモリ量です。4GBプランならOS用に1GB残して3GBが目安です。

## 手順4: 24時間動かす設定(systemd)

SSHを切ってもサーバーが動き続けるように、systemdサービスとして登録します。筆者が実際に使っている設定です。

```bash
cat > /etc/systemd/system/minecraft.service << 'EOF'
[Unit]
Description=Minecraft Server
After=network.target

[Service]
WorkingDirectory=/opt/minecraft
ExecStart=/usr/bin/java -Xms2G -Xmx3G -jar server.jar nogui
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now minecraft
systemctl status minecraft   # active (running) ならOK
```

これでVPSが再起動しても、サーバーがクラッシュしても自動で復帰します。

## 手順5: ファイアウォールでポートを開ける

マイクラの通信ポート(25565)とSSHだけを許可します。

```bash
ufw allow OpenSSH
ufw allow 25565/tcp
ufw enable
```

## 手順6: 友達を招待する

参加者はマイクラを起動して「マルチプレイ」→「サーバーを追加」で、サーバーアドレスに**VPSのIPアドレス**を入力するだけです。接続できたら完成です。

荒らし対策として、`server.properties` で `white-list=true` にして、参加者を登録しておくのがおすすめです。

```bash
# サーバーコンソールから(またはops権限で)
whitelist add 友達のマイクラID
```

## つまずきポイント(筆者の実体験)

- **「Connection refused」で繋がらない** → ほぼファイアウォールの設定漏れです。`ufw status` で25565が開いているか確認
- **数時間でサーバーが落ちる** → メモリ不足です。`-Xmx` の値がVPSの物理メモリを超えていないか確認(スワップに乗ると激重になります)
- **ワールドのバックアップを忘れる** → `/opt/minecraft/world` を定期的に `tar` で固めましょう。筆者はcronで毎日自動化しています

## まとめ

- VPS + Ubuntu + Java 21 + systemd で、24時間動く自分専用サーバーが月1,000円前後で持てる
- ポート開放不要・自宅IPの公開なしで安全
- 次のステップ: [Mod入りサーバーの建て方](/blog/minecraft-mod-server/)、[VPS各社の比較](/blog/game-vps-comparison/)
