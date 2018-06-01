source "`dirname $0`"/../../private/db.env

cat "`dirname $0`"/init-db.sql | docker exec -i docker_db_1 mysql --protocol=tcp -u weather-bot --password=${MYSQL_PASSWORD} weather-bot-db
