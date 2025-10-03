#!/usr/bin/env python3
"""
Test script for the data generation endpoint.
This script demonstrates how to use the /generate_products/ endpoint.
"""

import asyncio
import json
import time

import httpx


# Your existing Product interface definition
PRODUCT_INTERFACE = """
export interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  description?: string;
  category?: string;
  rating?: number;
  brand?: string;
  inStock?: boolean;
  color?: string;
  size?: string;
  dimensions?: {
    depth?: string;
    length?: string;
    width?: string;
  };
  careInstructions?: string;
}
"""

# Example products from your existing data
EXAMPLE_PRODUCTS = [
    {
        "id": "kitchen-1",
        "title": "Espresso Machine",
        "price": "$160.00",
        "image": "/images/homepage_categories/coffee_machine.jpg",
        "description": "Professional-grade espresso machine with steam wand and programmable settings.",
        "category": "Kitchen",
        "rating": 4.5,
        "brand": "BrewMaster",
        "inStock": True,
    },
    {
        "id": "tech-1",
        "title": "Wireless Earbuds",
        "price": "$129.99",
        "image": "/images/homepage_categories/wireless_earbuds.jpg",
        "description": "True wireless earbuds with active noise cancellation and 24-hour battery life.",
        "category": "Electronics",
        "rating": 4.7,
        "brand": "SoundCore",
        "inStock": True,
    },
    {
        "id": "home-1",
        "title": "Memory Foam Mattress",
        "price": "$399.00",
        "image": "/images/homepage_categories/mattress.jpg",
        "description": "10-inch gel memory foam mattress with cooling technology.",
        "category": "Home",
        "rating": 4.7,
        "brand": "SleepWell",
        "inStock": True,
    },
]


async def test_data_generation():
    """Test the data generation endpoint."""

    # Server URL - adjust if your server runs on a different port
    server_url = "http://localhost:8000"

    # Request payload
    request_data = {
        "interface_definition": PRODUCT_INTERFACE,
        "examples": EXAMPLE_PRODUCTS,
        "count": 10,  # Generate 10 products
        "categories": ["Kitchen", "Electronics", "Home", "Fitness"],  # Focus on these categories
        "additional_requirements": "Make sure to include diverse product types and realistic pricing. Include some products with dimensions and care instructions.",
    }

    print("🚀 Testing Data Generation Endpoint")
    print(f"📡 Server URL: {server_url}")
    print(f"📊 Requesting {request_data['count']} products")
    print(f"🏷️  Categories: {', '.join(request_data['categories'])}")
    print("-" * 50)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # Make the request
            start_time = time.time()
            response = await client.post(f"{server_url}/dataset/generate/", json=request_data, headers={"Content-Type": "application/json"})
            end_time = time.time()

            print(f"⏱️  Request completed in {end_time - start_time:.2f} seconds")
            print(f"📈 Status Code: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success: {result['message']}")
                print(f"📦 Generated {result['count']} products")
                print(f"⏰ Generation time: {result['generation_time']:.2f} seconds")
                print("\n" + "=" * 50)
                print("🎯 GENERATED PRODUCTS:")
                print("=" * 50)

                for i, product in enumerate(result["generated_data"], 1):
                    print(f"\n{i}. {product['title']} - {product['price']}")
                    print(f"   Category: {product.get('category', 'N/A')}")
                    print(f"   Brand: {product.get('brand', 'N/A')}")
                    print(f"   Rating: {product.get('rating', 'N/A')}")
                    print(f"   Description: {product.get('description', 'N/A')[:100]}...")
                    if product.get("dimensions"):
                        print(f"   Dimensions: {product['dimensions']}")
                    if product.get("careInstructions"):
                        print(f"   Care: {product['careInstructions'][:50]}...")

                # Save generated data to file
                output_file = "generated_products.json"
                with open(output_file, "w") as f:
                    json.dump(result["generated_data"], f, indent=2)
                print(f"\n💾 Generated data saved to: {output_file}")

            else:
                print(f"❌ Error: {response.status_code}")
                print(f"📝 Response: {response.text}")

        except httpx.ConnectError:
            print("❌ Connection Error: Could not connect to the server")
            print("💡 Make sure the server is running on the correct port")
        except httpx.TimeoutException:
            print("❌ Timeout Error: Request took too long")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")


async def test_with_different_parameters():
    """Test with different parameters to show flexibility."""

    server_url = "http://localhost:8000"

    # Test with different count and categories
    request_data = {
        "interface_definition": PRODUCT_INTERFACE,
        "examples": EXAMPLE_PRODUCTS[:2],  # Use fewer examples
        "count": 5,  # Generate fewer products
        "categories": ["Technology", "Fitness"],  # Different categories
        "additional_requirements": "Focus on tech gadgets and fitness equipment. Include detailed specifications.",
    }

    print("\n" + "=" * 60)
    print("🔄 TESTING WITH DIFFERENT PARAMETERS")
    print("=" * 60)
    print(f"📊 Requesting {request_data['count']} products")
    print(f"🏷️  Categories: {', '.join(request_data['categories'])}")
    print("-" * 50)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(f"{server_url}/dataset/generate/", json=request_data, headers={"Content-Type": "application/json"})

            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success: {result['message']}")
                print(f"📦 Generated {result['count']} products")

                for i, product in enumerate(result["generated_data"], 1):
                    print(f"\n{i}. {product['title']} - {product['price']}")
                    print(f"   Category: {product.get('category', 'N/A')}")
                    print(f"   Brand: {product.get('brand', 'N/A')}")
                    print(f"   Description: {product.get('description', 'N/A')[:80]}...")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("🧪 Data Generation Endpoint Test")
    print("=" * 50)

    # Run the tests
    asyncio.run(test_data_generation())
    asyncio.run(test_with_different_parameters())

    print("\n" + "=" * 50)
    print("✨ Test completed!")
    print("💡 To use this endpoint in your TypeScript project:")
    print("   1. Set OPENAI_API_KEY environment variable")
    print("   2. Start the server: python src/server.py")
    print("   3. Make POST requests to /dataset/generate/")
    print("=" * 50)
