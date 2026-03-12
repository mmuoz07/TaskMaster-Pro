<?php
$host = "localhost";
$port = "5432";
$dbname = "taskmsaterpro"; 
$user = "postgres";
$password = "tu_password"; // <--- CAMBIA ESTO POR TU CLAVE DE POSTGRES

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    die(json_encode(["error" => "Error de conexión: " . $e->getMessage()]));
}
?>