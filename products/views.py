from django.shortcuts import render, get_object_or_404
from .models import Product, Category, ProductGallery
from django.db.models import Q
from django.core.paginator import Paginator

def store(request, category_slug=None):
    categories = None
    products = None
    
    if category_slug:
        categories = get_object_or_404(Category, slug=category_slug)
        products = Product.objects.filter(category=categories, is_available=True)
        paginator = Paginator(products, 12)  # Show 12 products per page
        page = request.GET.get('page')
        paged_products = paginator.get_page(page)
        product_count = products.count()
    else:
        products = Product.objects.all().filter(is_available=True).order_by('id')
        paginator = Paginator(products, 12)  # Show 12 products per page
        page = request.GET.get('page')
        paged_products = paginator.get_page(page)
        product_count = products.count()
    
    context = {
        'products': paged_products,
        'product_count': product_count,
    }
    return render(request, 'products/store.html', context)

def product_detail(request, category_slug, product_slug):
    try:
        single_product = Product.objects.get(category__slug=category_slug, slug=product_slug)
    except Exception as e:
        raise e
    
    # Get product gallery
    product_gallery = ProductGallery.objects.filter(product_id=single_product.id)
    
    context = {
        'single_product': single_product,
        'product_gallery': product_gallery,
    }
    return render(request, 'products/product_detail.html', context)

def search(request):
    if 'keyword' in request.GET:
        keyword = request.GET['keyword']
        if keyword:
            products = Product.objects.order_by('-created_date').filter(
                Q(description__icontains=keyword) | Q(name__icontains=keyword)
            )
            product_count = products.count()
    
    context = {
        'products': products,
        'product_count': product_count,
    }
    return render(request, 'products/store.html', context)