"""Единый файл констант: лимиты из НФТ и сроки жизни токенов (HLD, раздел 9)."""

from datetime import timedelta

# --- Аккаунт (F_Auth_1, NF_Limit_38) ---
LOGIN_MIN_LEN = 3
LOGIN_MAX_LEN = 32
# Требований к паролю в HLD нет — значения предложены разработчиком, согласовать с командой.
PASSWORD_MIN_LEN = 8
PASSWORD_MAX_LEN = 128

# --- Токены ---
ACCESS_TOKEN_TTL = timedelta(minutes=15)
REFRESH_TOKEN_TTL = timedelta(days=30)

# --- Папки (F_Fav_1–7, NF_Limit_44, 46, 47) ---
FAVORITES_FOLDER_NAME = "Избранное"
FOLDER_NAME_MIN_LEN = 1
FOLDER_NAME_MAX_LEN = 150
MAX_USER_FOLDERS = 50  # пользовательских, без «Избранного»
MAX_FAVORITES_RECIPES = 1000  # рецептов в «Избранном»
MAX_FOLDER_RECIPES = 100  # рецептов в пользовательской папке

# --- Пагинация (по умолчанию страницы по 3, подгрузка блоками по 10) ---
DEFAULT_PER_PAGE = 3
MAX_PER_PAGE = 50
