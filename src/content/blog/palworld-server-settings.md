---
title: 'Palworldサーバー設定おすすめ一覧|PalWorldSettings.iniの重要項目を全解説'
description: 'Palworld専用サーバーの設定ファイルPalWorldSettings.iniの重要項目を解説。友達とまったり遊ぶ用・ガチサバイバル用のおすすめ設定値と、変更が反映されない時の対処法を紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/palworld-server-settings.png'
---

Palworldの専用サーバーは、設定ファイルをいじることで経験値倍率からパルの捕獲率、死亡ペナルティまで細かく調整できます。この記事では `PalWorldSettings.ini` の重要項目と、用途別のおすすめ値をまとめます。

> サーバー本体の建て方は[Palworld専用サーバーの立て方](/blog/palworld-server-guide/)を先にどうぞ。

## 設定ファイルの場所と編集の基本

Linuxサーバーの場合、編集するのはこのファイルです。

```
~/Steam/steamapps/common/PalServer/Pal/Saved/Config/LinuxServer/PalWorldSettings.ini
```

**大事な注意が2つあります。**

1. **編集前にサーバーを停止する**(`systemctl stop palworld`)。起動中に編集すると、終了時に古い設定で上書きされて「反映されない」現象が起きます
2. 設定はすべて `OptionSettings=(...)` の**1行の中**にカンマ区切りで書かれています。改行を入れると読み込まれません

## まず設定すべき項目(全サーバー共通)

```ini
ServerName="サーバーの表示名"
ServerPassword="参加パスワード"     # 必ず設定。空だと誰でも入れます
AdminPassword="管理用パスワード"    # ゲーム内管理コマンド用
ServerPlayerMaxNum=8               # 最大人数
```

## 遊び方を決める主要パラメータ

| 項目 | 意味 | デフォルト |
|---|---|---|
| `ExpRate` | 経験値倍率 | 1.0 |
| `PalCaptureRate` | パルの捕獲率倍率 | 1.0 |
| `PalSpawnNumRate` | パルの出現数倍率 | 1.0 |
| `WorkSpeedRate` | 拠点の作業速度倍率 | 1.0 |
| `CollectionDropRate` | 採取ドロップ倍率 | 1.0 |
| `DeathPenalty` | 死亡ペナルティ | All |
| `PalEggDefaultHatchingTime` | 卵の孵化時間(時間) | 72.0 |
| `bEnableInvaderEnemy` | 拠点への襲撃の有無 | True |

## おすすめ設定①: 社会人フレンド鯖(まったり)

平日はあまりログインできないメンバー向け。素材集めの作業感を減らして、遊べる時間を進行に充てる設定です。

```ini
ExpRate=2.0
PalCaptureRate=1.5
WorkSpeedRate=2.0
CollectionDropRate=2.0
PalEggDefaultHatchingTime=1.0
DeathPenalty=Item        # 装備は残る。全ロスは心が折れます
bEnableInvaderEnemy=False # 不在時に拠点が壊されるのを防ぐ
```

筆者のサーバーはほぼこの構成で運用しています。特に `PalEggDefaultHatchingTime`(デフォルトだと現実時間で数日かかる)と `DeathPenalty` の2つは、緩めてから継続率が明らかに上がりました。

## おすすめ設定②: ガチサバイバル鯖

デフォルトのバランスを尊重しつつ、マルチの緊張感を上げる方向です。

```ini
ExpRate=1.0
DeathPenalty=All
bEnableInvaderEnemy=True
PalSpawnNumRate=1.2      # 野生パルを少し増やして賑やかに
```

PvPを有効にする場合は `bIsPvP=True` を追加しますが、フレンド鯖では揉め事のもとになりがちなので、よく相談してから。

## 設定が反映されない時のチェックリスト

1. サーバーを**止めてから**編集したか(起動中の編集は上書きされます)
2. 編集したのは `Pal/Saved/Config/LinuxServer/` の方か(`DefaultPalWorldSettings.ini` は雛形なので編集しても無意味です)
3. `OptionSettings=(...)` の行が1行のままか(改行・全角スペース混入に注意)
4. 編集後に `systemctl start palworld` で起動し直したか

## サーバー負荷に関わる設定

`PalSpawnNumRate` を上げすぎるとメモリ使用量が跳ね上がります。8GBプランで運用しているなら1.5倍以内が無難です。人数や倍率を上げてサーバーが不安定になった場合の対処は[サーバー構築記事のメモリ不足対策](/blog/palworld-server-guide/)を参照してください。

## まとめ

- 編集は「停止 → 編集 → 起動」の順番が鉄則
- フレンド鯖は `DeathPenalty=Item` と孵化時間短縮だけでも快適さが激変する
- 倍率系の上げすぎはメモリと相談。スペックの目安は[VPS比較記事](/blog/game-vps-comparison/)へ
