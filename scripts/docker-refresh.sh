#!/usr/bin/env sh
# Dopo `npm run build` in locale: riaggancia out/ al container e rigenera i JSON pubblici.
set -e
mkdir -p .local/media .local/data
cp public/media/.htaccess .local/media/.htaccess
cp public/data/.htaccess .local/data/.htaccess
chmod -R a+rwX .local
docker compose up -d --force-recreate web >/dev/null 2>&1
docker compose exec -T web php /var/www/sulcis-private/server/cli/migrate.php
