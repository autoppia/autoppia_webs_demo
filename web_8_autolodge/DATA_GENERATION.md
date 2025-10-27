# AI-Based Data Generation System for Autolodge

This document describes the AI-powered data generation system implemented for the Autolodge hotel booking platform.

## 🎯 Overview

The system generates realistic hotel listings using AI via a backend API, with local caching and graceful fallback to static data.

## 🏗️ Architecture

### Core Components

1. **Data Generator** (`src/shared/data-generator.ts`)
   - Configuration for hotel data generation
   - API integration with `/datasets/generate` endpoint
   - Environment variable management

2. **Hotel Enhanced** (`src/data/hotels-enhanced.ts`)
   - Initialization logic with caching
   - Fallback to static data on failure
   - Local storage management

3. **Dynamic Data Provider** (`src/utils/dynamicDataProvider.ts`)
   - Singleton service for hotel data access
   - Search and filtering capabilities
   - Loading state management

4. **Data Ready Gate** (`src/components/DataReadyGate.tsx`)
   - Ensures data is loaded before rendering
   - Loading states and error handling

## 🚀 Usage

### Environment Variables

```bash
# Enable data generation
ENABLE_DATA_GENERATION=true
NEXT_PUBLIC_ENABLE_DATA_GENERATION=true

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:8090
API_URL=http://app:8090
```

### Docker Configuration

```yaml
environment:
  - ENABLE_DATA_GENERATION=true
  - NEXT_PUBLIC_ENABLE_DATA_GENERATION=true
  - NEXT_PUBLIC_API_URL=http://localhost:8090
  - API_URL=http://app:8090
```

### Running the System

1. **Start with data generation enabled:**
   ```bash
   ./scripts/setup.sh --demo=autolodge --enable_data_generation=true
   export OPEN_AI_API="sk-xxxx"
   npm run dev
   ```

2. **Expected output:**
   ```
   🚀 Generating hotels for Autolodge...
   ✅ Generated 50 hotels across 8 categories
   💾 Cached results in localStorage (autolodge_generated_hotels_v1)
   ```

## 📊 Data Structure

### Hotel Interface

```typescript
interface Hotel {
  id: number;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  guests: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  datesFrom: string; // YYYY-MM-DD
  datesTo: string;   // YYYY-MM-DD
  price: number;
  host: Host;
  amenities: Amenity[];
}
```

### Generated Data Features

- **Realistic Properties**: 50+ diverse hotel listings
- **Price Range**: $50-$600 per night
- **Ratings**: 3.5-5.0 stars
- **Amenities**: Wi-Fi, Pool, Breakfast, Parking, etc.
- **Host Profiles**: Names, avatars, experience levels
- **Images**: Unsplash integration with property-specific queries
- **Availability**: 5-10 days of future availability

## 🔧 Configuration

### Project Configuration

The system uses `web_8_autolodge` as the project key with the following configuration:

- **Categories**: Beachfront, Urban, Mountain, Countryside, Luxury, Budget, Boutique, Resort
- **Image Source**: Unsplash with property-specific queries
- **Host Avatars**: RandomUser.me API
- **Data Count**: 50 hotels by default

### Caching Strategy

- **Cache Key**: `autolodge_generated_hotels_v1`
- **Storage**: Browser localStorage
- **Fallback**: Static data on cache miss or generation failure
- **Invalidation**: Manual cache clear via `clearHotelCache()`

## 🧪 Testing

### Test Script

```bash
node test-data-generation.js
```

### Manual Testing

1. Enable data generation in environment
2. Clear browser cache/localStorage
3. Reload the application
4. Check console for generation logs
5. Verify hotel data in UI

## 🚨 Error Handling

### Graceful Degradation

- Falls back to static data if generation fails
- Shows loading states during data fetch
- Logs errors for debugging
- Continues operation even with data issues

### Common Issues

1. **API Unavailable**: Falls back to static data
2. **Invalid Response**: Logs error and uses fallback
3. **Cache Corruption**: Clears cache and regenerates
4. **Network Issues**: Retries with exponential backoff

## 📈 Performance

### Optimization Features

- **Lazy Loading**: Data loaded only when needed
- **Caching**: Results cached for faster reloads
- **Concurrent Loading**: Non-blocking data initialization
- **Memory Efficient**: Singleton pattern for data provider

### Monitoring

- Console logs for generation status
- Performance metrics (generation time)
- Error tracking and reporting
- Cache hit/miss statistics

## 🔄 Data Flow

1. **Initialization**: Check environment variables
2. **Cache Check**: Look for existing data in localStorage
3. **API Call**: Generate new data if needed
4. **Cache Store**: Save results for future use
5. **UI Update**: Render with generated or cached data
6. **Fallback**: Use static data if all else fails

## 🛠️ Development

### Adding New Data Types

1. Update `PROJECT_CONFIGS` in data-generator.ts
2. Create new interface definitions
3. Add examples and naming rules
4. Update data provider methods
5. Test with new configuration

### Debugging

- Enable console logging for detailed output
- Check network tab for API calls
- Inspect localStorage for cached data
- Use browser dev tools for state inspection

## 📝 Notes

- Data generation requires a running backend API
- Static data serves as reliable fallback
- System is designed for production use
- Supports both development and production environments
