CREATE TABLE `weather-bot-db`.`cities` (
  `city_id` INT NOT NULL AUTO_INCREMENT,
  `city_name` VARCHAR(45) NOT NULL,
  `utcOffset` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`city_id`),
  UNIQUE INDEX `city_name_UNIQUE` (`city_name` ASC));

CREATE TABLE `weather-bot-db`.`chat_settings` (
  `id_chat_settings` INT NOT NULL AUTO_INCREMENT,
  `chat_id` BIGINT NOT NULL,
  `city_id` INT NULL,
  `locale` VARCHAR(15) NULL,
  `scheduled_hours` INT NULL,
  `scheduled_minutes` INT NULL,
  PRIMARY KEY (`id_chat_settings`),
  UNIQUE INDEX `chat_id_UNIQUE` (`chat_id` ASC),
  INDEX `city_idx` (`city_id` ASC),
  CONSTRAINT `city`
    FOREIGN KEY (`city_id`)
    REFERENCES `weather-bot-db`.`cities` (`city_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);
