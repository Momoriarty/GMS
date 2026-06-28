<?php
// Usage: php simulate_midtrans_webhook.php <pendaftaran_id> [gross_amount] [webhook_url]
// Example: php simulate_midtrans_webhook.php 123 50000 https://xxxx.ngrok.io/api/midtrans/webhook

function loadEnv($path)
{
    if (!file_exists($path)) return [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $data = [];
    foreach ($lines as $line) {
        if (preg_match('/^\s*#/', $line)) continue;
        if (!strpos($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v);
        $v = preg_replace('/^"|"$/', '', $v);
        $v = preg_replace("/^'|'$/", '', $v);
        $data[$k] = $v;
    }
    return $data;
}

$args = $argv;
array_shift($args); // script name

if (count($args) < 1) {
    echo "Usage: php simulate_midtrans_webhook.php <pendaftaran_id> [gross_amount] [webhook_url]\n";
    exit(1);
}

$pendaftaranId = $args[0];
$gross = $args[1] ?? '10000';
$webhook = $args[2] ?? null;

$env = loadEnv(__DIR__ . '/../.env');
$midtransKey = $env['MIDTRANS_SERVER_KEY'] ?? getenv('MIDTRANS_SERVER_KEY') ?: '';
$defaultWebhook = $env['MIDTRANS_NOTIFICATION_URL'] ?? getenv('MIDTRANS_NOTIFICATION_URL') ?: null;
if (!$webhook) {
    if ($defaultWebhook) $webhook = $defaultWebhook;
    else {
        fwrite(STDERR, "No webhook URL provided and MIDTRANS_NOTIFICATION_URL not found in .env\n");
        exit(1);
    }
}

$orderId = 'ORDER-' . $pendaftaranId . '-' . time();
$statusCode = '200';

$signature = hash('sha512', $orderId . $statusCode . $gross . $midtransKey);

$payload = [
    'transaction_status' => 'settlement',
    'order_id' => $orderId,
    'status_code' => $statusCode,
    'gross_amount' => (string) $gross,
    'signature_key' => $signature,
];

echo "Posting simulated webhook to: $webhook\n";
echo "Payload:\n" . json_encode($payload, JSON_PRETTY_PRINT) . "\n";

$opts = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode($payload),
        'ignore_errors' => true,
        'timeout' => 10,
    ]
];

$context = stream_context_create($opts);
$result = @file_get_contents($webhook, false, $context);
$meta = $http_response_header ?? [];

echo "Response headers:\n" . implode("\n", $meta) . "\n";
echo "Response body:\n" . ($result ?: '(no body)') . "\n";

exit(0);
