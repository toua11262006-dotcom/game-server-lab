---
title: 'マイクラ統合版サーバーの立て方|スマホ・Switchの友達と遊べる自分専用サーバー'
description: 'マインクラフト統合版(Bedrock)の専用サーバーをVPSに建てる手順を解説。公式Bedrock Dedicated Serverの導入からallowlist設定、スマホ・Switchからの接続方法まで、実際の運用経験に基づいて紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/minecraft-bedrock-server.png'
---

スマホ・Switch・Xbox・Windowsで遊べる**統合版(Bedrock Edition)**は、Java版とはサーバーの仕組みがまるごと別物です。「Java版のサーバーを建てたのにスマホの友達が入れない」はこの分野の定番の事故。この記事では統合版専用サーバーの建て方を解説します。

## Java版とどっちのサーバーを建てるべき?

| | 統合版サーバー | Java版サーバー |
|---|---|---|
| 遊べる端末 | スマホ・Switch・Xbox・PS・Win10/11 | PC(Java版)のみ |
| Mod | ×(アドオンは可) | ◎ |
| 必要メモリ | 軽い(2GBでも動く) | 4GB〜 |

**メンバーにスマホ・ゲーム機勢がいるなら統合版一択**です。全員がPCでModを入れたいならJava版([構築手順](/blog/minecraft-server-guide/))を選んでください。

## 手順1: VPSを用意する

統合版サーバーはJava版より軽く、**メモリ2GB**のプランから動きます(快適ラインは4GB)。OSは Ubuntu 24.04 を選択してください。

<div class="affiliate-box">
<span class="label">PR</span>
<p>ConoHa for GAME には統合版のテンプレートもあり、この記事の手順を全部スキップして管理画面だけでサーバーを建てることもできます。コマンド操作に自信がない人はテンプレートが確実です。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7USU+6JSFM+50+79YXW2" rel="nofollow">【ConoHa for GAME】マルチプレイがかんたんにすぐ遊べるゲームサーバー</a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B7USU+6JSFM+50+79YXW2" alt=""></p>
</div>

## 手順2: Bedrock Dedicated Serverを設置する

統合版の公式サーバーソフトは無料で配布されています。[公式ダウンロードページ](https://www.minecraft.net/ja-jp/download/server/bedrock)でLinux版のURLを取得してください(利用規約への同意が必要です)。

```bash
apt update && apt install -y unzip
mkdir /opt/bedrock && cd /opt/bedrock
wget -O bedrock.zip '公式ページで取得したLinux版URL'
unzip bedrock.zip

# 動作確認(Ctrl+Cで停止)
LD_LIBRARY_PATH=. ./bedrock_server
```

Javaのインストールは不要です(統合版はC++製のため)。

## 手順3: server.propertiesを設定する

最低限変えるのはこのあたりです。

```properties
server-name=うちのサーバー
gamemode=survival
max-players=10
allow-list=true          # 招待制にする(重要)
server-port=19132        # 統合版はUDP 19132
```

`allow-list=true` にしたら、`allowlist.json` に参加者を登録します。

```json
[
  { "name": "友達のゲーマータグ" },
  { "name": "自分のゲーマータグ" }
]
```

## 手順4: systemd化とポート開放

```bash
cat > /etc/systemd/system/bedrock.service << 'EOF'
[Unit]
Description=Minecraft Bedrock Server
After=network.target

[Service]
WorkingDirectory=/opt/bedrock
Environment=LD_LIBRARY_PATH=/opt/bedrock
ExecStart=/opt/bedrock/bedrock_server
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now bedrock

# 統合版はUDPなので注意(Java版のTCP 25565とは別物)
ufw allow 19132/udp
```

## 手順5: 各端末からの接続方法

- **スマホ・Windows版**: 「遊ぶ」→「サーバー」タブ→「サーバーを追加」でVPSのIPとポート19132を入力。これだけです
- **Switch・PS・Xbox**: ここが統合版の落とし穴で、**ゲーム機版には「サーバーを追加」の項目がありません**(公式提携サーバーのみ表示される仕様)。回避策として、本体のDNS設定を変えて提携サーバー一覧を自分のサーバーに向ける「BedrockConnect」という方法が広く使われています。設定はやや煩雑なので、ゲーム機勢が多い場合は素直にRealms(統合版対応)も検討してください

スマホ+PCのメンバー構成なら何の工夫もなく繋がります。筆者としてはまずスマホ・PC勢で運用を始めて、ゲーム機勢が増えたらBedrockConnectを検討する順番をおすすめします。

## つまずきポイント

- **繋がらない** → 統合版は **UDP** です。`ufw allow 19132/udp` になっているか確認(tcpで開けても繋がりません)
- **ワールドのバックアップ** → `/opt/bedrock/worlds` を丸ごと保存すればOK。[自動バックアップの設定](/blog/minecraft-server-backup/)はJava版と同じ方法が使えます
- **Java版の友達が入れない** → 仕様です。Java版と統合版のサーバーは別物なので、混在させたい場合はJava版サーバーにGeyser(プロキシ)を入れる上級構成になります

## まとめ

- スマホ・ゲーム機勢と遊ぶなら統合版サーバー。メモリ2GB〜と軽量
- ポートは **UDP 19132**。Java版の常識(TCP 25565)は通用しない
- ゲーム機からの接続だけ一工夫必要(BedrockConnect)
