<?php
declare(strict_types=1);

$dbFile = __DIR__ . "/db/database.sqlite";

try {
    $pdo = new PDO("sqlite:" . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    echo "Tabeller i databasen:\n\n";

    $stmt = $pdo->query("
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    ");

    $tables = $stmt->fetchAll();

    if (!$tables) {
        echo "Inga tabeller hittades.\n";
        exit;
    }

    foreach ($tables as $table) {
        $tableName = $table["name"];
        echo "=== {$tableName} ===\n";

        $infoStmt = $pdo->query("PRAGMA table_info($tableName)");
        $columns = $infoStmt->fetchAll();

        foreach ($columns as $column) {
            echo sprintf(
                "%s | %s | notnull=%s | default=%s | pk=%s\n",
                $column["name"],
                $column["type"],
                $column["notnull"],
                $column["dflt_value"] ?? "",
                $column["pk"]
            );
        }

        echo "\n";
    }
} catch (PDOException $e) {
    echo "Kunde inte läsa databasen: " . $e->getMessage() . "\n";
}