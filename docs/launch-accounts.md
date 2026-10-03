# Запуск кабинетов uwbelieve

Один Next.js deployment обслуживает основной сайт, `artists.uwbelieve.com` и
`label.uwbelieve.com`. Оба кабинета используют **один существующий проект Supabase**.
Ниже действия, которые нужно выполнить перед открытием доступа пользователям.

## 1. Развернуть базу

В Supabase → SQL Editor того же проекта последовательно выполните файлы целиком:

1. `supabase/migrations/20261002103108_artist_platform.sql`
2. `supabase/migrations/20261002213408_artist_team_access.sql`
3. `supabase/migrations/20261003093000_demo_release_flow.sql`

Каждый файл рассчитан на один запуск. Первый сохраняет существующие демо-заявки,
создаёт релизы, профили, роли, приватный бакет `label-artwork`, правила доступа и
рабочие операции. Второй добавляет команды артистов и управление сотрудниками лейбла.
Если первые два файла уже применялись, выполните только третий. Он связывает
одобренные демо с релизами и добавляет ссылки на WAV/FLAC для каждого трека.
Не запускайте повторно применённые файлы. Проверка:

```sql
select to_regclass('public.label_releases') as releases,
       to_regclass('public.label_team_members') as artist_teams,
       (select count(*) from information_schema.columns
        where table_schema = 'public' and table_name = 'label_tracks'
          and column_name = 'audio_url') as audio_link_column;
```

Если запрос SQL Editor завершился ошибкой, сохраните полный текст ошибки и не
повторяйте отдельные части файла. Не добавляйте схему `label_private` в Data API.
После применения выполните Supabase Security Advisors.

## 2. Настроить Supabase Auth

В Authentication → Providers включите Email и подтверждение адреса. Для реальной
доставки писем настройте SMTP. В Authentication → URL Configuration задайте Site URL
`https://uwbelieve.com` и добавьте Redirect URLs:

```text
https://artists.uwbelieve.com/auth/callback
https://label.uwbelieve.com/auth/callback
http://localhost:3000/auth/callback
```

Ссылка подтверждения/сброса открывается в том же браузере и на том же поддомене,
с которого отправлен запрос. Сессии поддоменов разделены: при переходе из одного
кабинета в другой пользователь входит ещё раз.

## 3. Настроить один deployment и домены

Подключите все три домена к **одному** Next.js приложению у вашего хостинга:

```text
uwbelieve.com           → лендинг
artists.uwbelieve.com   → кабинет артиста
label.uwbelieve.com     → кабинет лейбла
```

В DNS внесите записи, которые выдаст хостинг для каждого поддомена, и дождитесь
выдачи HTTPS сертификатов. Корень поддомена автоматически открывает нужный кабинет;
прямые пути `/artists/...` и `/admin/...` также работают.

Задайте в настройках deployment переменные из `.env.example`:

```text
SUPABASE_URL=https://ВАШ-ПРОЕКТ.supabase.co
SUPABASE_PUBLISHABLE_KEY=ВАШ_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=ВАШ_СЕРВЕРНЫЙ_КЛЮЧ
SITE_URL=https://uwbelieve.com
ARTIST_HOSTNAME=artists.uwbelieve.com
ADMIN_HOSTNAME=label.uwbelieve.com
ADMIN_URL=https://label.uwbelieve.com/admin/demos
```

`SUPABASE_SERVICE_ROLE_KEY` — секрет только для сервера, нужен для проверки
обложек. Не добавляйте его в переменные `NEXT_PUBLIC_*` и репозиторий.
При необходимости заполните `RESEND_API_KEY`, `EMAIL_FROM` и
`DEMO_NOTIFICATION_EMAIL` для уведомлений о демо. После изменения переменных
пересоберите и перезапустите приложение. Локально используйте `.env.local`,
`npm ci`, `npm run dev`; в production — `npm ci`, `npm run build`, `npm run start`
или стандартный процесс вашего Next.js хостинга.

## 4. Создать первый аккаунт администратора

Зарегистрируйтесь на `artists.uwbelieve.com/login`, подтвердите email и войдите.
Это создаст профиль. Затем в SQL Editor выполните, подставив **свой** email:

```sql
insert into public.label_roles (user_id, role)
select id, 'admin' from auth.users
where lower(email) = lower('YOUR_EMAIL@example.com')
  and email_confirmed_at is not null
on conflict do nothing;
```

Войдите на `label.uwbelieve.com/login`. Дальше администратор выдаёт доступ
сотрудникам через **Label team**. Сотрудник предварительно регистрируется и
подтверждает email на артистском поддомене; администратор добавляет его как
`Label manager` или `Admin`. Менеджер проверяет релизы и демо, администратор
также управляет аккаунтами команды.

Артист сначала отправляет демо на странице **Submissions**. После одобрения лейблом
на заявке появляется **Add release details**; один одобренный демо-запрос создаёт
один релиз. Черновик можно сохранить без аудиоссылок, но перед отправкой на
проверку для каждого трека нужна HTTPS-ссылка на файл WAV или FLAC в выбранном
артистом внешнем хранилище. Файлы на сервер uwbelieve не загружаются.

Артист управляет своими коллегами в **Artist team**. Коллега сначала создаёт
собственный подтверждённый аккаунт. `Editor` редактирует существующие черновики,
загружает обложки и отправляет релизы; `Viewer` читает релизы и историю. Новый
релиз создаёт владелец; удаление участника сразу отзывает его доступ к релизам.

## 5. Проверить перед открытием пользователям

- Войти на обоих поддоменах; без сессии кабинет должен переводить на вход.
- Отправить демо из кабинета артиста и одобрить его в демо-инбоксе лейбла.
- Открыть **Add release details**, создать черновик, загрузить обложку и отправить
  релиз с HTTPS-ссылкой на WAV/FLAC для каждого трека.
- В аккаунте менеджера открыть очередь, запросить изменения и утвердить релиз.
- Добавить участника артиста как Viewer: он видит релиз, но не сохраняет правки.
- Поменять роль на Editor: сохранение черновика доступно; после удаления доступ исчезает.
- Проверить письмо подтверждения и восстановление пароля с обоих поддоменов.
- Проверить Supabase Security Advisors и HTTPS всех доменов.

Локальные автоматические проверки: `npm run test:platform` и `npm run build`.
Они проверяют миграции и приложение, но не заменяют этот тест реальных Auth-сессий,
SMTP, DNS и настроек хостинга.
