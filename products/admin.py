from django.contrib import admin
from .models import Product, Category, ProductGallery

class ProductGalleryInline(admin.TabularInline):
    model = ProductGallery
    extra = 1
    # Remove the thumbnail decorator

class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    list_display = ('name', 'slug')

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'category', 'created_date', 'modified_date', 'is_available')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('category', 'is_available')
    search_fields = ('name', 'description')
    inlines = [ProductGalleryInline]

admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductGallery)