# Nova AI

Монолитен проект с Next.js frontend и Python FastAPI backend.

## Структура

```
nova-ai/
├── frontend/        # Next.js приложение
├── backend/         # Python FastAPI сервер
├── .gitignore       # Git ignore файл
└── README.md        # Този файл
```

## Frontend

Next.js приложение в папката `frontend/`.

### Инсталация

```bash
cd frontend
npm install
npm run dev
```

## Backend

Python FastAPI сервер в папката `backend/`.

### Инсталация

```bash
cd backend
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Development

Всеки проект има своя окружение и зависимости.
