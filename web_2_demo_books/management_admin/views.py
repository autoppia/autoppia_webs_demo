from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
from django.conf import settings
import time
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@require_POST
def reset_database(request):
    """
    API endpoint to reset and reseed the database.
    Only available in development mode for security.
    Accepts optional headers: X-WebAgent-Id and X-Validator-Id. If both provided,
    the management command will perform a filtered deletion of events matching
    web_agent_id AND validator_id before resetting other DB objects.
    """
    # Security check: Only allow in development
    if not settings.DEBUG:
        return JsonResponse(
            {
                "status": "error",
                "message": "This endpoint is only available in development mode",
            },
            status=403,
        )

    start_time = time.time()
    success = True
    error_message = None

    # Prefer header values if present
    web_agent_id = request.headers.get("X-WebAgent-Id") or request.META.get("HTTP_X_WEBAGENT_ID")
    validator_id = request.headers.get("X-Validator-Id") or request.META.get("HTTP_X_VALIDATOR_ID")

    # If one of the IDs was provided, require both to avoid accidental broad deletes
    if (web_agent_id and not validator_id) or (validator_id and not web_agent_id):
        msg = "Both web_agent_id and validator_id must be provided together to perform a filtered reset."
        logger.warning(msg + " Received web_agent_id=%s validator_id=%s", web_agent_id, validator_id)
        return JsonResponse({"status": "error", "message": msg}, status=400)

    logger.info("reset_database called (web2) with web_agent_id=%s validator_id=%s", web_agent_id, validator_id)

    try:
        cmd_kwargs = {"force": True}
        if web_agent_id and validator_id:
            cmd_kwargs["web_agent_id"] = web_agent_id
            cmd_kwargs["validator_id"] = validator_id

        logger.debug("Calling reset_db (web2) with kwargs: %s", cmd_kwargs)
        call_command("reset_db", **cmd_kwargs)
    except Exception as e:
        success = False
        error_message = str(e)
        logger.exception("reset_db command failed (web2): %s", e)

    end_time = time.time()
    duration = round(end_time - start_time, 2)

    if success:
        message = f"Database reset completed successfully in {duration} seconds"
        logger.info(message)
        return JsonResponse({"status": "success", "message": message, "web_agent_id": web_agent_id, "validator_id": validator_id})
    else:
        message = f"Database reset failed after {duration} seconds: {error_message}"
        logger.error(message)
        return JsonResponse({"status": "error", "message": message}, status=500)
