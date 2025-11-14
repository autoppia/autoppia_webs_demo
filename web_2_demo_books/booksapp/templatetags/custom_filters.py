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


@register.filter
def get_structure_text(data, path):
    """Get text from structure variant data using dot notation path.
    
    Example: {{ STRUCTURE_VARIANT_DATA|get_structure_text:"navbar.home.text" }}
    """
    if not data:
        return ""
    
    try:
        parts = path.split(".")
        result = data
        for part in parts:
            if isinstance(result, dict) and part in result:
                result = result[part]
            else:
                return ""
        
        if isinstance(result, dict) and "text" in result:
            return result["text"]
        elif isinstance(result, str):
            return result
        return ""
    except Exception:
        return ""


@register.filter
def get_structure_id(data, path):
    """Get id from structure variant data using dot notation path.
    
    Example: {{ STRUCTURE_VARIANT_DATA|get_structure_id:"navbar.home.id" }}
    """
    if not data:
        return ""
    
    try:
        parts = path.split(".")
        result = data
        for part in parts:
            if isinstance(result, dict) and part in result:
                result = result[part]
            else:
                return ""
        
        if isinstance(result, dict) and "id" in result:
            return result["id"]
        return ""
    except Exception:
        return ""


@register.filter
def get_structure_aria_label(data, path):
    """Get aria-label from structure variant data using dot notation path.
    
    Example: {{ STRUCTURE_VARIANT_DATA|get_structure_aria_label:"navbar.home.aria-label" }}
    """
    if not data:
        return ""
    
    try:
        parts = path.split(".")
        result = data
        for part in parts:
            if isinstance(result, dict) and part in result:
                result = result[part]
            else:
                return ""
        
        if isinstance(result, dict) and "aria-label" in result:
            return result["aria-label"]
        return ""
    except Exception:
        return ""


@register.filter
def get_structure_placeholder(data, path):
    """Get placeholder from structure variant data using dot notation path.
    
    Example: {{ STRUCTURE_VARIANT_DATA|get_structure_placeholder:"login.username.placeholder" }}
    """
    if not data:
        return ""
    
    try:
        parts = path.split(".")
        result = data
        for part in parts:
            if isinstance(result, dict) and part in result:
                result = result[part]
            else:
                return ""
        
        if isinstance(result, dict) and "placeholder" in result:
            return result["placeholder"]
        return ""
    except Exception:
        return ""


@register.filter
def get_structure_label(data, path):
    """Get label from structure variant data using dot notation path.
    
    Example: {{ STRUCTURE_VARIANT_DATA|get_structure_label:"login.username.label" }}
    """
    if not data:
        return ""
    
    try:
        parts = path.split(".")
        result = data
        for part in parts:
            if isinstance(result, dict) and part in result:
                result = result[part]
            else:
                return ""
        
        if isinstance(result, dict) and "label" in result:
            return result["label"]
        return ""
    except Exception:
        return ""
