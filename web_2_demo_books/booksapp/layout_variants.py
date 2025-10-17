"""
Layout Variants Configuration for web_2_demo_books
This module defines 10 layout variants with their XPath selectors, similar to web_6_automail.
Each layout variant has a unique structure and XPath configuration for automation testing.
"""

from typing import Dict, Any, List


class LayoutVariant:
    """Represents a layout variant with its configuration and XPath selectors."""
    
    def __init__(
        self,
        id: int,
        name: str,
        description: str,
        layout: Dict[str, str],
        xpaths: Dict[str, str],
        styles: Dict[str, str],
        template_name: str
    ):
        self.id = id
        self.name = name
        self.description = description
        self.layout = layout
        self.xpaths = xpaths
        self.styles = styles
        self.template_name = template_name
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert layout variant to dictionary for template context."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'layout': self.layout,
            'xpaths': self.xpaths,
            'styles': self.styles,
            'template_name': self.template_name
        }


# Define all 10 layout variants
LAYOUT_VARIANTS: List[LayoutVariant] = [
    # Layout 1: Classic Book Store - Traditional layout
    LayoutVariant(
        id=1,
        name="Classic Book Store",
        description="Traditional book store layout with navigation, search, and grid",
        layout={
            'navbar': 'top',
            'search': 'hero',
            'filters': 'left',
            'book_grid': 'main',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//div[contains(@class, 'book-item-classic')]",
            'book_title': "//h5[contains(@class, 'card-title')]",
            'book_image': "//img[contains(@class, 'card-img-top')]",
            'add_to_cart': "//button[contains(@class, 'btn-buy')]",
            'search_input': "//input[@name='search'][@placeholder='Search']",
            'genre_filter': "//select[@id='genre-filter']",
            'year_filter': "//select[@id='year-filter']",
            'navbar_home': "//a[contains(@class, 'nav-link')][contains(text(), 'Home')]",
            'navbar_about': "//a[contains(@class, 'nav-link')][contains(text(), 'About')]",
            'navbar_contact': "//a[contains(@class, 'nav-link')][contains(text(), 'Contact')]",
            'login_button': "//a[contains(@class, 'btn-signin')]",
            'register_button': "//a[contains(@class, 'btn-register')]",
            'cart_icon': "//a[@href='/shoppingcart/']//i[contains(@class, 'fa-shopping-cart')]"
        },
        styles={
            'container': 'container mt-4',
            'grid': 'row',
            'card': 'col-md-3 mb-4'
        },
        template_name='layouts/nav_search_grid.html'
    ),
    
    # Layout 2: Search-First Layout
    LayoutVariant(
        id=2,
        name="Search-First Layout",
        description="Emphasizes search functionality with filters",
        layout={
            'navbar': 'top',
            'search': 'prominent',
            'filters': 'inline',
            'book_grid': 'main',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//div[contains(@class, 'book-search-card')]",
            'book_title': "//div[contains(@class, 'search-result')]//h5",
            'book_image': "//div[contains(@class, 'search-result-img')]//img",
            'add_to_cart': "//div[contains(@class, 'search-actions')]//button",
            'search_input': "//div[contains(@class, 'search-prominent')]//input",
            'genre_filter': "//div[contains(@class, 'filter-inline')]//select[1]",
            'year_filter': "//div[contains(@class, 'filter-inline')]//select[2]",
            'navbar_home': "//nav//ul//li[1]//a",
            'navbar_about': "//nav//ul//li[2]//a",
            'navbar_contact': "//nav//ul//li[3]//a",
            'login_button': "//div[contains(@class, 'auth-buttons')]//a[1]",
            'register_button': "//div[contains(@class, 'auth-buttons')]//a[2]",
            'cart_icon': "//div[contains(@class, 'cart-container')]//i"
        },
        styles={
            'container': 'container-fluid px-5',
            'grid': 'row justify-content-center',
            'card': 'col-lg-3 col-md-4 mb-4'
        },
        template_name='layouts/search_filters_grid.html'
    ),
    
    # Layout 3: Grid-First Layout
    LayoutVariant(
        id=3,
        name="Grid-First Layout",
        description="Emphasizes book grid with minimal navigation",
        layout={
            'navbar': 'minimal',
            'search': 'sidebar',
            'filters': 'sidebar',
            'book_grid': 'full-width',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//article[contains(@class, 'grid-book-card')]",
            'book_title': "//article//header//h5",
            'book_image': "//article//figure//img",
            'add_to_cart': "//article//footer//button",
            'search_input': "//aside[contains(@class, 'sidebar')]//input",
            'genre_filter': "//aside[contains(@class, 'sidebar')]//select[contains(@id, 'genre')]",
            'year_filter': "//aside[contains(@class, 'sidebar')]//select[contains(@id, 'year')]",
            'navbar_home': "//header//nav//a[contains(text(), 'Home')]",
            'navbar_about': "//header//nav//a[contains(text(), 'About')]",
            'navbar_contact': "//header//nav//a[contains(text(), 'Contact')]",
            'login_button': "//header//div[contains(@class, 'auth')]//a[contains(text(), 'Login')]",
            'register_button': "//header//div[contains(@class, 'auth')]//a[contains(text(), 'Register')]",
            'cart_icon': "//header//a[contains(@href, 'cart')]//i"
        },
        styles={
            'container': 'container-fluid',
            'grid': 'row row-cols-1 row-cols-md-4 row-cols-lg-5',
            'card': 'col mb-3'
        },
        template_name='layouts/grid_nav_filters.html'
    ),
    
    # Layout 4: Sidebar Layout
    LayoutVariant(
        id=4,
        name="Sidebar Layout",
        description="Classic layout with left sidebar for filters",
        layout={
            'navbar': 'top',
            'search': 'navbar',
            'filters': 'sidebar-left',
            'book_grid': 'main-right',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//div[contains(@class, 'sidebar-layout')]//div[contains(@class, 'book-card')]",
            'book_title': "//div[contains(@class, 'book-info')]//h5",
            'book_image': "//div[contains(@class, 'book-cover')]//img",
            'add_to_cart': "//div[contains(@class, 'book-actions')]//button[@type='button']",
            'search_input': "//nav[contains(@class, 'navbar')]//input[@type='search']",
            'genre_filter': "//div[contains(@class, 'sidebar')]//div[contains(@class, 'filter-genre')]//select",
            'year_filter': "//div[contains(@class, 'sidebar')]//div[contains(@class, 'filter-year')]//select",
            'navbar_home': "//ul[contains(@class, 'navbar-nav')]//a[@href='/']",
            'navbar_about': "//ul[contains(@class, 'navbar-nav')]//a[@href='/about/']",
            'navbar_contact': "//ul[contains(@class, 'navbar-nav')]//a[@href='/contact/']",
            'login_button': "//nav//a[contains(@href, 'login')]",
            'register_button': "//nav//a[contains(@href, 'register')]",
            'cart_icon': "//nav//a[contains(@href, 'shopping')]//i[contains(@class, 'cart')]"
        },
        styles={
            'container': 'container mt-3',
            'grid': 'row',
            'card': 'col-xl-3 col-lg-4 col-md-6 mb-4'
        },
        template_name='layouts/layout_sidebar_main_footer.html'
    ),
    
    # Layout 5: Featured Layout
    LayoutVariant(
        id=5,
        name="Featured Layout",
        description="Highlights featured books with prominent search",
        layout={
            'navbar': 'top',
            'featured': 'hero',
            'search': 'below-featured',
            'book_grid': 'main',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//section[contains(@class, 'featured-section')]//div[contains(@class, 'book-featured')]",
            'book_title': "//div[contains(@class, 'featured-title')]//h5",
            'book_image': "//div[contains(@class, 'featured-image')]//img",
            'add_to_cart': "//div[contains(@class, 'featured-cta')]//button",
            'search_input': "//section[contains(@class, 'search-section')]//input",
            'genre_filter': "//section[contains(@class, 'filters')]//select[@name='genre']",
            'year_filter': "//section[contains(@class, 'filters')]//select[@name='year']",
            'navbar_home': "//nav//li[contains(@class, 'nav-item')][1]//a",
            'navbar_about': "//nav//li[contains(@class, 'nav-item')][2]//a",
            'navbar_contact': "//nav//li[contains(@class, 'nav-item')][3]//a",
            'login_button': "//div[contains(@class, 'navbar-auth')]//a[1]",
            'register_button': "//div[contains(@class, 'navbar-auth')]//a[2]",
            'cart_icon': "//a[contains(@class, 'cart-link')]//i"
        },
        styles={
            'container': 'container',
            'grid': 'row g-4',
            'card': 'col-6 col-md-4 col-lg-3'
        },
        template_name='layouts/layout_featured_search_grid.html'
    ),
    
    # Layout 6: Filter-First Layout
    LayoutVariant(
        id=6,
        name="Filter-First Layout",
        description="Emphasizes filtering options before grid",
        layout={
            'navbar': 'top',
            'filters': 'prominent',
            'book_grid': 'below',
            'navigation': 'bottom',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//div[contains(@class, 'filtered-results')]//div[contains(@class, 'result-card')]",
            'book_title': "//div[contains(@class, 'result-card')]//h5[contains(@class, 'title')]",
            'book_image': "//div[contains(@class, 'result-card')]//img[contains(@class, 'thumbnail')]",
            'add_to_cart': "//div[contains(@class, 'result-card')]//button[contains(@class, 'add-cart')]",
            'search_input': "//div[contains(@class, 'filter-bar')]//input[@placeholder]",
            'genre_filter': "//div[contains(@class, 'filter-prominent')]//select[contains(@class, 'genre')]",
            'year_filter': "//div[contains(@class, 'filter-prominent')]//select[contains(@class, 'year')]",
            'navbar_home': "//div[contains(@class, 'bottom-nav')]//a[text()='Home']",
            'navbar_about': "//div[contains(@class, 'bottom-nav')]//a[text()='About Us']",
            'navbar_contact': "//div[contains(@class, 'bottom-nav')]//a[text()='Contact']",
            'login_button': "//a[contains(@class, 'login-link')]",
            'register_button': "//a[contains(@class, 'register-link')]",
            'cart_icon': "//span[contains(@class, 'cart-icon')]//i"
        },
        styles={
            'container': 'container-fluid p-4',
            'grid': 'row gx-3 gy-4',
            'card': 'col-md-4 col-lg-3 col-xl-2'
        },
        template_name='layouts/layout_filters_grid_nav.html'
    ),
    
    # Layout 7: Grid-Footer-Nav Layout
    LayoutVariant(
        id=7,
        name="Grid-Footer-Nav Layout",
        description="Grid first, then footer and navigation",
        layout={
            'navbar': 'minimal-top',
            'book_grid': 'immediate',
            'footer': 'middle',
            'navigation': 'bottom',
            'search': 'floating'
        },
        xpaths={
            'book_item': "//main[contains(@class, 'grid-immediate')]//div[contains(@class, 'book-tile')]",
            'book_title': "//span[contains(@class, 'tile-title')]",
            'book_image': "//div[contains(@class, 'tile-image')]//img",
            'add_to_cart': "//div[contains(@class, 'tile-actions')]//button[contains(text(), 'Add')]",
            'search_input': "//div[contains(@class, 'floating-search')]//input",
            'genre_filter': "//aside//select[contains(@name, 'genre')]",
            'year_filter': "//aside//select[contains(@name, 'year')]",
            'navbar_home': "//footer//nav//a[contains(@href, '/')][@class]",
            'navbar_about': "//footer//nav//a[contains(@href, 'about')]",
            'navbar_contact': "//footer//nav//a[contains(@href, 'contact')]",
            'login_button': "//header//a[contains(text(), 'Login')]",
            'register_button': "//header//a[contains(text(), 'Register')]",
            'cart_icon': "//div[contains(@class, 'floating-cart')]//i"
        },
        styles={
            'container': 'container-xxl',
            'grid': 'row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6',
            'card': 'col p-2'
        },
        template_name='layouts/layout_grid_footer_nav.html'
    ),
    
    # Layout 8: Main-Sidebar-Nav Layout
    LayoutVariant(
        id=8,
        name="Main-Sidebar-Nav Layout",
        description="Main content with right sidebar",
        layout={
            'navbar': 'left-vertical',
            'book_grid': 'main-center',
            'sidebar': 'right',
            'search': 'sidebar',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//section[contains(@class, 'main-content')]//article[contains(@class, 'book-article')]",
            'book_title': "//article//h3[contains(@class, 'article-title')]",
            'book_image': "//article//div[contains(@class, 'article-cover')]//img",
            'add_to_cart': "//article//div[contains(@class, 'article-buy')]//button",
            'search_input': "//aside[contains(@class, 'right-sidebar')]//form//input",
            'genre_filter': "//aside//div[contains(@class, 'genre-selector')]//select",
            'year_filter': "//aside//div[contains(@class, 'year-selector')]//select",
            'navbar_home': "//nav[contains(@class, 'vertical-nav')]//li[1]//a",
            'navbar_about': "//nav[contains(@class, 'vertical-nav')]//li[2]//a",
            'navbar_contact': "//nav[contains(@class, 'vertical-nav')]//li[3]//a",
            'login_button': "//nav[contains(@class, 'vertical-nav')]//a[contains(@href, 'login')]",
            'register_button': "//nav[contains(@class, 'vertical-nav')]//a[contains(@href, 'register')]",
            'cart_icon': "//aside//a[contains(@class, 'sidebar-cart')]//i"
        },
        styles={
            'container': 'container-fluid vh-100',
            'grid': 'row h-100',
            'card': 'col-sm-6 col-md-4 col-lg-3 col-xxl-2 mb-3'
        },
        template_name='layouts/layout_main_sidebar_nav.html'
    ),
    
    # Layout 9: Search-Grid-Featured Layout
    LayoutVariant(
        id=9,
        name="Search-Grid-Featured Layout",
        description="Search bar, grid, then featured section",
        layout={
            'navbar': 'top',
            'search': 'prominent-top',
            'book_grid': 'center',
            'featured': 'bottom',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//div[contains(@class, 'search-grid')]//div[contains(@class, 'grid-item')]",
            'book_title': "//div[contains(@class, 'grid-item')]//h6",
            'book_image': "//div[contains(@class, 'grid-item')]//img[contains(@class, 'img-fluid')]",
            'add_to_cart': "//div[contains(@class, 'grid-item')]//button[contains(@class, 'btn')]",
            'search_input': "//header//div[contains(@class, 'prominent-search')]//input",
            'genre_filter': "//form[contains(@class, 'search-form')]//select[@id='genreSelect']",
            'year_filter': "//form[contains(@class, 'search-form')]//select[@id='yearSelect']",
            'navbar_home': "//nav[contains(@class, 'top-nav')]//ul//li//a[contains(., 'Home')]",
            'navbar_about': "//nav[contains(@class, 'top-nav')]//ul//li//a[contains(., 'About')]",
            'navbar_contact': "//nav[contains(@class, 'top-nav')]//ul//li//a[contains(., 'Contact')]",
            'login_button': "//nav//div[contains(@class, 'user-actions')]//a[1]",
            'register_button': "//nav//div[contains(@class, 'user-actions')]//a[2]",
            'cart_icon': "//nav//a[contains(@class, 'cart-button')]//i[contains(@class, 'shopping-cart')]"
        },
        styles={
            'container': 'container my-4',
            'grid': 'row justify-content-start',
            'card': 'col-6 col-sm-4 col-md-3 col-lg-2 mb-3'
        },
        template_name='layouts/layout_search_grid_featured.html'
    ),
    
    # Layout 10: Nav-Footer-Grid Layout
    LayoutVariant(
        id=10,
        name="Nav-Footer-Grid Layout",
        description="Navigation, footer info, then grid",
        layout={
            'navbar': 'top-full',
            'footer_info': 'below-nav',
            'book_grid': 'main',
            'search': 'integrated',
            'footer': 'bottom'
        },
        xpaths={
            'book_item': "//section[contains(@class, 'book-catalog')]//div[contains(@class, 'catalog-card')]",
            'book_title': "//div[contains(@class, 'catalog-card')]//p[contains(@class, 'card-heading')]",
            'book_image': "//div[contains(@class, 'catalog-card')]//div[contains(@class, 'card-media')]//img",
            'add_to_cart': "//div[contains(@class, 'catalog-card')]//a[contains(@class, 'btn-primary')]",
            'search_input': "//div[contains(@class, 'integrated-search')]//input[@type='text']",
            'genre_filter': "//div[contains(@class, 'catalog-filters')]//select[1]",
            'year_filter': "//div[contains(@class, 'catalog-filters')]//select[2]",
            'navbar_home': "//nav[contains(@class, 'top-full')]//a[position()=1]",
            'navbar_about': "//nav[contains(@class, 'top-full')]//a[position()=2]",
            'navbar_contact': "//nav[contains(@class, 'top-full')]//a[position()=3]",
            'login_button': "//nav[contains(@class, 'top-full')]//div[contains(@class, 'auth')]//a[contains(@class, 'login')]",
            'register_button': "//nav[contains(@class, 'top-full')]//div[contains(@class, 'auth')]//a[contains(@class, 'register')]",
            'cart_icon': "//nav//a[contains(@class, 'nav-cart')]//i[contains(@class, 'fa-cart')]"
        },
        styles={
            'container': 'container-lg py-3',
            'grid': 'row g-3',
            'card': 'col-6 col-md-4 col-xl-3'
        },
        template_name='layouts/layout_nav_footer_grid.html'
    )
]


def get_layout_variant(seed: int) -> LayoutVariant:
    """
    Get a layout variant based on seed (1-300).
    Maps seed to one of 10 layout variants using modulo.
    
    Args:
        seed: Seed value between 1 and 300
        
    Returns:
        LayoutVariant: The corresponding layout variant
    """
    if seed < 1 or seed > 300:
        seed = 1
    
    # Map seed to variant index (0-9)
    variant_index = (seed - 1) % 10
    return LAYOUT_VARIANTS[variant_index]


def get_layout_variant_by_id(variant_id: int) -> LayoutVariant:
    """
    Get a layout variant by its ID.
    
    Args:
        variant_id: Variant ID (1-10)
        
    Returns:
        LayoutVariant: The corresponding layout variant, or default (variant 1) if not found
    """
    for variant in LAYOUT_VARIANTS:
        if variant.id == variant_id:
            return variant
    return LAYOUT_VARIANTS[0]  # Default to variant 1


def get_all_layout_variants() -> List[LayoutVariant]:
    """Get all available layout variants."""
    return LAYOUT_VARIANTS


def get_layout_variant_names() -> List[str]:
    """Get names of all layout variants."""
    return [variant.name for variant in LAYOUT_VARIANTS]

