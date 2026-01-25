# App Store Screenshot Generator

Веб-сервис для генерации локализованных скриншотов App Store с мокапами iPhone.

## Возможности

- **Загрузка скриншотов** — drag & drop, до 10 изображений
- **Редактор текстов** — заголовки для каждого скриншота
- **Настройка стилей** — цвет фона, текста, шрифт, размер, позиционирование
- **Превью в реальном времени** — Canvas-рендеринг с эффектом iPhone-мокапа
- **Автоматический перевод** — 39 языков App Store через OpenAI API
- **Экспорт в ZIP** — папки по языкам (`en-US/`, `ru-RU/`, `de-DE/` и т.д.)

## Поддерживаемые размеры

| Устройство | Размер |
|------------|--------|
| iPhone 16 Pro Max (6.9") | 1320 × 2868 px |
| iPhone 11 Pro Max (6.5") | 1284 × 2778 px |

## Языки App Store (39 локалей)

en-US, en-GB, en-AU, en-CA, de-DE, fr-FR, fr-CA, es-ES, es-MX, it-IT, pt-BR, pt-PT, nl-NL, ru-RU, ja-JP, ko-KR, zh-Hans, zh-Hant, ar-SA, ca-ES, cs-CZ, da-DK, el-GR, fi-FI, he-IL, hi-IN, hr-HR, hu-HU, id-ID, ms-MY, no-NO, pl-PL, ro-RO, sk-SK, sv-SE, th-TH, tr-TR, uk-UA, vi-VN

## Стек технологий

- **React 18** + **TypeScript**
- **Vite** — сборка
- **Canvas API** — генерация изображений
- **JSZip** — создание архивов
- **OpenAI SDK** — перевод текстов (gpt-4o-mini)

## Структура проекта

```
aso/
├── src/
│   ├── components/
│   │   ├── ScreenshotUploader.tsx   # Загрузка скриншотов
│   │   ├── TextEditor.tsx           # Редактор заголовков
│   │   ├── StyleEditor.tsx          # Настройка стилей
│   │   ├── Preview.tsx              # Canvas-превью
│   │   ├── LanguageSelector.tsx     # Выбор языков
│   │   └── ExportButton.tsx         # Экспорт + прогресс
│   ├── services/
│   │   ├── openai.ts                # Перевод через OpenAI
│   │   ├── canvas.ts                # Генерация изображений
│   │   └── zip.ts                   # Создание ZIP-архива
│   ├── types/
│   │   └── index.ts                 # TypeScript типы
│   ├── constants/
│   │   └── languages.ts             # Список языков
│   ├── App.tsx                      # Главный компонент
│   └── main.tsx                     # Точка входа
├── Dockerfile                       # Docker-образ для деплоя
├── nginx.conf                       # Конфиг nginx для SPA
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Запуск

```bash
# Установка зависимостей
npm install

# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Превью продакшен-сборки
npm run preview
```

## Использование

1. Загрузите скриншоты приложения (PNG/JPG)
2. Введите заголовки для каждого скриншота
3. Настройте стили (цвета, шрифт, позиция текста)
4. Выберите целевые языки для локализации
5. Введите OpenAI API ключ
6. Нажмите "Export" — получите ZIP-архив со всеми локализациями

## Docker

```bash
# Сборка образа
docker build -t aso-screenshot-generator .

# Запуск контейнера
docker run -p 8080:80 aso-screenshot-generator
```

## Лицензия

MIT
