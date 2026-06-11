def is_valid_id(id_string):
    """Validates that an ID contains only alphanumeric characters and is not empty."""
    return id_string.isalnum() and len(id_string) > 0

def is_valid_name(name_string):
    """Validates that a name is not empty."""
    return len(name_string.strip()) > 0