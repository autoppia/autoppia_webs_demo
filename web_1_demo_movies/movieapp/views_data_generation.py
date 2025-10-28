"""
Views for data generation functionality
"""

import json
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .data_generator import generate_movies_data, generate_genres_data
from .models import Movie, Genre

from loguru import logger


def data_generation_dashboard(request):
    """Dashboard for data generation management"""
    if not settings.ENABLE_DATA_GENERATION:
        messages.warning(request, "Data generation is not enabled. Set ENABLE_DATA_GENERATION=true to enable.")
        return redirect('movieapp:index')
    
    context = {
        'movies_count': Movie.objects.count(),
        'genres_count': Genre.objects.count(),
        'data_generation_enabled': settings.ENABLE_DATA_GENERATION,
        'api_url': settings.API_URL,
    }
    return render(request, 'data_generation/dashboard.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def generate_movies_api(request):
    """API endpoint to generate movies"""
    logger.info("API: generate_movies called")
    if not settings.ENABLE_DATA_GENERATION:
        logger.warning("API: generate_movies blocked - generation disabled")
        return JsonResponse({
            'success': False,
            'error': 'Data generation is not enabled'
        }, status=400)
    
    try:
        data = json.loads(request.body)
        count = data.get('count', 50)
        categories = data.get('categories', None)

        # Validate count
        if not isinstance(count, int) or count < 1 or count > 200:
            logger.warning("API: generate_movies invalid count: %s", count)
            return JsonResponse({
                'success': False,
                'error': 'Count must be between 1 and 200'
            }, status=400)
        
        # Generate movies
        result = generate_movies_data(count, categories)
        if result.success:
            logger.info("API: generate_movies succeeded: %s movies", result.count)
            return JsonResponse({
                'success': True,
                'count': result.count,
                'generation_time': result.generation_time,
                'message': f'Successfully generated {result.count} movies'
            })
        else:
            logger.error("API: generate_movies failed: %s", result.error)
            return JsonResponse({
                'success': False,
                'error': result.error
            }, status=500)
            
    except json.JSONDecodeError:
        logger.error("API: generate_movies invalid JSON")
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.exception("API: generate_movies unexpected error")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def generate_genres_api(request):
    """API endpoint to generate genres"""
    logger.info("API: generate_genres called")
    if not settings.ENABLE_DATA_GENERATION:
        logger.warning("API: generate_genres blocked - generation disabled")
        return JsonResponse({
            'success': False,
            'error': 'Data generation is not enabled'
        }, status=400)
    
    try:
        data = json.loads(request.body)
        count = data.get('count', 20)

        # Validate count
        if not isinstance(count, int) or count < 1 or count > 50:
            logger.warning("API: generate_genres invalid count: %s", count)
            return JsonResponse({
                'success': False,
                'error': 'Count must be between 1 and 50'
            }, status=400)
        
        # Generate genres
        result = generate_genres_data(count)
        if result.success:
            logger.info("API: generate_genres succeeded: %s genres", result.count)
            return JsonResponse({
                'success': True,
                'count': result.count,
                'generation_time': result.generation_time,
                'message': f'Successfully generated {result.count} genres'
            })
        else:
            logger.error("API: generate_genres failed: %s", result.error)
            return JsonResponse({
                'success': False,
                'error': result.error
            }, status=500)
            
    except json.JSONDecodeError:
        logger.error("API: generate_genres invalid JSON")
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.exception("API: generate_genres unexpected error")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def clear_data_api(request):
    """API endpoint to clear existing data"""
    logger.info("API: clear_data called")
    try:
        data = json.loads(request.body)
        clear_movies = data.get('clear_movies', False)
        clear_genres = data.get('clear_genres', False)

        cleared_items = []
        
        if clear_movies:
            movies_count = Movie.objects.count()
            Movie.objects.all().delete()
            cleared_items.append(f'{movies_count} movies')
            logger.info("API: clear_data cleared movies: %s", movies_count)

        if clear_genres:
            genres_count = Genre.objects.count()
            Genre.objects.all().delete()
            cleared_items.append(f'{genres_count} genres')
            logger.info("API: clear_data cleared genres: %s", genres_count)

        if not cleared_items:
            logger.warning("API: clear_data no items selected")
            return JsonResponse({
                'success': False,
                'error': 'No data selected for clearing'
            }, status=400)
        
        logger.info("API: clear_data cleared: %s", ', '.join(cleared_items))
        return JsonResponse({
            'success': True,
            'message': f'Successfully cleared: {", ".join(cleared_items)}'
        })
        
    except json.JSONDecodeError:
        logger.error("API: clear_data invalid JSON")
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.exception("API: clear_data unexpected error")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
