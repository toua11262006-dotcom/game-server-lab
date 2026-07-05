---
title: 'マイクラ鯖にプラグインを入れる方法【Paper対応】定番5選と導入手順'
description: 'Minecraftサーバー(Paper/Spigot)へのプラグイン導入手順を解説。EssentialsX・LuckPerms・CoreProtectなど定番プラグイン5選と、権限設定・アップデート時の注意点まで運用目線で紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/minecraft-plugin-guide.png'
---

バニラのマイクラ鯖を運用していると「ホーム機能が欲しい」「誰がこのチェスト荒らしたか知りたい」「権限を分けたい」という要望が必ず出てきます。これを全部解決するのが**プラグイン**です。Modと違ってプレイヤー側は何も入れる必要がなく、サーバーに置くだけで機能が追加されます。

## 前提: プラグインが動くのはPaper系サーバー

バニラの `server.jar` はプラグインを読み込めません。プラグインを使うには**Paper**(または上位互換のPurpur)でサーバーを動かす必要があります。Paperはプラグイン対応に加えて動作も軽くなるので、乗り換えない理由がほぼありません。導入手順は[マイクラ鯖の軽量化記事](/blog/minecraft-server-lag-fix/)で解説しています。

ちなみに[Fabric Mod鯖](/blog/minecraft-mod-server/)とプラグイン鯖は別系統です。「プレイヤー全員がModを入れて遊ぶ」ならFabric、「サーバー側だけで機能追加」ならPaper+プラグイン、と覚えてください。

## 導入手順は「pluginsフォルダに置いて再起動」だけ

```bash
cd /opt/minecraft/plugins  # サーバーディレクトリ直下のplugins
wget https://example.com/SomePlugin.jar  # 配布ページからjarを取得
systemctl restart minecraft
```

これだけです。起動ログに `[SomePlugin] Enabling SomePlugin v1.0` のような行が出れば読み込み成功。初回起動で `plugins/プラグイン名/config.yml` が生成されるので、設定を変えたらまた再起動します。

**注意: `/reload` コマンドは使わない**でください。メモリリークやプラグイン間の不整合の温床で、Paperコミュニティでも非推奨です。設定変更後は面倒でも再起動が正解です。

## 定番プラグイン5選(まずこれだけで十分)

### 1. EssentialsX — ホーム・ワープ・キット全部入り

`/home` `/spawn` `/tpa`(テレポートリクエスト)など「あって当たり前」のコマンド集。フレンド鯖ならこれ1つで満足度が激変します。ダウンロードは公式サイトから。姉妹jarが複数ありますが、まずは本体 + EssentialsXSpawn の2つで足ります。

### 2. LuckPerms — 権限管理の決定版

「管理者/常連/新規」のようにグループ分けして、使えるコマンドを制御できます。設定はゲーム内コマンドでもWebエディタ(`/lp editor`)でも可能。荒らし対策の基盤になるので、公開鯖なら必須です。

```
/lp group default permission set essentials.home true
/lp user Steve parent add admin
```

### 3. CoreProtect — 「誰が壊した?」に答えるログ

ブロックの設置・破壊・チェスト操作を全部記録し、**巻き戻し**もできます。荒らされた範囲を `/co rollback u:荒らしID t:3h r:30` のように指定して復元。フレンド鯖でも「あれ、ここの建築消えてない?」の調査に重宝します。

### 4. Vault — 経済系の土台

それ自体は何もしませんが、経済・チャット系プラグインの多くが依存しています。EssentialsXの経済機能(`/pay` `/balance`)を使うなら一緒に入れておきます。

### 5. Chunky — チャンク事前生成

ワールドの未探索エリアを事前生成して、探索時のラグスパイクを防ぎます。`/chunky radius 3000` → `/chunky start` で半径3000ブロックを生成。夜間に走らせておくのがおすすめです。

## バージョン更新時の注意

マイクラ本体のアップデート直後は**プラグインの対応待ち**が発生します。本体だけ上げてプラグインが非対応だと起動失敗や機能停止になるので、

1. 各プラグインの対応バージョンを確認してから本体を上げる
2. 上げる前に[バックアップ](/blog/minecraft-server-backup/)を取る
3. `plugins` フォルダごと保全しておけばロールバックも簡単

の順を守ってください。急いで最新に追従するメリットは大抵ありません。

## メモリはどれくらい必要?

プラグイン5〜10個程度なら、バニラ運用と大差ありません(メモリ4GBで4〜8人が目安)。CoreProtectのログDBがディスクを食っていくので、ストレージ残量だけたまに見ておきましょう。VPSプランの選び方は[ゲームサーバー向けVPS比較](/blog/game-vps-comparison/)を参考にどうぞ。

<div class="affiliate-box">
<span class="label">PR</span>
<p>これからサーバーを建てる人は、ConoHa for GAMEのMinecraftテンプレートが手軽です。Paperへの載せ替えとプラグイン導入はこの記事の手順がそのまま使えます。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7USU+6JSFM+50+79YXW2" rel="nofollow">【ConoHa for GAME】マルチプレイがかんたんにすぐ遊べるゲームサーバー</a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B7USU+6JSFM+50+79YXW2" alt=""></p>
</div>

## まとめ

- プラグインはPaper系サーバー前提。導入は「pluginsに置いて再起動」だけ
- まずは EssentialsX / LuckPerms / CoreProtect / Vault / Chunky の5つで十分
- `/reload` は使わない、更新前はバックアップ — この2つだけ守れば事故はほぼ防げます
- 公開鯖にするなら次は[荒らし対策・セキュリティ設定](/blog/minecraft-server-security/)へ
