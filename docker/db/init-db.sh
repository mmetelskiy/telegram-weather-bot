source ../../private/db.env

cat "`dirname $0`"/init-db.sql | docker exec -i docker_db_1 mysql -u weather-bot --password=${MYSQL_PASSWORD} weather-bot-db
