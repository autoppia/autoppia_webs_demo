from events.models import Event


def create_event(user, event_name, data=None, web_agent_id=None, validator_id=None):
    """
    Create an event in the database.

    Args:
        user (User): The user associated with the event (can be None).
        event_name (str): The type/name of the event (must match an Event.event_name choice).
        data (dict): Additional data to store with the event.
        web_agent_id (str): Identifier of the web agent that produced the event.
        validator_id (str): Identifier of the validator associated with the event.
    """
    Event.objects.create(
        event_name=event_name,
        user=user,
        data=data or {},
        web_agent_id=web_agent_id,
        validator_id=validator_id,
    )
