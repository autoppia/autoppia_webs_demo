from django import template

register = template.Library()


@register.filter
def split(value, arg):
    """Split a string into a list based on a delimiter"""
    return value.split(arg)


@register.filter
def modulo(value, arg):
    """Returns the remainder of value divided by arg"""
    return int(value) % int(arg)


@register.filter
def lower(value):
    """Convert a string to lowercase"""
    if isinstance(value, str):
        return value.lower()
    elif isinstance(value, list):
        return [item.lower() if isinstance(item, str) else item for item in value]
    return value
