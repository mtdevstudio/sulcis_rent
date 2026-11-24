<?php
declare(strict_types=1);

/**
 * Validazione lato server con schema esplicito. Le chiavi non previste sono RIFIUTATE.
 *
 * Regole: ['type' => string|int|number|bool|enum|array|object|l10n|date|url|hex|slug,
 *          'required' => bool, 'nullable' => bool, 'max' => int, 'min' => int|float,
 *          'pattern' => regex, 'values' => [...] (enum), 'fields' => schema (object),
 *          'items' => regola (array), 'maxItems' => int, 'html' => bool (l10n/string: sanifica)]
 * Le stringhe vengono trim-mate; '' su campo non obbligatorio diventa null.
 */
final class Validator
{
    private array $errors = [];

    public static function check(array $data, array $schema): array
    {
        $v = new self();
        $out = $v->object($data, $schema, '');
        if ($v->errors) throw new HttpError(422, 'Dati non validi', $v->errors);
        return $out;
    }

    private function object($data, array $schema, string $path): array
    {
        if (!is_array($data) || (array_is_list($data) && $data !== [])) { $this->errors[rtrim($path, '.') ?: '_'] = 'oggetto atteso'; return []; }
        $out = [];
        foreach ($data as $k => $_) {
            if (!is_string($k) || !array_key_exists($k, $schema)) $this->errors[$path . $k] = 'campo non previsto';
        }
        foreach ($schema as $key => $rule) {
            $p = $path . $key;
            $present = array_key_exists($key, $data);
            $val = $present ? $data[$key] : null;
            if (is_string($val)) { $val = trim($val); if ($val === '' && empty($rule['required'])) $val = null; }
            if ($val === null) {
                if (!empty($rule['required'])) $this->errors[$p] = 'obbligatorio';
                elseif ($present) $out[$key] = null;
                continue;
            }
            $out[$key] = $this->value($val, $rule, $p);
        }
        return $out;
    }

    private function value($val, array $r, string $p)
    {
        $t = $r['type'];
        switch ($t) {
            case 'string':
            case 'slug':
            case 'hex':
            case 'url':
            case 'date':
                if (!is_string($val)) return $this->err($p, 'testo atteso');
                if (!mb_check_encoding($val, 'UTF-8')) return $this->err($p, 'codifica non valida');
                $val = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $val) ?? '';
                $max = $r['max'] ?? 1000;
                if (mb_strlen($val) > $max) return $this->err($p, "massimo $max caratteri");
                if (isset($r['min']) && mb_strlen($val) < $r['min']) return $this->err($p, "minimo {$r['min']} caratteri");
                if ($t === 'slug' && !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $val)) return $this->err($p, 'solo minuscole, numeri e trattini');
                if ($t === 'hex' && !preg_match('/^#[0-9a-fA-F]{6}$/', $val)) return $this->err($p, 'colore #RRGGBB');
                if ($t === 'date' && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $val) || !checkdate((int) substr($val, 5, 2), (int) substr($val, 8, 2), (int) substr($val, 0, 4)))) return $this->err($p, 'data AAAA-MM-GG');
                if ($t === 'url' && (!filter_var($val, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $val))) return $this->err($p, 'URL http(s) non valido');
                if (isset($r['pattern']) && !preg_match($r['pattern'], $val)) return $this->err($p, $r['patternMsg'] ?? 'formato non valido');
                if (!empty($r['html'])) $val = Sanitizer::html($val);
                return $val;
            case 'int':
                if (is_string($val) && preg_match('/^-?\d{1,10}$/', $val)) $val = (int) $val;
                if (!is_int($val)) return $this->err($p, 'numero intero atteso');
                if (isset($r['min']) && $val < $r['min']) return $this->err($p, "minimo {$r['min']}");
                if (isset($r['max']) && $val > $r['max']) return $this->err($p, "massimo {$r['max']}");
                return $val;
            case 'number':
                if (is_string($val) && is_numeric(str_replace(',', '.', $val))) $val = (float) str_replace(',', '.', $val);
                if (!is_int($val) && !is_float($val)) return $this->err($p, 'numero atteso');
                if (isset($r['min']) && $val < $r['min']) return $this->err($p, "minimo {$r['min']}");
                if (isset($r['max']) && $val > $r['max']) return $this->err($p, "massimo {$r['max']}");
                return is_float($val) ? round($val, 2) : $val;
            case 'bool':
                if (!is_bool($val)) return $this->err($p, 'sì/no atteso');
                return $val;
            case 'enum':
                if (!is_string($val) || !in_array($val, $r['values'], true)) return $this->err($p, 'valore non ammesso');
                return $val;
            case 'l10n':
                // lingue del sito: it (base), en, fr, es, pt, pl
                $one = ['type' => 'string', 'max' => $r['max'] ?? 1000, 'html' => $r['html'] ?? false];
                $sub = ['it' => $one, 'en' => $one, 'fr' => $one, 'es' => $one, 'pt' => $one, 'pl' => $one];
                $o = $this->object($val, $sub, $p . '.');
                $o = array_filter($o, static fn($x) => $x !== null && $x !== '');
                return $o ?: null;
            case 'object':
                return $this->object($val, $r['fields'], $p . '.');
            case 'array':
                if (!is_array($val) || !array_is_list($val)) return $this->err($p, 'elenco atteso');
                if (count($val) > ($r['maxItems'] ?? 100)) return $this->err($p, 'troppi elementi');
                $out = [];
                foreach ($val as $i => $item) {
                    $o = $this->value(is_string($item) ? trim($item) : $item, $r['items'], "$p.$i");
                    if ($o !== null && $o !== '') $out[] = $o;
                }
                return !empty($r['unique']) ? array_values(array_unique($out, SORT_REGULAR)) : $out;
        }
        return $this->err($p, 'tipo sconosciuto');
    }

    private function err(string $p, string $m) { $this->errors[$p] = $m; return null; }
}
