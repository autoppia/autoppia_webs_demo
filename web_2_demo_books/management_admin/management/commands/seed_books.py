import os
import random
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.files import File

from booksapp.models import Book, Genre, Comment
from django.apps import apps


class Command(BaseCommand):
    help = "Resets and seeds the database with books, genres, and comments (optimized version)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting optimized database seeding..."))

        # Step 1: Reset database (fastest method)
        self._reset_database()

        # Step 2: Create genres in bulk
        genres = self._create_genres()

        # Step 3: Create books in parallel with bulk operations
        books = self._create_books(genres)

        # Step 4: Add comments in bulk
        self._add_comments(books)

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))

    def _reset_database(self):
        """Fastest way to reset all data"""
        self.stdout.write("Resetting database...")
        with ThreadPoolExecutor() as executor:
            for model in apps.get_models():
                executor.submit(model.objects.all().delete)
        self.stdout.write(self.style.SUCCESS("All tables reset."))

    def _create_genres(self):
        """Bulk create genres with conflict handling"""
        genre_names = ["Science", "Education", "Cooking", "Story", "History", "Children", "Culture", "Music", "Magazine", "Romance"]

        # Bulk create ignoring conflicts
        Genre.objects.bulk_create([Genre(name=name) for name in genre_names], ignore_conflicts=True)

        # Return dict of name:genre for quick lookup
        return {g.name: g for g in Genre.objects.all()}

    def _create_books(self, genres):
        """Create books with optimized bulk operations"""
        books_data = [
            {
                "name": "Lidia's Italian-American Kitchen",
                "desc": 'Focusing on the Italian-American kitchen--the cooking she encountered when she first came to America as a young adolescent--Lidia pays homage to this "cuisine of adaptation born of necessity." But she transforms it subtly with her light, discriminating touch, using the authentic ingredients, not accessible to the early immigrants, which are all so readily available today. The aromatic flavors of fine Italian olive oil, imported Parmigiano-Reggiano and Gorgonzola dolce latte, fresh basil, oregano, and rosemary, sun-sweetened San Marzano tomatoes, prosciutto, and pancetta permeate the dishes she makes in her Italian-American kitchen today. And they will transform for you this time-honored cuisine, as you cook with Lidia, learning from her the many secret, sensuous touches that make her food superlative.',
                "year": 2001,
                "director": "Lidia Matticchio Bastianich",
                "cast": "Tim Robbins, Morgan Freeman, Bob Gunton",
                "duration": 464,
                "trailer_url": "https://www.bookstores.com/books/lidias-italian-american-kitchen/9780375411502",
                "rating": 4.8,
                "price": 12.90,
                "img_file": "9780375411502.jpg",  # <-- archivo local
                "genres": ["Cooking"],
            },
            {
                "name": "Programming Massively Parallel Processors",
                "desc": "Programming Massively Parallel Processors: A Hands-on Approach shows both students and professionals alike the basic concepts of parallel programming and GPU architecture. Concise, intuitive, and practical, it is based on years of road-testing in the authors' own parallel computing courses",
                "year": 2022,
                "director": "Wen-Mei W. Hwu, David B. Kirk, Izzat El Hajj",
                "cast": "Marlon Brando, Al Pacino, James Caan",
                "duration": 580,
                "trailer_url": "https://www.bookstores.com/books/programming-massively-parallel-processors/9780323912310",
                "rating": 4.7,
                "price": 79.84,
                "img_file": "9780323912310.jpg",
                "genres": ["Education"],
            },
            {
                "name": "Elementary Statistics",
                "desc": "Simplifies statistics through practice and real-world applications Elementary Statistics: Picturing the World makes statistics approachable with stepped-out instruction, extensive real-life examples and exercises, and a design that fits content for each page to make the material more digestible. The text's combination of theory, pedagogy, and design helps students understand concepts and use statistics to describe and think about the world. ",
                "year": 2018,
                "director": "Ron Larson, Betsy Farber",
                "cast": "Christian Bale, Heath Ledger, Aaron Eckhart",
                "duration": 704,
                "trailer_url": "https://www.bookstores.com/books/elementary-statistics-ron-larson/9780134683416",
                "rating": 4.7,
                "price": 98.47,
                "img_file": "9780134683416.jpg",
                "genres": ["Science", "Education"],
            },
            {
                "name": "Dark Nights: Metal: Dark Knights Rising",
                "desc": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                "year": 2019,
                "director": "Grant Morrison, Scott Snyder, Peter J. Tomasi, Francis Manapul (Illustrator)",
                "cast": "John Travolta, Uma Thurman, Samuel L. Jackson",
                "duration": 216,
                "trailer_url": "https://www.bookstores.com/books/dark-nights-metal-dark-knights-rising/9781401289072",
                "rating": 4.6,
                "price": 14.55,
                "img_file": "9781401289072.jpg",
                "genres": ["Story"],
            },
            {
                "name": "Case Files Family Medicine 5th Edition",
                "desc": "Publisher's Note: Products purchased from Third Party sellers are not guaranteed by the publisher for quality, authenticity, or access to any online entitlements included with the product.",
                "year": 2020,
                "director": "Eugene C. Toy, Donald Briscoe, Bruce S. Britton, Joel John Heidelbaugh",
                "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
                "duration": 752,
                "trailer_url": "https://www.bookstores.com/books/case-files-family-medicine-5th-edition-eugene-c-toy/9781260468595",
                "rating": 4.5,
                "price": 44.00,
                "img_file": "9781260468595.jpg",
                "genres": ["Culture"],
            },
            {
                "name": "A Breath of Snow and Ashes",
                "desc": "The large scope of the novel allows Gabaldon to do what she does best, paint in exquisite detail the lives of her characters.",
                "year": 2005,
                "director": "Diana Gabaldon",
                "cast": "Elijah Wood, Ian McKellen, Orlando Bloom",
                "duration": 992,
                "trailer_url": "https://www.bookstores.com/books/a-breath-of-snow-and-ashes-diana-gabaldon/9780385324168",
                "rating": 4.6,
                "price": 7.47,
                "img_file": "9780385324168.jpg",
                "genres": ["Magazine"],
            },
            {
                "name": "Ettinger's Textbook of Veterinary Internal Medicine",
                "desc": "Now Ettinger's trusted, all-in-one veterinary resource is even better! Trusted by small animal veterinarians for more than 50 years, Ettinger's Textbook of Veterinary Internal Medicine adds new content on the field's leading issues and trends to its unmatched, \"gold standard\" coverage of the diagnosis and treatment of medical problems of dogs and cats. Coverage begins with the basics of veterinary medicine, followed by sections on differential diagnosis for chief complaints and for clinicopathologic abnormalities, and continues with techniques, minimally invasive interventional therapies, critical care, toxicology, diseases by body system, and comorbidities.",
                "year": 2024,
                "director": "Stephen J. Ettinger (Editor), Edward C. Feldman (Editor), Etienne Cote (Editor)",
                "cast": "Tom Hanks, Robin Wright, Gary Sinise",
                "duration": 2448,
                "trailer_url": "https://www.bookstores.com/books/ettingers-textbook-of-veterinary-internal-medicine/9780323779319",
                "rating": 4.6,
                "price": 207.02,
                "img_file": "9780323779319.jpg",
                "genres": ["Romance"],
            },
            {
                "name": "Art of Computer Programming, the, Volumes 1-4B, Boxed Set",
                "desc": 'Countless readers have spoken about the profound personal influence of Knuth\'s work. Scientists have marveled at the beauty and elegance of his analysis, while ordinary programmers have successfully applied his "cookbook" solutions to their day-to-day problems. All have admired Knuth for the breadth, clarity, accuracy, and good humor found in his books.',
                "year": 2022,
                "director": "Donald Knuth",
                "cast": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
                "duration": 736,
                "trailer_url": "https://www.bookstores.com/books/art-of-computer-programming-the-volumes-1-4b-boxed-set/9780137935109",
                "rating": 4.5,
                "price": 239.92,
                "img_file": "9780137935109.jpg",
                "genres": ["Education", "Science"],
            },
            {
                "name": "Fourth Wing",
                "desc": "A #1 New York Times bestseller * Optioned for TV by Amazon Studios * Amazon Best Books of the Year, #4 * Apple Best Books of the Year 2023 * Barnes & Noble Best Fantasy Book of 2023 * NPR \"Books We Love\" 2023 * Audible Best Books of 2023 * Hudson Book of the Year * Google Play Best Books of 2023 * Indigo Best Books of 2023 * Waterstones Book of the Year finalist * Goodreads Choice Award, semi-finalist * Newsweek Staffers' Favorite Books of 2023 * Paste Magazine's Best Books of 2023.",
                "year": 2023,
                "director": "Rebecca Yarros",
                "cast": "Robert De Niro, Ray Liotta, Joe Pesci",
                "duration": 528,
                "trailer_url": "https://www.bookstores.com/books/fourth-wing-rebecca-yarros/9781649374042",
                "rating": 4.6,
                "price": 23.47,
                "img_file": "9781649374042.jpg",
                "genres": ["Education", "Science"],
            },
            {
                "name": "The Housemaid Is Watching",
                "desc": "A twisting, pulse-pounding thriller from Freida McFadden, the New York Times bestselling author of The Housemaid and The Coworker.",
                "year": 2024,
                "director": "Freida McFadden",
                "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
                "duration": 400,
                "price": 15.35,
                "trailer_url": "https://www.bookstores.com/books/the-housemaid-is-watching-freida-mcfadden/9781464221132",
                "rating": 4.5,
                "img_file": "9781464221132.jpg",
                "genres": ["Education", "Science"],
            },
        ]

        # Prepare all book objects in memory first
        book_objects = []
        image_tasks = []

        for index in range(1, 256):
            book_data = books_data[index % 10]
            book = Book(
                userId=index,
                name=book_data["name"],
                desc=book_data["desc"],
                year=book_data["year"],
                director=book_data["director"],
                duration=book_data["duration"],
                trailer_url=book_data["trailer_url"],
                rating=book_data["rating"],
                price=book_data["price"],
            )
            book_objects.append(book)

            # Prepare image path for later processing
            file_name = book_data["img_file"]
            local_path = os.path.join(settings.MEDIA_ROOT, "gallery", file_name)
            image_tasks.append((book, local_path, file_name))

        # Bulk create all books at once
        Book.objects.bulk_create(book_objects)

        # Process images in parallel
        self._process_images(image_tasks)

        # Add genres through M2M (optimized)
        all_books = Book.objects.all()
        with ThreadPoolExecutor() as executor:
            for book in all_books:
                book_data = books_data[book.userId % 10]
                executor.submit(book.genres.add, *[genres[name] for name in book_data["genres"]])

        return list(all_books)

    def _process_images(self, image_tasks):
        """Process book images in parallel"""

        def process_task(task):
            book, local_path, file_name = task
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    book.img.save(file_name, File(f))
                    book.save()

        with ThreadPoolExecutor() as executor:
            executor.map(process_task, image_tasks)

    def _add_comments(self, books):
        """Bulk create comments with optimized operations"""
        sample_comments = {
            "male_names": [
                "James",
                "Michael",
                "William",
                "Daniel",
                "David",
                "Robert",
                "John",
                "Thomas",
                "Matthew",
                "Christopher",
                "Joseph",
                "Andrew",
                "Edward",
                "Mark",
                "Brian",
                "Steven",
                "Kevin",
                "Jason",
                "Timothy",
                "Jeffrey",
                "Ryan",
                "Jacob",
                "Gary",
                "Nicholas",
                "Eric",
                "Jonathan",
                "Stephen",
                "Justin",
                "Charles",
                "Anthony",
                "Richard",
                "Scott",
            ],
            "female_names": [
                "Emma",
                "Sophia",
                "Olivia",
                "Ava",
                "Isabella",
                "Mia",
                "Charlotte",
                "Amelia",
                "Harper",
                "Evelyn",
                "Abigail",
                "Emily",
                "Elizabeth",
                "Sofia",
                "Madison",
                "Avery",
                "Ella",
                "Scarlett",
                "Grace",
                "Victoria",
                "Lily",
                "Samantha",
                "Eleanor",
                "Hannah",
                "Lillian",
                "Addison",
                "Aubrey",
                "Layla",
                "Ellie",
                "Stella",
                "Natalie",
                "Zoe",
                "Leah",
                "Haley",
            ],
            "positive_comments": [
                "Absolutely loved this book! A masterpiece that stands the test of time.",
                "One of the best books I've ever seen. The acting was phenomenal.",
                "Incredible storytelling and direction. This book deserves all the praise!",
                "The cinematography was breathtaking. Every frame looked like a painting.",
                "A perfect blend of emotion and technical brilliance.",
                "This book had me on the edge of my seat the entire time!",
                "I've watched this multiple times and it gets better with each viewing.",
                "The score perfectly complements the storytelling. A true classic!",
                "Masterful performances by the entire cast. Truly unforgettable.",
                "This book changed my perspective on cinema. Absolutely brilliant.",
            ],
            "mixed_comments": [
                "Good book overall, though some scenes dragged on a bit too long.",
                "Solid performances, but the plot had a few holes I couldn't ignore.",
                "Visually stunning, but the character development felt a bit weak.",
                "Enjoyed it, but I think it's slightly overrated in some aspects.",
                "A good book that could have been great with some tighter editing.",
                "Interesting concept but the execution was somewhat inconsistent.",
                "Worth watching, though I expected a bit more given all the hype.",
                "Some brilliant moments mixed with a few that didn't quite land.",
            ],
            "critical_comments": [
                "Not my cup of tea. I found the pacing to be too slow.",
                "The plot was confusing and hard to follow at times.",
                "I expected more given the high ratings. A bit disappointing.",
                "The characters weren't believable enough for me to get invested.",
                "Technically well-made but emotionally distant.",
            ],
        }

        # Prepare all comment objects in memory
        comment_objects = []
        now = timezone.now()

        for book in books:
            num_comments = random.randint(3, 8)

            # Determine sentiment distribution
            if book.rating >= 4.5:
                weights = [0.8, 0.15, 0.05]  # positive, mixed, critical
            elif book.rating >= 4.0:
                weights = [0.6, 0.3, 0.1]
            else:
                weights = [0.4, 0.4, 0.2]

            for _ in range(num_comments):
                sentiment = random.choices(["positive", "mixed", "critical"], weights=weights, k=1)[0]

                if sentiment == "positive":
                    text = random.choice(sample_comments["positive_comments"])
                elif sentiment == "mixed":
                    text = random.choice(sample_comments["mixed_comments"])
                else:
                    text = random.choice(sample_comments["critical_comments"])

                days_ago = random.randint(1, 60)
                comment_date = now - timedelta(days=days_ago)

                use_male = random.choice([True, False])
                name = random.choice(sample_comments["male_names"] if use_male else sample_comments["female_names"])

                comment_objects.append(Comment(movie=book, name=name, content=text, created_at=comment_date))

        # Bulk create all comments at once
        Comment.objects.bulk_create(comment_objects)
        self.stdout.write(f"Added {len(comment_objects)} comments in bulk.")
