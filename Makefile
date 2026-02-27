up:
	docker compose up --build

up-d:
	docker compose up -d --build

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=200