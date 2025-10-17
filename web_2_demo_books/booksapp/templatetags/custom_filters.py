from django import template
from django.utils.http import urlencode

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


@register.simple_tag(takes_context=True)
def url_with_seed(context, url_name, *args, **kwargs):
    """
    Generate URL with seed parameter preserved from request
    Usage: {% url_with_seed 'booksapp:index' %}
    """
    from django.urls import reverse
    url = reverse(url_name, args=args, kwargs=kwargs)
    seed = context.get('INITIAL_SEED', 1)
    dynamic_enabled = context.get('DYNAMIC_HTML_ENABLED', False)
    if dynamic_enabled and seed:
        url = f"{url}?seed={seed}"
    return url


@register.simple_tag(takes_context=True)
def preserve_seed(context):
    """
    Returns the seed query parameter string if dynamic HTML is enabled
    Usage: <a href="{% url 'some_view' %}{% preserve_seed %}">Link</a>
    """
    seed = context.get('INITIAL_SEED', 1)
    dynamic_enabled = context.get('DYNAMIC_HTML_ENABLED', False)
    if dynamic_enabled and seed:
        return f"?seed={seed}"
    return ""
