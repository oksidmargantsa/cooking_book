# Cooking Book

Бэкенд каталога рецептов на FastAPI и PostgreSQL.

[Правила проекта](CODING_GUIDELINES.md).

## Локальный запуск

Скопируйте `backend/.env.example` в `backend/.env` и запустите Docker Compose из корня репозитория.

```powershell
Copy-Item backend/.env.example backend/.env
docker compose up -d api
```

В обычном и dev-режиме Compose сначала применяет миграции Alembic к PostgreSQL 16, затем загружает русский справочник из `backend/data/ingredients_ru.csv`. Swagger доступен по адресу [localhost:8000/docs](http://localhost:8000/docs).

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up -d api
```

Для базы, ранее созданной через Alembic, достаточно обычного запуска. Если существующую dev-базу создал `app.dev_schema`, проверьте, что в ней уже есть таблицы `users`, `refresh_tokens` и `folders`, а таблица `alembic_version` отсутствует. Для такой базы один раз отметьте исходную ревизию, затем запустите сервисы с тем же томом PostgreSQL.

```powershell
docker compose -f compose.yaml -f compose.dev.yaml run --rm migrate sh -ec 'pip install -r requirements.txt && alembic stamp 0001_users_auth_folders'
docker compose -f compose.yaml -f compose.dev.yaml up -d api
```

## Справочник ингредиентов

Источник данных — [Wikidata, CC0 1.0](https://www.wikidata.org/wiki/Wikidata:Copyright). [Запрос SPARQL](backend/data/ingredients_ru.sparql) выбирает русские названия пищевых продуктов из составов блюд и объекты, явно помеченные как пищевые ингредиенты. В CSV и PostgreSQL сохраняются название и идентификатор Wikidata. Каталог пригоден как стартовый набор, его полнота и точность зависят от разметки Wikidata.

Чтобы загрузить CSV повторно после ручного изменения, запустите `docker compose exec -T api python -m app.cli seed-ingredients`. Импорт добавляет новые записи, сохраняя существующие строки и их идентификаторы. PostgreSQL проверяет уникальность названий без учёта регистра и различия между `ё` и `е`.

Чтобы скачать свежий срез Wikidata, из `backend/` выполните `python -m pip install -r requirements.txt`, затем `python -m app.cli download-ingredients`. Команда обновит CSV. Просмотрите изменения перед импортом и пересоздайте стартовый дамп для публикации.

## Стартовый дамп PostgreSQL

[`database/base.sql`](database/base.sql) содержит схему, ревизию Alembic и данные справочника. Таблицы пользователей, токенов, папок и рецептов в снимке пустые. Команды ниже восстанавливают снимок в новую базу `recipes_base`. Запускайте их из корня репозитория.

```powershell
docker compose up -d --wait postgres
docker compose exec -T postgres createdb -U recipes recipes_base
docker compose cp database/base.sql postgres:/tmp/cooking_book_base.sql
docker compose exec -T postgres psql -X -U recipes -d recipes_base -v ON_ERROR_STOP=1 --single-transaction -f /tmp/cooking_book_base.sql
docker compose exec -T postgres psql -U recipes -d recipes_base -c 'SELECT count(*) FROM ingredients;'
```

Чтобы открыть восстановленную базу в приложении, укажите `postgresql+asyncpg://recipes:recipes@postgres:5432/recipes_base` в `DATABASE_URL` в файле `backend/.env` и выполните `docker compose up -d api`.

Для пересборки дампа после изменения CSV используйте отдельный Compose-проект с пустым томом. В снимок попадут схема и стартовый справочник без данных разработчиков.

```powershell
$baselineProject = "cooking-book-baseline-$(Get-Date -Format yyyyMMddHHmmss)"
docker compose -p $baselineProject up -d --wait postgres
docker compose -p $baselineProject run --rm -e DATABASE_URL=postgresql+asyncpg://recipes:recipes@postgres:5432/recipes migrate
docker compose -p $baselineProject exec -T postgres pg_dump -U recipes -d recipes --no-owner --no-privileges --file=/tmp/cooking_book_base.sql
docker compose -p $baselineProject cp postgres:/tmp/cooking_book_base.sql database/base.sql
docker compose -p $baselineProject down -v
```
