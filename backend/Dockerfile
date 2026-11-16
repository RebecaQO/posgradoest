FROM serversideup/php:8.5-fpm-nginx

WORKDIR /var/www/html

# Copiar el proyecto completo permite ejecutar los scripts de Composer
# (incluido package:discover) durante la construcción de la imagen.
COPY --chown=www-data:www-data . /var/www/html

USER www-data
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

RUN php artisan storage:link

EXPOSE 8080
