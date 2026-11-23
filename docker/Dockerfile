# Ambiente locale che simula l'hosting condiviso: Apache 2.4 + PHP 8.1 (mod_php) + .htaccess.
FROM php:8.1-apache
RUN apt-get update && apt-get install -y --no-install-recommends libwebp-dev libjpeg62-turbo-dev libpng-dev libfreetype6-dev libzip-dev libicu-dev \
 && docker-php-ext-configure gd --with-webp --with-jpeg --with-freetype \
 && docker-php-ext-install -j"$(nproc)" gd pdo_mysql zip intl exif \
 && a2enmod rewrite headers deflate expires \
 && rm -rf /var/lib/apt/lists/*
# Come su Aruba: AllowOverride All, docroot = cartella pubblica, cartella privata accanto alla docroot
RUN sed -ri 's!/var/www/html!/var/www/html!g' /etc/apache2/sites-available/000-default.conf \
 && printf '<Directory /var/www/html>\n  AllowOverride All\n  Require all granted\n</Directory>\n' > /etc/apache2/conf-enabled/sulcis.conf \
 && printf 'upload_max_filesize=16M\npost_max_size=20M\nmemory_limit=256M\nmax_execution_time=60\ndisplay_errors=Off\nexpose_php=Off\n' > /usr/local/etc/php/conf.d/sulcis.ini
RUN mkdir -p /var/www/sulcis-private/runtime/logs /var/www/sulcis-private/runtime/tmp && chown -R www-data:www-data /var/www/sulcis-private/runtime
