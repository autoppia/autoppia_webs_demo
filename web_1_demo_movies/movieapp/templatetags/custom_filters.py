from django import template
from urllib.parse import urlencode

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


@register.simple_tag
def preserve_params(v1_seed=None, v2_seed=None, **kwargs):
    """
    Build query string preserving seed and v2-seed parameters.
    
    Usage:
        {% preserve_params INITIAL_SEED V2_SEED search=search_query %}
    
    Returns query string like: ?seed=1&v2-seed=23&search=query
    """
    params = {}
    
    # Add v2-seed if provided and not None/empty
    if v2_seed is not None and v2_seed != '':
        try:
            # Ensure it's a valid number
            int(v2_seed)
            params['v2-seed'] = str(v2_seed)
        except (ValueError, TypeError):
            pass
    
    # Add v1 seed if provided and not None/empty
    if v1_seed is not None and v1_seed != '':
        try:
            # Ensure it's a valid number
            int(v1_seed)
            params['seed'] = str(v1_seed)
        except (ValueError, TypeError):
            pass
    
    # Add any additional parameters
    for key, value in kwargs.items():
        if value and value != '':  # Only add non-empty values
            params[key] = str(value)
    
    if params:
        return '?' + urlencode(params)
    return ''
