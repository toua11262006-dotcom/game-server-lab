---
title: 'マイクラサーバーが重い時の対策7選|Paper化と起動フラグでTPSを取り戻す'
description: 'マイクラサーバーのラグ・カクつきの原因の調べ方と対策を、効果の大きい順に解説。Paper移行、Aikarフラグ、描画距離の調整、ワールド事前生成など、実際に効果を確認した手順だけを紹介します。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/minecraft-server-lag-fix.png'
---

サーバーを建てて人が増えてくると、必ずぶつかるのが「重い」問題です。ブロック破壊がワンテンポ遅れる、モブがワープする、チャットに「Can't keep up!」が流れる——この記事では、筆者が実際に効果を確認した対策を**効果の大きい順**に紹介します。

## まず原因を切り分ける

対策の前に、重さの種類を見分けます。

- **TPSの低下(サーバー側)**: モブがワープする、時計が遅れる、全員が同時に重い → この記事の対策が効きます
- **回線ラグ(ネットワーク)**: 特定の人だけ重い → その人の回線かサーバーの位置の問題
- **FPSの低下(クライアント側)**: 画面がカクつくが動作は正常 → プレイヤーのPC性能の問題

TPS(サーバーの処理速度、正常値20)は `/tick query`(1.20.3以降)や後述のsparkで確認できます。**TPSが18を切っていたらサーバー側の問題**です。

## 対策1: Paperに移行する(効果: 特大)

公式のserver.jarを使っているなら、互換サーバーの **Paper** に乗り換えるだけで劇的に改善します。Paperは公式サーバーの最適化版で、ワールドデータはそのまま使えます。

```bash
cd /opt/minecraft
systemctl stop minecraft
cp -r world world_backup_$(date +%F)   # 必ずバックアップ

# papermc.io/downloads から使用中のバージョンのjarを取得
wget -O paper.jar 'PaperのダウンロードURL'
```

systemdの `ExecStart` のjar名を `paper.jar` に変えて起動するだけです。バニラの挙動とほぼ完全互換で、体感できるレベルでTPSが安定します。

## 対策2: Aikarフラグを設定する(効果: 大)

Java のガベージコレクション(メモリ掃除)による定期的なカクつきを抑える、コミュニティ標準の起動オプションです。`ExecStart` を次のようにします(メモリ4GB割り当ての例)。

```
/usr/bin/java -Xms4G -Xmx4G -XX:+UseG1GC -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 \
  -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:InitiatingHeapOccupancyPercent=15 \
  -jar paper.jar nogui
```

ポイントは **`-Xms` と `-Xmx` を同じ値にする**ことと、その値をVPSの物理メモリより1GB以上小さくすることです。

## 対策3: 描画距離を下げる(効果: 大)

`server.properties` の2つの値がサーバー負荷に直結します。

```properties
view-distance=8        # デフォルト10。8で十分遊べます
simulation-distance=6  # モブや作物が動く範囲。ここが重さの本体
```

`simulation-distance` を10→6にするだけで、モブ処理の負荷が半分近くになります。プレイ感への影響は意外なほど小さいです。

## 対策4: ワールドを事前生成する(効果: 中)

探索時のラグの主犯は「新しい地形の生成」です。プラグイン(Mod)の **Chunky** で先に生成しておけば、探索がスムーズになります。

```
# サーバーコンソールで(半径5000ブロックを事前生成)
chunky radius 5000
chunky start
```

生成中は負荷が上がるので、人がいない深夜に回すのがおすすめです。

## 対策5: sparkで犯人を特定する(効果: 調査用)

ここまでで改善しない場合は、プロファイラの **spark**(プラグイン/Mod両対応)を入れて計測します。

```
/spark profiler start --timeout 60
```

60秒後に出力されるURLを開くと、何が処理時間を食っているかが一覧できます。筆者の環境では、特定チャンクに溜まった大量のアイテムエンティティ(自動farmの放置)が原因だったことがあります。ホッパーや`entity`系の数値が大きい場合は、該当の装置を疑ってください。

## 対策6: エンティティ数を制限する(効果: 中)

Paperなら `config/paper-world-defaults.yml` でモブ上限やアイテムのまとめ処理を調整できます。まずはスポーン上限を少し下げるだけでも効きます(`spawn-limits`)。

## 対策7: それでもダメならスペック不足(効果: 根本)

対策1〜6を入れてもTPSが安定しないなら、原因はメモリ・CPU不足です。目安は[VPS比較記事](/blog/game-vps-comparison/)の必要スペック表の通りで、Mod鯖や10人超えなら8GBが現実ラインです。VPSならプラン変更だけで済むので、買い替えより気軽に上げられます。

## まとめ(効く順)

1. Paper移行 — 最優先。これだけで解決することも多い
2. Aikarフラグ + `simulation-distance` 引き下げ
3. Chunkyで事前生成、sparkで計測
4. 改善しなければメモリ増強

サーバーが安定したら、事故に備えて[自動バックアップの設定](/blog/minecraft-server-backup/)もどうぞ。
