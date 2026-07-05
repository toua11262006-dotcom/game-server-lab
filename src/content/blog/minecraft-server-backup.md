---
title: 'マイクラサーバーの自動バックアップ設定|cronで毎日ワールドを守る【コピペOK】'
description: 'マイクラサーバーのワールドを毎日自動でバックアップする方法を解説。cronとシェルスクリプトで7世代保存、容量管理まで自動化します。統合版・Palworldにも応用できる汎用構成です。'
pubDate: '2026-07-06'
heroImage: '../../assets/eyecatch/minecraft-server-backup.png'
---

ワールドデータは一度壊れたら戻りません。原因はディスク障害だけでなく、Modの更新ミス、電源断による書き込み中断、うっかり `/fill` の誤爆など日常に転がっています。筆者もModを1つ抜いた瞬間にワールドの一部が消えた経験があり、それ以来バックアップは全サーバーで自動化しています。

この記事のスクリプトをコピペすれば、**毎日自動で7世代分のバックアップ**が取れるようになります。

## 方針: 停止snapshotが一番確実

マイクラは稼働中もワールドを書き込み続けるため、動いたままコピーすると壊れたバックアップができることがあります。確実なのは「**サーバーを止めて → コピーして → 起動する**」方法です。深夜4時に実行すれば、停止時間は1〜2分。誰も気づきません。

## 手順1: バックアップスクリプトを作る

[構築ガイド](/blog/minecraft-server-guide/)の構成(`/opt/minecraft`、systemdサービス名 `minecraft`)を前提にしています。パスが違う場合は冒頭の変数だけ直してください。

```bash
cat > /opt/minecraft/backup.sh << 'EOF'
#!/bin/bash
set -eu

SERVER_DIR=/opt/minecraft
BACKUP_DIR=/opt/backups/minecraft
SERVICE=minecraft
KEEP=7   # 保存する世代数

mkdir -p "$BACKUP_DIR"

# サーバー停止(プレイヤーの書き込みを止める)
systemctl stop "$SERVICE"

# ワールドと設定を圧縮保存
tar -czf "$BACKUP_DIR/world_$(date +%F_%H%M).tar.gz" \
    -C "$SERVER_DIR" world server.properties

# サーバー再開
systemctl start "$SERVICE"

# 古い世代を削除(最新KEEP件だけ残す)
ls -1t "$BACKUP_DIR"/world_*.tar.gz | tail -n +$((KEEP + 1)) | xargs -r rm --

echo "backup done: $(date)"
EOF

chmod +x /opt/minecraft/backup.sh
```

ポイントは `set -eu` と再起動の順序です。万一 `tar` が失敗してもスクリプトが止まるだけで、`Restart=on-failure` を設定済みならサーバーは次の起動機会に復帰します。

## 手順2: 動作確認

cronに載せる前に、必ず手動で1回実行します。

```bash
/opt/minecraft/backup.sh
ls -lh /opt/backups/minecraft/
```

`world_2026-07-06_0400.tar.gz` のようなファイルができていれば成功です。

## 手順3: cronで毎日実行する

```bash
crontab -e
# 以下を追加(毎日AM4:00に実行)
0 4 * * * /opt/minecraft/backup.sh >> /var/log/mc-backup.log 2>&1
```

ログをファイルに残しておくと、失敗に気づけます。数日運用したら `cat /var/log/mc-backup.log` で動いているか確認してください。

## 手順4: 復元方法(ここまで確認して完成)

バックアップは「復元できること」を確認して初めて意味があります。

```bash
systemctl stop minecraft
cd /opt/minecraft
mv world world_broken            # 壊れたワールドを退避
tar -xzf /opt/backups/minecraft/world_2026-07-06_0400.tar.gz -C /opt/minecraft
systemctl start minecraft
```

一度テスト復元をやっておくと、本番の事故時に慌てません。

## 容量の目安

ワールドの圧縮後サイズは、遊び込んだサーバーで数百MB〜数GB程度です。7世代で足りるかは `df -h` でディスク残量を見て調整してください。VPSのディスクが心もとない場合は、`KEEP=3` に減らすか、`scp`/`rclone` で手元PCやクラウドストレージに逃がす構成に発展させられます。

## 統合版・Palworldへの応用

スクリプトの変数を変えるだけで、そのまま流用できます。

- **統合版**: `SERVER_DIR=/opt/bedrock`、`SERVICE=bedrock`、tar対象を `worlds` に([統合版サーバーの立て方](/blog/minecraft-bedrock-server/))
- **Palworld**: `SERVICE=palworld`、tar対象を `Pal/Saved` に([Palworldサーバーの立て方](/blog/palworld-server-guide/))

## まとめ

- バックアップは「停止 → tar → 起動」を深夜にcron実行が確実
- 世代管理とログ出力までスクリプトに含めておくと放置できる
- 取ったバックアップは一度**テスト復元**して初めて完成
