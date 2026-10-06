<?php
declare(strict_types=1);

$dbFile = __DIR__ . "/database.sqlite";

try {
    $pdo = new PDO("sqlite:" . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("PRAGMA foreign_keys = ON");

    $stmt = $pdo->prepare("
        INSERT INTO deliveries (productId, quantity, delivery_date, comment)
        VALUES (:productId, :quantity, :delivery_date, :comment)
    ");

    $rows = [
        [
            "productId" => 1,
            "quantity" => 10,
            "delivery_date" => "2026-08-23",
            "comment" => "Första testleveransen",
        ],
        [
            "productId" => 2,
            "quantity" => 5,
            "delivery_date" => "2026-08-23",
            "comment" => "Andra testleveransen",
        ],
        [
            "productId" => 3,
            "quantity" => 8,
            "delivery_date" => "2026-08-23",
            "comment" => "Tredje testleveransen",
        ],
    ];

    foreach ($rows as $row) {
        $stmt->execute([
            ":productId" => $row["productId"],
            ":quantity" => $row["quantity"],
            ":delivery_date" => $row["delivery_date"],
            ":comment" => $row["comment"],
        ]);
    }

    echo "Seedade deliveries klart.\n";
} catch (PDOException $e) {
    echo "Fel: " . $e->getMessage() . "\n";
}