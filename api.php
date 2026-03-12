<?php
include_once 'config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

// --- RUTAS DE USUARIOS ---
if ($action == 'register' && $method == 'POST') {
    $pass = password_hash($data['password'], PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre_completo, email_corporativo, password_hash) VALUES (?, ?, ?)");
    if ($stmt->execute([$data['nombre_completo'], $data['email_corporativo'], $pass])) {
        echo json_encode(["status" => "ok"]);
    } else { echo json_encode(["error" => "Error al registrar"]); }
}

if ($action == 'login' && $method == 'POST') {
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email_corporativo = ?");
    $stmt->execute([$data['email_corporativo']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user && password_verify($data['password'], $user['password_hash'])) {
        echo json_encode(["status" => "ok", "usuario" => $user['nombre_completo']]);
    } else { http_response_code(401); echo json_encode(["error" => "Error de acceso"]); }
}

// --- RUTAS DE TAREAS ---
if ($action == 'tareas') {
    if ($method == 'POST') {
        $stmt = $pdo->prepare("INSERT INTO tareas (descripcion, fecha_vencimiento, estado) VALUES (?, ?, 'Pendiente')");
        if ($stmt->execute([$data['descripcion'], $data['fecha_vencimiento']])) {
            echo json_encode(["status" => "ok"]);
        }
    } else if ($method == 'GET') {
        $stmt = $pdo->query("SELECT * FROM tareas ORDER BY creado_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>