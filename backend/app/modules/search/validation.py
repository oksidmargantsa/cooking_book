from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute

from app.core.errors import AppError

_MESSAGES = {
    "int_parsing": "Введите целое число",
    "int_parsing_size": "Число слишком большое",
    "greater_than": "Значение должно быть больше {gt}",
    "greater_than_equal": "Значение должно быть не меньше {ge}",
    "less_than_equal": "Значение должно быть не больше {le}",
    "too_long": "Допустимо не более {max_length} значений",
}


class SearchRoute(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Awaitable[Response]]:
        handler = super().get_route_handler()

        async def handle(request: Request) -> Response:
            try:
                return await handler(request)
            except RequestValidationError as error:
                issue = error.errors()[0]
                location = issue["loc"]
                field = ".".join(str(part) for part in location[1:])
                if field == "recipe_id":
                    field = "id"
                if issue["type"] == "value_error":
                    message = issue["msg"].removeprefix("Value error, ")
                else:
                    template = _MESSAGES.get(issue["type"], "Некорректное значение")
                    message = template.format(**issue.get("ctx", {}))
                raise AppError(422, "VALIDATION_ERROR", message, field or None) from None

        return handle
