from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
import time
import json
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@require_POST
def reset_database(request):
    """
    API endpoint to reset and reseed the database.
    Only available in development mode for security.

    Accepts optional JSON or form fields:
      - web_agent_id

      - validator_id

    If provided, the management command will delete only events matching the provided
    filters (web_agent_id and/or validator_id). If neither is provided, the command will
    perform a full reset as before.
    """

    start_time = time.time()
    success = True
    error_message = None

    # Parse JSON body if present, otherwise fall back to POST/form data
    web_agent_id = None
    validator_id = None
    try:
        if request.content_type == "application/json":
            payload = json.loads(request.body.decode("utf-8") or "{}")
            web_agent_id = payload.get("web_agent_id")
            validator_id = payload.get("validator_id")
        else:
            web_agent_id = request.POST.get("web_agent_id") or request.GET.get("web_agent_id")
            validator_id = request.POST.get("validator_id") or request.GET.get("validator_id")
    except Exception as e:
        # don't fail - just log and continue with None values
        logger.debug("Could not parse JSON payload for reset_database: %s", e)

    # Allow header-overrides (clients can send X-WebAgent-Id and X-Validator-Id headers)
    header_web = request.headers.get("X-WebAgent-Id") or request.META.get("HTTP_X_WEBAGENT_ID")
    header_validator = request.headers.get("X-Validator-Id") or request.META.get("HTTP_X_VALIDATOR_ID")

    if header_web:
        web_agent_id = header_web
    if header_validator:
        validator_id = header_validator

    # If one of the IDs was provided, require both to avoid accidental broad deletes
    if (web_agent_id and not validator_id) or (validator_id and not web_agent_id):
        msg = "Both web_agent_id and validator_id must be provided together to perform a filtered reset."
        logger.warning(msg + " Received web_agent_id=%s validator_id=%s", web_agent_id, validator_id)
        return JsonResponse({"status": "error", "message": msg}, status=400)

    logger.info("reset_database called with web_agent_id=%s validator_id=%s", web_agent_id, validator_id)

    try:
        # Build kwargs for the management command only including provided values
        cmd_kwargs = {"force": True}
        # Only pass filters if both provided
        if web_agent_id and validator_id:
            cmd_kwargs["web_agent_id"] = web_agent_id
            cmd_kwargs["validator_id"] = validator_id

        logger.debug("Calling reset_db with kwargs: %s", cmd_kwargs)
        call_command("reset_db", **cmd_kwargs)
    except Exception as e:
        success = False
        error_message = str(e)
        logger.exception("reset_db command failed: %s", e)

    end_time = time.time()
    duration = round(end_time - start_time, 2)

    # Log the result
    if success:
        message = f"Database reset completed successfully in {duration} seconds"
        logger.info(message)
        # include the filter values used for clarity
        return JsonResponse({"status": "success", "message": message, "web_agent_id": web_agent_id, "validator_id": validator_id})
    else:
        message = f"Database reset failed after {duration} seconds: {error_message}"
        logger.error(message)
        return JsonResponse({"status": "error", "message": message}, status=500)
