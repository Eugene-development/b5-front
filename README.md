# b5-front

Frontend приложение для Bonus5 с интеграцией GraphQL API.

## Настройка GraphQL API

Для работы с GraphQL API необходимо настроить переменную окружения:

```bash
# Создайте .env файл в корне проекта
VITE_B5_API_URL=https://api.bonus5.ru/graphql

# Для локальной разработки
# VITE_B5_API_URL=http://localhost:8000/graphql
```

**Важно:** Убедитесь, что URL указывает на GraphQL endpoint вашего b5-api2 бэкенда.

## Разработка

После создания проекта и установки зависимостей с `npm install`, запустите сервер разработки:

```sh
npm run dev

# или запустите сервер и откройте приложение в новой вкладке браузера
npm run dev -- --open
```

## Сборка

Для создания production версии приложения:

```sh
npm run build
```

Вы можете предварительно просмотреть production сборку с `npm run preview`.

> Для развертывания приложения может потребоваться установить [адаптер](https://svelte.dev/docs/kit/adapters) для вашей целевой платформы.
