from events.models import Event


def create_event(user, event_name, web_agent_id, validator_id=None, data=None):
    """
    Create an event in the database.

    Args:
        user (User): The user associated with the event (can be None).
        event_name (str): The type of the event (must be one of EventName choices).
        web_agent_id (str): The web agent identifier.
        validator_id (str): Optional validator identifier.
        data (dict): Additional data to store with the event.
    """
    Event.objects.create(
        event_name=event_name,
        user=user,
        data=data or {},  # Use empty dict if no data is provided
        web_agent_id=web_agent_id,
        validator_id=validator_id,
    )
