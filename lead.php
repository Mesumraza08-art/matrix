<?php
/*
 * Matrix Homes lead handler (quote, contact and chat forms).
 * Emails each inquiry, with any attachments, to LEAD_TO.
 * Runs on Hostinger shared hosting with PHP's built-in mail().
 */

const LEAD_TO   = 'matrixhomes@live.com';
const MAX_FILES = 6;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];

header('Content-Type: application/json');

function fail($code, $msg) { http_response_code($code); echo json_encode(['ok' => false, 'error' => $msg]); exit; }
function clean($v) { return trim(str_replace(["\r", "\0"], '', (string)$v)); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'method');
if (!empty($_POST['website'])) { echo json_encode(['ok' => true]); exit; } // honeypot

$kind  = preg_replace('/[^a-z]/', '', $_POST['kind'] ?? 'lead') ?: 'lead';
$ref   = preg_replace('/[^A-Z0-9-]/', '', $_POST['ref'] ?? '');
$email = filter_var(clean($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$name  = preg_replace('/[\r\n<>"]/', '', clean($_POST['name'] ?? ''));
if (!$email && empty($_POST['phone'])) fail(422, 'contact');

$labels = [
  'name' => 'Name', 'email' => 'Email', 'phone' => 'Phone', 'city' => 'City', 'postal' => 'Postal code',
  'area' => 'Project type', 'features' => 'Features', 'budget' => 'Budget', 'timeline' => 'Timeline',
  'description' => 'Description', 'message' => 'Message', 'notes' => 'Notes', 'consent' => 'Consent',
];
$lines = ["New " . $kind . " inquiry from matrixhomes.ca", "Reference: " . $ref, "Received: " . date('Y-m-d H:i T'), ""];
foreach ($_POST as $k => $v) {
  if (in_array($k, ['kind', 'ref', 'website'], true)) continue;
  $label = $labels[$k] ?? ucfirst(preg_replace('/[^a-zA-Z0-9_ -]/', '', $k));
  $lines[] = $label . ": " . clean(is_array($v) ? implode(', ', $v) : $v);
}
$body = implode("\n", $lines) . "\n";

/* attachments */
$files = [];
if (!empty($_FILES['files']) && is_array($_FILES['files']['name'])) {
  $f = $_FILES['files'];
  for ($i = 0; $i < count($f['name']) && count($files) < MAX_FILES; $i++) {
    if ($f['error'][$i] !== UPLOAD_ERR_OK || $f['size'][$i] > MAX_BYTES) continue;
    $type = mime_content_type($f['tmp_name'][$i]) ?: '';
    if (!in_array($type, ALLOWED, true)) continue;
    $files[] = ['name' => preg_replace('/[^\w.\- ]/', '_', basename($f['name'][$i])), 'type' => $type, 'data' => file_get_contents($f['tmp_name'][$i])];
  }
}

$host    = preg_replace('/^www\./', '', preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'matrixhomes.ca'));
$subject = 'Matrix Homes ' . ucfirst($kind) . ' inquiry' . ($name ? " - $name" : '') . ($ref ? " [$ref]" : '');
$headers = ["From: Matrix Homes Website <no-reply@$host>", 'MIME-Version: 1.0'];
if ($email) $headers[] = 'Reply-To: ' . ($name ? "\"$name\" " : '') . "<$email>";

if ($files) {
  $b = 'mh_' . bin2hex(random_bytes(8));
  $headers[] = "Content-Type: multipart/mixed; boundary=\"$b\"";
  $msg = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$body\r\n";
  foreach ($files as $file) {
    $msg .= "--$b\r\nContent-Type: {$file['type']}; name=\"{$file['name']}\"\r\nContent-Transfer-Encoding: base64\r\n"
          . "Content-Disposition: attachment; filename=\"{$file['name']}\"\r\n\r\n" . chunk_split(base64_encode($file['data'])) . "\r\n";
  }
  $msg .= "--$b--";
} else {
  $headers[] = 'Content-Type: text/plain; charset=UTF-8';
  $msg = $body;
}

if (!mail(LEAD_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $msg, implode("\r\n", $headers))) fail(500, 'mail');
echo json_encode(['ok' => true, 'ref' => $ref]);
