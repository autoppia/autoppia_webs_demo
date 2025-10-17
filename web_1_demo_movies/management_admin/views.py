from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
import time


@csrf_exempt
@require_POST
def reset_database(request):
    """
    API endpoint to reset and reseed the database.
    Only available in development mode for security.
    """

    start_time = time.time()
    success = True
    error_message = None

    try:
        # Call our custom reset_db command with --force to skip confirmation
        call_command("reset_db", force=True)
    except Exception as e:
        success = False
        error_message = str(e)

    end_time = time.time()
    duration = round(end_time - start_time, 2)

    # Log the result
    if success:
        message = f"Database reset completed successfully in {duration} seconds"
        print(message)
        return JsonResponse({"status": "success", "message": message})
    else:
        message = f"Database reset failed after {duration} seconds: {error_message}"
        print(message)
        return JsonResponse({"status": "error", "message": message}, status=500)
