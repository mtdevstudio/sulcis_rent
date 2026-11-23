<?php
declare(strict_types=1);
// Anteprima della scheda pubblica anche per bozze e auto nascoste (solo con sessione).
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
Http::allow(['GET']);
$car = Cars::get(Http::qInt('id'), true) ?? throw new HttpError(404, 'Auto non trovata');
$public = Publisher::publicCar($car);
// in anteprima il prezzo si vede come apparirebbe; la targa e le note non ci sono mai
Http::json(['car' => $public, 'status' => $car['status'], 'catalog' => Catalog::catalog()]);
