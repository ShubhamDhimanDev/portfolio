# Local development image for the pure-PHP api/ backend.
# Runs PHP's built-in server (php -S), mirroring api/router.php's own
# documented dev workflow, so no Apache/nginx/.htaccess handling is needed.
FROM php:8.3-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
        unzip \
        git \
        libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring fileinfo \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-progress --prefer-dist

COPY . .

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "router.php"]
