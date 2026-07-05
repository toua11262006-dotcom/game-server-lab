---
title: 'マイクラMod入りサーバーの立て方|Fabric+Modrinthで友達とMod環境を共有する'
description: 'Fabricサーバーの構築からModrinthでのMod導入、参加者側のクライアント設定まで、Mod入りマイクラサーバーの建て方を実体験ベースで解説。バージョン不一致で入れないトラブルの対処法も。'
pubDate: '2026-07-05'
heroImage: '../../assets/eyecatch/minecraft-mod-server.png'
---

バニラのマルチに慣れると、次に欲しくなるのが「Mod入りサーバー」です。この記事では軽量で人気のModローダー **Fabric** を使って、Mod入りサーバーを建てる手順を解説します。Modの入手は公式ランチャーとの相性がよい **Modrinth** を使います。

> この記事は[バニラサーバーの構築](/blog/minecraft-server-guide/)が済んでいる前提です。まだの方はそちらからどうぞ。

## ForgeとFabricどっちにする?

| | Fabric | Forge |
|---|---|---|
| 軽さ | ◎ 軽量 | ○ |
| 起動の速さ | ◎ | △ |
| 対応Modの傾向 | 最適化系・便利系に強い | 大型Mod・工業系に強い |
| 更新の速さ | ◎ 新バージョン対応が早い | ○ |

入れたいModが決まっているならそのMod側の対応ローダーに合わせます。特にこだわりがなければ、軽くてトラブルの少ないFabricから始めるのがおすすめです。

## 必要スペック

Modサーバーはバニラよりメモリを食います。**最低4GB、Modを盛るなら8GB**を見てください。筆者の経験では、軽量化Mod込みでも20個ほどModを入れた時点で4GBプランのメモリ使用率が常時80%を超えました。

<div class="affiliate-box">
<span class="label">PR</span>
<p>筆者のModサーバーは <strong>ConoHa VPS</strong> のメモリ8GBプランで運用しています。プラン変更が管理画面から数分でできるので、「まず4GBで建てて、重くなったら8GBに上げる」運用ができるのが便利です。</p>
<p><a href="https://px.a8.net/svt/ejp?a8mat=4B7USU+6JSFM+50+79YXW2" rel="nofollow">【ConoHa for GAME】マルチプレイがかんたんにすぐ遊べるゲームサーバー</a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B7USU+6JSFM+50+79YXW2" alt=""></p>
</div>

## 手順1: Fabricサーバーを設置する

[Fabric公式サイト](https://fabricmc.net/use/server/)でMinecraftバージョンを選ぶと、サーバー用jarのダウンロードURLが表示されます。VPS上で:

```bash
mkdir /opt/mc-fabric && cd /opt/mc-fabric
wget -O fabric-server.jar '公式サイトで表示されたURL'

java -Xms2G -Xmx6G -jar fabric-server.jar nogui
# 初回はEULAで停止するので同意する
sed -i 's/eula=false/eula=true/' eula.txt
```

systemd化の手順は[バニラ編](/blog/minecraft-server-guide/)と同じです(`ExecStart` のjar名だけ変えてください)。

## 手順2: サーバーにModを入れる

Modは [Modrinth](https://modrinth.com/) からダウンロードして、サーバーの `mods/` フォルダに置くだけです。**「Minecraft本体のバージョン」と「Fabric対応版」の2つが一致していること**を必ず確認してください。Mod導入トラブルの9割はバージョン不一致です。

まず入れるべき定番はこの3つです。

- **Fabric API** — ほぼすべてのFabric Modの前提Mod。これがないと大半のModが動きません
- **Lithium** — サーバーの処理を最適化。入れるだけでTPS(サーバーの処理速度)が体感で変わります
- **Chunky** — ワールドの事前生成。探索時のラグを激減させられます

```bash
cd /opt/mc-fabric/mods
wget 'ModrinthのダウンロードURL(.jar)'
systemctl restart minecraft   # 再起動で反映
```

## 手順3: 参加者側(クライアント)の設定

サーバーに入る全員が、**サーバーと同じバージョンのFabric + 同じ描画非依存Mod以外のMod**を入れる必要があります。手作業だと事故りやすいので、筆者は **Modrinth App**(公式デスクトップアプリ)を使っています。

1. Modrinth Appをインストールして、Fabricのプロファイルを作成(バージョンをサーバーと揃える)
2. サーバーと同じModを検索して追加(LithiumやChunkyなどサーバー側だけでよいModは不要)
3. Modrinth Appの「起動」からマイクラを起動 → いつも通りマルチプレイでサーバーに接続

プロファイルはエクスポートして友達に配れるので、「全員に同じ環境を作らせる」作業が一気に楽になります。

## つまずきポイント(筆者の実体験)

- **「Incompatible mods found」で起動しない** → ログ(`logs/latest.log`)に足りない前提Modが出力されています。ほぼFabric API入れ忘れか、バージョン不一致
- **サーバーだけ入れればいいModと全員必要なModがある** → 最適化系(Lithium等)はサーバーのみでOK。新ブロックや新モブを追加するModは全員必須
- **Mod更新でワールドが壊れる** → Modを更新・削除する前に必ずワールドをバックアップ。ブロックを追加するModを抜くと、そのブロックが消えてワールドに穴が開きます

## まとめ

- Fabric + Modrinth が現在いちばんトラブルの少ないMod環境
- バージョンの一致だけは徹底する(本体・Fabric・各Mod)
- メモリはバニラの倍を見込む。足りなくなったらプラン変更で対応
