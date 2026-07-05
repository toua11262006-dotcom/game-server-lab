---
title: 'マイクラJava版と統合版でクロスプレイする方法【Geyser導入手順】'
description: 'GeyserMCを使ってJava版サーバーにスイッチ・スマホ・PS/Xbox(統合版)から参加する方法を解説。PaperへのGeyser+Floodgate導入、ポート設定、既知の制限まで実際の手順ベースで紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/minecraft-geyser-crossplay.png'
---

「PC勢はJava版、スイッチ勢は統合版」— マイクラのマルチで一番よくある分断です。公式にはJava版と統合版は別ゲームで相互接続できませんが、**Geyser**というプラグインを使えばJava版サーバーに統合版(スイッチ/スマホ/PS/Xbox)から参加できるようになります。筆者のフレンド鯖もこれで「PC組+スイッチ組」の混成が実現しました。

## 仕組みと方針

Geyserは統合版のプロトコルをJava版に翻訳するプロキシです。さらに**Floodgate**を併用すると、統合版プレイヤーがJava版のMicrosoftアカウントを持っていなくても参加できます。

- 導入するのは**サーバー側だけ**。プレイヤーは何も入れなくていい(スイッチ勢に手順を説明しなくて済むのが最大の利点)
- Java版サーバーはプラグインが使える**Paper**前提です。まだの人は[Paper化の手順](/blog/minecraft-server-lag-fix/)から
- 逆パターン(統合版サーバーにJava勢を入れる)はできません。**母体はJava版**にします

## 手順1: GeyserとFloodgateをダウンロード

Geyser公式サイトのDownloadから **Geyser-Spigot** と **Floodgate-Spigot** の2つのjarを取得し、サーバーの `plugins` フォルダに置きます。

```bash
cd /opt/minecraft/plugins
# 公式サイト geysermc.org のダウンロードページから取得
wget -O Geyser-Spigot.jar "https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot"
wget -O Floodgate-Spigot.jar "https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot"
systemctl restart minecraft
```

再起動すると `plugins/Geyser-Spigot/config.yml` が生成されます。

## 手順2: Floodgate連携を設定

`plugins/Geyser-Spigot/config.yml` の1箇所だけ変更します。

```yaml
remote:
  auth-type: floodgate
```

これで統合版プレイヤーはJava版アカウント不要で入れるようになります。Floodgate経由のプレイヤーには名前の頭に `.`(ピリオド)が付くので、Java勢と区別できます。

設定後にもう一度再起動してください(Geyserは `/reload` 非対応、というより[reload自体使わないのが正解](/blog/minecraft-plugin-guide/)です)。

## 手順3: UDP 19132を開放

統合版はJava版と別ポート(**UDP 19132**)で待ち受けます。VPSのファイアウォールで開けます。

```bash
ufw allow 19132/udp
```

Java版の25565/tcpはそのままです。つまりこのサーバーは「25565でJava勢、19132で統合版勢」を同時に受け付ける状態になります。

## 手順4: 統合版から接続する

- **スマホ/Windows統合版**: 「サーバー」タブ → サーバー追加 → アドレスにVPSのIP、ポート19132
- **スイッチ/PS/Xbox**: サーバー追加画面が(建前上)ないため、DNSを書き換えて特集サーバー経由で入る方法や、LAN内プロキシアプリを使う方法が知られています。フレンドに案内するならスマホ・PC統合版が一番スムーズです

接続できたら、Java勢と同じワールドに統合版プレイヤーが現れます。

## ホワイトリストとの併用

[荒らし対策](/blog/minecraft-server-security/)でホワイトリストを使っている場合、Floodgate経由のプレイヤーは `.名前` 形式で登録します。

```
/whitelist add .スイッチのゲーマータグ
```

ピリオドを忘れると「登録したのに入れない」となるので注意してください(問い合わせの定番です)。

## 知っておくべき制限

Geyserは翻訳レイヤーなので、完璧ではありません。

- **バージョン追従のラグ**: マイクラ本体のアップデート直後はGeyserの対応待ちが発生することがあります。急いで本体を上げないのが吉
- **細かい挙動差**: 統合版側では一部のパーティクルやインベントリ操作の見え方が異なります。サバイバルで遊ぶ分には支障なし
- **Mod鯖とは併用不可に近い**: [Fabric Mod鯖](/blog/minecraft-mod-server/)にもGeyserのFabric版はありますが、Modの独自ブロックは統合版に翻訳できず表示が壊れます。クロスプレイ鯖はバニラ+プラグイン構成が無難です

## 必要スペック

Geyser自体は軽量で、体感ではプラグイン1〜2個分の負荷です。メモリ4GBあれば混成6〜8人は問題なく動きます。これから鯖を建てる人は[マイクラ鯖の立て方](/blog/minecraft-server-guide/)と[VPS比較](/blog/game-vps-comparison/)からどうぞ。

<div class="affiliate-box">
<span class="label">PR</span>
<p>ConoHa for GAMEのMinecraftテンプレートで建てたサーバーにも、この記事の手順でGeyserを追加できます。スイッチ勢のフレンドがいるならクロスプレイ化はかなり喜ばれます。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7USU+6JSFM+50+79YXW2" rel="nofollow">【ConoHa for GAME】マルチプレイがかんたんにすぐ遊べるゲームサーバー</a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B7USU+6JSFM+50+79YXW2" alt=""></p>
</div>

## まとめ

- Geyser + Floodgate をPaperのpluginsに置くだけで、統合版からJava鯖に参加可能
- 開けるポートは **UDP 19132**(Java版の25565とは別)
- ホワイトリストは `.名前` 形式、本体アップデートは焦らない
- スイッチ勢・スマホ勢を切り捨てない鯖運用、一度やると戻れません
