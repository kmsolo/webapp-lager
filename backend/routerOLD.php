<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

$dbFile = __DIR__ . "/db/database.sqlite";

try {
    $pdo = new PDO("sqlite:" . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            location TEXT NOT NULL DEFAULT ''
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
        )
    ");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Kunde inte ansluta till databasen.",
        "details" => $e->getMessage()
    ]);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";

$routePath = trim(
    $_GET["route"] ?? "products",
    "/"
);

$id = filter_var(
    $_GET["id"] ?? null,
    FILTER_VALIDATE_INT
);

if ($method === "GET" && $routePath === "products") {
    $stmt = $pdo->query("
        SELECT id, name, stock, location
        FROM products
        ORDER BY id DESC
    ");
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === "GET" && $routePath === "deliveries") {
    $stmt = $pdo->query("
        SELECT id, productId, quantity, createdAt
        FROM deliveries
        ORDER BY id DESC
    ");
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === "POST" && $routePath === "deliveries") {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["error" => "Ogiltig JSON."]);
        exit;
    }

    $productId = filter_var($input["productId"] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($input["quantity"] ?? null, FILTER_VALIDATE_INT);

    if (!$productId || !$quantity || $productId < 1 || $quantity < 1) {
        http_response_code(400);
        echo json_encode(["error" => "productId och quantity måste vara positiva heltal."]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO deliveries (productId, quantity)
        VALUES (:productId, :quantity)
    ");
    $stmt->execute([
        ":productId" => $productId,
        ":quantity" => $quantity,
    ]);

    http_response_code(201);
    echo json_encode([
        "message" => "Inleverans sparad.",
        "id" => (int)$pdo->lastInsertId()
    ]);
    exit;
}
if ($method === "GET" && $routePath === "product") {
    if ($id === false || $id === null || $id < 1) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ett giltigt produkt-ID krävs.",
        ]);

        exit;
    }

    $stmt = $pdo->prepare("
        SELECT id, name, stock, location
        FROM products
        WHERE id = :id
    ");

    $stmt->execute([
        ":id" => $id,
    ]);

    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);

        echo json_encode([
            "error" => "Produkten hittades inte.",
        ]);

        exit;
    }

    echo json_encode($product);
    exit;
}
if ($method === "PUT" && $routePath === "products") {
    if ($id === false || $id === null || $id < 1) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ett giltigt produkt-ID krävs.",
        ]);

        exit;
    }

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ogiltig JSON.",
        ]);

        exit;
    }

    $name = trim($input["name"] ?? "");
    $stock = filter_var(
        $input["stock"] ?? null,
        FILTER_VALIDATE_INT
    );
    $location = trim($input["location"] ?? "");

    if (
        $name === "" ||
        $stock === false ||
        $stock < 0 ||
        $location === ""
    ) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ogiltiga produktdata.",
        ]);

        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE products
        SET name = :name,
            stock = :stock,
            location = :location
        WHERE id = :id
    ");

    $stmt->execute([
        ":name" => $name,
        ":stock" => $stock,
        ":location" => $location,
        ":id" => $id,
    ]);

    echo json_encode([
        "message" => "Produkten uppdaterades.",
    ]);

    exit;
}
if ($method === "PUT" && $routePath === "products") {
    if ($id === false || $id === null || $id < 1) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ett giltigt produkt-ID krävs.",
        ]);

        exit;
    }

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ogiltig JSON.",
        ]);

        exit;
    }

    $name = trim($input["name"] ?? "");
    $stock = filter_var(
        $input["stock"] ?? null,
        FILTER_VALIDATE_INT
    );
    $location = trim($input["location"] ?? "");

    if (
        $name === "" ||
        $stock === false ||
        $stock < 0 ||
        $location === ""
    ) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ogiltiga produktdata.",
        ]);

        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE products
        SET name = :name,
            stock = :stock,
            location = :location
        WHERE id = :id
    ");

    $stmt->execute([
        ":name" => $name,
        ":stock" => $stock,
        ":location" => $location,
        ":id" => $id,
    ]);

    echo json_encode([
        "message" => "Produkten uppdaterades.",
    ]);

    exit;
}

if ($method === "DELETE" && $routePath === "products") {
    if ($id === false || $id === null || $id < 1) {
        http_response_code(400);

        echo json_encode([
            "error" => "Ett giltigt produkt-ID krävs.",
        ]);

        exit;
    }

    $stmt = $pdo->prepare("
        DELETE FROM products
        WHERE id = :id
    ");

    $stmt->execute([
        ":id" => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);

        echo json_encode([
            "error" => "Produkten hittades inte.",
        ]);

        exit;
    }

    echo json_encode([
        "message" => "Produkten togs bort.",
    ]);

    exit;
}


http_response_code(404);
echo json_encode(["error" => "Route hittades inte."]);