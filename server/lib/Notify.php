<?php
declare(strict_types=1);

/**
 * Notifiche di sicurezza (blocco globale, nuovo dispositivo).
 * Canale consigliato: email via Resend (API HTTPS, chiave in config.php → notify.resend_api_key).
 * In alternativa: SMTP dell'hosting (PHPMailer se installato, altrimenti mail()) o Telegram.
 * Non solleva mai eccezioni: un problema di notifica non deve bloccare il login.
 */
final class Notify
{
    public static function send(string $subject, string $text): void
    {
        try {
            $n = (array) Util::cfg('notify', []);
            if (!empty($n['telegram_bot_token']) && !empty($n['telegram_chat_id'])) self::telegram($n, "*$subject*\n$text");
            if (!empty($n['mail_to'])) {
                if (!empty($n['resend_api_key'])) self::resend($n, $subject, $text);
                else self::mail($n, $subject, $text);
            }
        } catch (Throwable $e) {
            error_log('[sulcis notify] ' . $e->getMessage());
        }
    }

    private static function telegram(array $n, string $text): void
    {
        $ch = curl_init('https://api.telegram.org/bot' . $n['telegram_bot_token'] . '/sendMessage');
        curl_setopt_array($ch, [
            CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5,
            CURLOPT_POSTFIELDS => http_build_query(['chat_id' => $n['telegram_chat_id'], 'text' => $text, 'parse_mode' => 'Markdown']),
        ]);
        curl_exec($ch);
        curl_close($ch);
    }

    /** Resend: POST https://api.resend.com/emails. Il mittente deve essere su un dominio verificato in Resend. */
    private static function resend(array $n, string $subject, string $text): void
    {
        $from = $n['mail_from'] ?: 'Sulcis Rent <noreply@' . (parse_url((string) Util::cfg('site_url'), PHP_URL_HOST) ?: 'localhost') . '>';
        $to = array_values(array_filter(array_map('trim', explode(',', (string) $n['mail_to']))));
        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5,
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $n['resend_api_key'], 'Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode(['from' => $from, 'to' => $to, 'subject' => $subject, 'text' => $text], JSON_UNESCAPED_UNICODE),
        ]);
        $res = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code < 200 || $code >= 300) error_log('[sulcis notify] Resend HTTP ' . $code . ' ' . substr((string) $res, 0, 200));
    }

    private static function mail(array $n, string $subject, string $text): void
    {
        if (class_exists('PHPMailer\\PHPMailer\\PHPMailer') && !empty($n['smtp_host'])) {
            $m = new PHPMailer\PHPMailer\PHPMailer(true);
            $m->isSMTP();
            $m->Host = $n['smtp_host'];
            $m->Port = (int) ($n['smtp_port'] ?? 587);
            $m->SMTPAuth = !empty($n['smtp_user']);
            $m->Username = $n['smtp_user'] ?? '';
            $m->Password = $n['smtp_pass'] ?? '';
            $m->SMTPSecure = $n['smtp_secure'] ?? 'tls';
            $m->CharSet = 'UTF-8';
            $m->setFrom($n['mail_from'] ?: $n['mail_to']);
            $m->addAddress($n['mail_to']);
            $m->Subject = $subject;
            $m->Body = $text;
            $m->send();
            return;
        }
        $from = $n['mail_from'] ?: 'noreply@' . (parse_url((string) Util::cfg('site_url'), PHP_URL_HOST) ?: 'localhost');
        @mail($n['mail_to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $text, "From: $from\r\nContent-Type: text/plain; charset=UTF-8");
    }
}
