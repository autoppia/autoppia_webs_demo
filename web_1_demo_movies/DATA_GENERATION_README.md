# Data Generation for Web 1 Movies Demo

This document describes how to use the OpenAI-powered data generation feature in the Web 1 Movies Demo.

## Overview

The data generation feature allows you to automatically generate movies and genres using OpenAI's GPT models through the webs_server API. Generated data is saved directly to the web_1 Django database, not to the webs_server's master pool. This is particularly useful for:

- Populating the web_1 database with realistic test data
- Creating large datasets for performance testing
- Generating diverse content for demonstrations

## Prerequisites

1. **Webs Server Running**: The webs_server must be running and accessible
2. **OpenAI API Key**: Configured in the webs_server environment
3. **Data Generation Enabled**: Set `ENABLE_DATA_GENERATION=true`

## Configuration

### Environment Variables

Set these environment variables in your `.env` file or Docker configuration:

```bash
# Enable data generation
ENABLE_DATA_GENERATION=true

# API URL for the webs_server
API_URL=http://localhost:8090

# Optional: Custom API URL for different environments
# API_URL=http://webs-server:8090
```

### Docker Configuration

When using Docker, set the environment variables in your `docker-compose.yml`:

```yaml
services:
  web:
    environment:
      - ENABLE_DATA_GENERATION=true
      - API_URL=http://localhost:8090
```

## Usage

### 1. Web Interface

Navigate to `/data-generation/` in your browser to access the data generation dashboard. This provides a user-friendly interface to:

- Generate movies (1-200 at a time)
- Generate genres (1-50 at a time)
- Clear existing data
- View generation statistics
- Use quick setup for common scenarios

### 2. Management Commands

Use Django management commands for programmatic data generation:

```bash
# Generate 50 movies and 20 genres
python manage.py generate_data --movies-count 50 --genres-count 20

# Generate with specific categories
python manage.py generate_data --movies-count 100 --categories "Action,Drama,Comedy"

# Clear existing data and generate new
python manage.py generate_data --clear-existing --movies-count 75

# Add sample comments to generated movies
python manage.py generate_data --movies-count 50 --add-comments
```

### 3. Programmatic API

Use the data generator directly in your code:

```python
from movieapp.data_generator import generate_movies_data, generate_genres_data

# Generate movies
result = generate_movies_data(count=50, categories=["Action", "Drama"])
if result.success:
    print(f"Generated {result.count} movies in {result.generation_time:.2f}s")
else:
    print(f"Error: {result.error}")

# Generate genres
result = generate_genres_data(count=20)
if result.success:
    print(f"Generated {result.count} genres in {result.generation_time:.2f}s")
```

## Generated Data Structure

### Movies

Generated movies include:

- **Name**: Realistic movie titles
- **Description**: Engaging 2-3 sentence descriptions
- **Year**: Years between 1950-2024
- **Director**: Realistic director names
- **Cast**: Comma-separated actor names
- **Duration**: 60-240 minutes
- **Rating**: 3.0-5.0 stars
- **Trailer URL**: Realistic YouTube URLs
- **Image**: Unsplash movie-related images
- **Genres**: Array of valid movie genres

### Genres

Generated genres include:

- **Name**: Common movie genre names
- **Description**: Brief descriptions of the genre

## API Endpoints

The following API endpoints are available for data generation:

- `POST /api/generate-movies/` - Generate movies
- `POST /api/generate-genres/` - Generate genres  
- `POST /api/clear-data/` - Clear existing data

### Example API Usage

```bash
# Generate movies
curl -X POST http://localhost:8000/api/generate-movies/ \
  -H "Content-Type: application/json" \
  -d '{"count": 50, "categories": ["Action", "Drama"]}'

# Generate genres
curl -X POST http://localhost:8000/api/generate-genres/ \
  -H "Content-Type: application/json" \
  -d '{"count": 20}'

# Clear data
curl -X POST http://localhost:8000/api/clear-data/ \
  -H "Content-Type: application/json" \
  -d '{"clear_movies": true, "clear_genres": true}'
```

## Troubleshooting

### Common Issues

1. **Data generation not enabled**
   - Ensure `ENABLE_DATA_GENERATION=true` is set
   - Check that the environment variable is properly configured

2. **API connection failed**
   - Verify that webs_server is running on the correct port
   - Check that `API_URL` is correctly configured
   - Ensure network connectivity between services

3. **OpenAI API errors**
   - Verify that the OpenAI API key is configured in webs_server
   - Check that you have sufficient API credits
   - Ensure the API key has the necessary permissions

4. **Generation timeout**
   - Large generation requests may timeout
   - Try generating smaller batches (e.g., 25-50 items at a time)
   - Check webs_server logs for detailed error information

### Debug Mode

Enable debug logging to troubleshoot issues:

```python
import logging
logging.getLogger('movieapp.data_generator').setLevel(logging.DEBUG)
```

## Performance Considerations

- **Batch Size**: Generate data in batches of 50-100 items for optimal performance
- **Rate Limiting**: OpenAI API has rate limits; large requests may be throttled
- **Memory Usage**: Large datasets may require significant memory
- **Database Performance**: Consider indexing for large datasets

## Security Notes

- The data generation feature is only available when explicitly enabled
- API endpoints require CSRF protection
- Generated data is stored in the web_1 Django database
- No sensitive data is sent to external APIs beyond the webs_server
- Data is not stored in the webs_server's master pool

## Integration with Other Features

The data generation feature integrates with:

- **Dynamic HTML**: Generated data respects the dynamic layout system
- **User Authentication**: Data generation is available to authenticated users
- **Admin Interface**: Generated data appears in Django admin
- **Search and Filtering**: Generated data works with existing search features

## Future Enhancements

Planned improvements include:

- Custom data templates
- Scheduled data generation
- Data export/import functionality
- Advanced filtering and categorization
- Integration with external data sources
