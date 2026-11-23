<?php
declare(strict_types=1);

/**
 * Sanificazione del testo ricco (descrizioni, FAQ) con una whitelist minima:
 * p, br, strong/b, em/i, ul, ol, li, a[href http(s)/mailto/tel].
 * Tutto il resto viene rimosso (script/style/iframe col contenuto; altri tag «sciolti» lasciando il testo).
 * Nessun attributo sopravvive tranne href (validato); ai link si aggiunge rel="noopener nofollow".
 */
final class Sanitizer
{
    private const ALLOWED = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'a'];
    private const DROP = ['script', 'style', 'iframe', 'object', 'embed', 'template', 'svg', 'math', 'form', 'input', 'button', 'textarea', 'select', 'noscript', 'link', 'meta', 'base', 'title', 'head'];

    public static function html(string $html): string
    {
        if (trim($html) === '') return '';
        if (!str_contains($html, '<')) return '<p>' . htmlspecialchars($html, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '</p>';
        $doc = new DOMDocument('1.0', 'UTF-8');
        $prev = libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="UTF-8"?><!DOCTYPE html><html><body><div id="__root">' . $html . '</div></body></html>', LIBXML_NONET | LIBXML_NOBLANKS);
        libxml_clear_errors();
        libxml_use_internal_errors($prev);
        $root = $doc->getElementById('__root');
        if (!$root) return '';
        self::clean($root, $doc);
        $out = '';
        foreach (iterator_to_array($root->childNodes) as $child) $out .= $doc->saveHTML($child);
        return trim($out);
    }

    private static function clean(DOMNode $node, DOMDocument $doc): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMComment || $child instanceof DOMProcessingInstruction || $child instanceof DOMCdataSection) { $node->removeChild($child); continue; }
            if (!$child instanceof DOMElement) continue;
            $tag = strtolower($child->tagName);
            if (in_array($tag, self::DROP, true)) { $node->removeChild($child); continue; }
            self::clean($child, $doc);
            if (!in_array($tag, self::ALLOWED, true)) {
                // «scioglie» il tag mantenendo i figli (testo)
                while ($child->firstChild) $node->insertBefore($child->firstChild, $child);
                $node->removeChild($child);
                continue;
            }
            $href = $tag === 'a' ? trim($child->getAttribute('href')) : '';
            foreach (iterator_to_array($child->attributes) as $attr) $child->removeAttribute($attr->nodeName);
            if ($tag === 'a') {
                if ($href !== '' && preg_match('#^(https?://|mailto:|tel:)#i', $href) && !preg_match('/[\s"\'<>]/', $href)) {
                    $child->setAttribute('href', $href);
                    $child->setAttribute('rel', 'noopener nofollow');
                    if (preg_match('#^https?://#i', $href)) $child->setAttribute('target', '_blank');
                } else {
                    while ($child->firstChild) $node->insertBefore($child->firstChild, $child);
                    $node->removeChild($child);
                }
            }
        }
    }
}
