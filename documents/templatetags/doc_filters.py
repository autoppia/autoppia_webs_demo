from django import template

register = template.Library()

@register.filter
def split(value, key):
    """
    Returns the value split by key.
    """
    return value.split(key)

@register.filter
def endswith(value, arg):
    """
    Checks if a string ends with the specified suffix.
    Usage: {{ mystring|endswith:'suffix' }}
    """
    if value is None:
        return False
    return value.endswith(arg)

@register.filter
def get_item(dictionary, key):
    """
    Gets an item from a dictionary using the key.
    Usage: {{ mydict|get_item:item_key }}
    """
    if dictionary is None:
        return None
    return dictionary.get(key)

@register.filter
def get_extension(filename):
    """
    Returns the file extension from a filename.
    """
    return filename.split('.')[-1].upper() if '.' in filename else ''