mysql:
	docker run --name mysql8 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret -d mysql:8.0

createuser:
	docker exec -it mysql8 mysql -uroot -p -e "\
		CREATE USER 'luv2shop' IDENTIFIED BY '1';\
		GRANT ALL PRIVILEGES ON * . * TO 'luv2shop';\
		"

createdb:
	docker exec -it mysql8 mysql -uluv2shop -p -e "\
		DROP SCHEMA IF EXISTS luv2shop;\
		CREATE SCHEMA luv2shop;\
		"

.PHONY: mysql createuser createdb