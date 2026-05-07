from collections.abc import Iterable


CITY_COORDINATES: dict[str, tuple[float, float]] = {
    "tunis": (36.8065, 10.1815),
    "sfax": (34.7406, 10.7603),
    "sousse": (35.8256, 10.6411),
    "nabeul": (36.4510, 10.7350),
    "kairouan": (35.6781, 10.0963),
}

REGION_COORDINATES: dict[str, tuple[float, float]] = {
    "tunis": (36.8065, 10.1815),
    "sfax": (34.7406, 10.7603),
    "sousse": (35.8256, 10.6411),
    "nabeul": (36.4510, 10.7350),
    "kairouan": (35.6781, 10.0963),
}


def normalize_place_name(value: str | None) -> str | None:
    if not value:
        return None
    return " ".join(value.strip().lower().split())


def resolve_coordinates(
    city: str | None = None,
    region: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
) -> tuple[float, float] | None:
    if latitude is not None and longitude is not None:
        return (latitude, longitude)

    city_key = normalize_place_name(city)
    if city_key and city_key in CITY_COORDINATES:
        return CITY_COORDINATES[city_key]

    region_key = normalize_place_name(region)
    if region_key and region_key in REGION_COORDINATES:
        return REGION_COORDINATES[region_key]

    return None


def average_coordinates(coordinates: Iterable[tuple[float, float]]) -> tuple[float, float] | None:
    values = list(coordinates)
    if not values:
        return None
    latitude = sum(item[0] for item in values) / len(values)
    longitude = sum(item[1] for item in values) / len(values)
    return (latitude, longitude)
