cd /usr/src/travis/telegram-weather-bot
git reset --hard
git checkout master
git pull

pm2 stop telegram-weather-bot
pm2 start pm2.config.json
