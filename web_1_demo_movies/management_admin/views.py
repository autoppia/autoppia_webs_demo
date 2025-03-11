from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
from django.conf import settings
import subprocess
import sys
import os
import time
import threading


@csrf_exempt
@require_POST
def reset_database(request):
    """
    API endpoint to reset and reseed the database.
    Only available in development mode for security.
    """
    # Security check: Only allow in development
    if not settings.DEBUG:
        return JsonResponse({
            'status': 'error',
            'message': 'This endpoint is only available in development mode'
        }, status=403)

    # Optional: Add authentication requirement
    # if not request.user.is_superuser:
    #     return JsonResponse({
    #         'status': 'error',
    #         'message': 'You must be a superuser to reset the database'
    #     }, status=403)

    # Start the reset process in a separate thread
    # This prevents timeout issues when resetting large databases
    def reset_process():
        start_time = time.time()
        success = True
        error_message = None

        try:
            # Call our custom reset_db command with --force to skip confirmation
            call_command('reset_db', force=True)
        except Exception as e:
            success = False
            error_message = str(e)

        end_time = time.time()
        duration = round(end_time - start_time, 2)

        # Log the result
        if success:
            print(f"Database reset completed successfully in {duration} seconds")
        else:
            print(f"Database reset failed after {duration} seconds: {error_message}")

    # Start the reset thread
    thread = threading.Thread(target=reset_process)
    thread.daemon = True
    thread.start()

    # Return immediately with a message that the process has started
    return JsonResponse({
        'status': 'success',
        'message': 'Database reset initiated. This may take a few minutes to complete.'
    })
