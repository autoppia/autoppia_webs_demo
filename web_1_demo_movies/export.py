from faker import Faker
import re
from typing import Optional, Dict, Any, Type
from pydantic import BaseModel
from movieapp.models import Genre, Movie, Comment, UserProfile, ContactMessage

# List of available models
MODELS = [Genre, Movie, Comment, UserProfile, ContactMessage]

# ================ Event Classes with Nested Validation Criteria ================


class Event(BaseModel):
    """Base event class for all event types"""

    type: str
    timestamp: int
    web_agent_id: int
    user_id: Optional[int] = None

    class ValidationCriteria(BaseModel):
        pass

    def validate(self) -> bool:
        """Check if this event meets the validation criteria"""
        # Base implementation just checks event type
        return self.type == self.__class__.__name__

    @classmethod
    def code(cls) -> str:
        """Return the source code of the class"""
        import inspect

        return inspect.getsource(cls)


class FilmDetailEvent(Event):
    """Event triggered when a film detail page is viewed"""

    movie: Movie

    class ValidationCriteria(BaseModel):
        """Validation criteria for FilmDetailEvent"""

        title: Optional[str] = None
        genre: Optional[str] = None
        director: Optional[str] = None
        year: Optional[int] = None

        class Config:
            title = "Film Detail Validation"
            description = "Validates that a film detail page was viewed with specific attributes"

    def validate(self, criteria: ValidationCriteria) -> bool:
        """Validate this FilmDetailEvent against the criteria"""
        if not super().validate(criteria):
            return False

        # Helper function for text matching based on match_type
        def text_matches(actual, expected):
            return actual.lower() == expected.lower()
            if not expected:
                return True
            if criteria.match_type == "exact":
                return actual.lower() == expected.lower()
            elif criteria.match_type == "contains":
                return expected.lower() in actual.lower()
            elif criteria.match_type == "regex":
                return bool(re.search(expected, actual))
            return False

        # Check movie attributes
        if criteria.title and not text_matches(self.movie.title, criteria.title):
            return False
        if criteria.genre and not text_matches(self.movie.genre, criteria.genre):
            return False
        if criteria.director and not text_matches(self.movie.director, criteria.director):
            return False
        # Check year if specified (exact match only)
        if criteria.movie_year is not None and self.movie.year != criteria.movie_year:
            return False

        return True


class SearchEvent(Event):
    """Event triggered when a search is performed"""

    query: str

    class ValidationCriteria(Event.ValidationCriteria):
        """Validation criteria for SearchEvent"""

        query: Optional[str] = None

        class Config:
            title = "Search Validation"
            description = "Validates that a search was performed with specific query"

    def validate(self, criteria: ValidationCriteria) -> bool:
        """Validate this SearchEvent against the criteria"""
        if not super().validate(criteria):
            return False
        if not criteria.query:
            return True

        # Match query based on match_type
        if criteria.match_type == "exact":
            return self.query.lower() == criteria.query.lower()
        elif criteria.match_type == "contains":
            return criteria.query.lower() in self.query.lower()
        elif criteria.match_type == "regex":
            return bool(re.search(criteria.query, self.query))

        return False


class RegistrationEvent(Event):
    """Event triggered when a user registration is completed"""

    # No additional validation needed, just check the event type


class LoginEvent(Event):
    """Event triggered when a user logs in"""

    username: str
    # No additional validation needed, just check the event type


# ================ Available Events and Use Cases ================
EVENTS = [FilmDetailEvent, SearchEvent, RegistrationEvent, LoginEvent]

USE_CASES = [
    {
        "name": "Registration",
        "prompt_template": "Fill registration form and register",
        "event": RegistrationEvent,
        "success_criteria": "Task is successful if the user is actually registered",
        "tests": [
            {
                "type": "CheckEventTest",
                "event_name": "RegistrationEvent",
                "event_criteria": {},  # No special criteria needed
                "code": RegistrationEvent.code(),
            },
        ],
    },
    {
        "name": "Search film",
        "prompt_template": "Search for a film with {filters} and open its detail page",
        "event": FilmDetailEvent,
        "success_criteria": "Task is successful when there is an event of type 'FilmDetailEvent' emitted with the correct movie associated",
        "tests": [
            {"type": "CheckEventTest", "event_name": "FilmDetailEvent", "validation_schema": FilmDetailEvent.ValidationCriteria.model_json_schema(), "code": FilmDetailEvent.code()},
        ],
    },
]


# ================ Relevant Data ================

RELEVANT_DATA = {"User for Login": {"email": "admin@moviesapp.com", "password": "admin123"}, "User for Registration": {"email": "new-user@moviesapp.com", "password": "admin123"}}


# ================ Data Generation Functions ================

# Initialize Faker
faker = Faker()

MODEL_GENERATION_MAP: Dict[str, Any] = {
    "Genre": lambda faker: {"name": faker.word()},
    "Movie": lambda faker: {"id": faker.random_number(digits=6), "title": faker.catch_phrase(), "genre": faker.word(), "director": faker.name(), "release_year": int(faker.year())},
    "Comment": lambda faker: {"user_id": faker.random_number(digits=6), "movie_id": faker.random_number(digits=6), "content": faker.text(), "created_at": faker.iso8601()},
    "UserProfile": lambda faker: {"user_id": faker.random_number(digits=6), "username": faker.user_name(), "email": faker.email(), "created_at": faker.iso8601()},
    "ContactMessage": lambda faker: {"message_id": faker.random_number(digits=6), "sender_email": faker.email(), "message": faker.text(max_nb_chars=200), "sent_at": faker.iso8601()},
}


def generate_random_movie_instance():
    """Generate a random movie instance for testing"""
    return Movie(id=faker.random_number(), title=faker.catch_phrase(), genre=faker.word(), director=faker.name(), release_year=int(faker.year()))


def generate_random_instance(model_class: Type[Any]) -> Any:
    """Generates a random instance of the specified model class"""
    model_name = model_class.__name__
    generator = MODEL_GENERATION_MAP.get(model_name)
    if not generator:
        raise ValueError(f"No generator defined for model {model_name}")
    instance_data = generator(faker)
    return model_class(**instance_data)


def model_to_schema(model_class: Any) -> Dict[str, str]:
    """Extracts schema (field names and types) from a model class for event validation"""
    return {field: field_type.__name__ for field, field_type in model_class.__annotations__.items()}
