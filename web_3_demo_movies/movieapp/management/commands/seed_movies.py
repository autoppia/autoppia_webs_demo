import os
import random
from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from movieapp.models import Movie, Genre, Comment
from django.apps import apps 

class Command(BaseCommand):
    help = "Resets ALL tables and then seeds the database with initial movies, genres, and comments"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting to seed the database..."))
        all_models = apps.get_models()  
        for model in all_models:
            model.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("All tables have been reset (all records deleted)."))
        # Create genres
        genres_to_create = [
            "Action", "Adventure", "Animation", "Comedy", "Crime", 
            "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
            "Romance", "Sci-Fi", "Thriller", "War", "Western"
        ]
        
        genres = {}
        for genre_name in genres_to_create:
            genre, created = Genre.objects.get_or_create(name=genre_name)
            genres[genre_name] = genre
            status = "Created" if created else "Already exists"
            self.stdout.write(f"{status}: Genre '{genre_name}'")
        
        # Sample movie data (usando nombres de archivos locales en vez de URLs)
        movies_data = [
            {
                "name": "The Shawshank Redemption",
                "desc": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                "year": 1994,
                "director": "Frank Darabont",
                "cast": "Tim Robbins, Morgan Freeman, Bob Gunton",
                "duration": 142,
                "trailer_url": "https://www.youtube.com/watch?v=6hB3S9bIaco",
                "rating": 4.8,
                "img_file": "the-shawshank-redemption.jpg",  # <-- archivo local
                "genres": ["Drama"]
            },
            {
                "name": "The Godfather",
                "desc": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                "year": 1972,
                "director": "Francis Ford Coppola",
                "cast": "Marlon Brando, Al Pacino, James Caan",
                "duration": 175,
                "trailer_url": "https://www.youtube.com/watch?v=sY1S34973zA",
                "rating": 4.7,
                "img_file": "the-godfather.jpg",
                "genres": ["Crime", "Drama"]
            },
            {
                "name": "The Dark Knight",
                "desc": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                "year": 2008,
                "director": "Christopher Nolan",
                "cast": "Christian Bale, Heath Ledger, Aaron Eckhart",
                "duration": 152,
                "trailer_url": "https://www.youtube.com/watch?v=EXeTwQWrcwY",
                "rating": 4.7,
                "img_file": "the-dark-knight.jpg",
                "genres": ["Action", "Crime", "Drama", "Thriller"]
            },
            {
                "name": "Pulp Fiction",
                "desc": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                "year": 1994,
                "director": "Quentin Tarantino",
                "cast": "John Travolta, Uma Thurman, Samuel L. Jackson",
                "duration": 154,
                "trailer_url": "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
                "rating": 4.6,
                "img_file": "pulp-fiction.jpg",
                "genres": ["Crime", "Drama"]
            },
            {
                "name": "Inception",
                "desc": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                "year": 2010,
                "director": "Christopher Nolan",
                "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
                "duration": 148,
                "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                "rating": 4.5,
                "img_file": "inception.jpg",
                "genres": ["Action", "Adventure", "Sci-Fi", "Thriller"]
            },
            {
                "name": "The Lord of the Rings: The Fellowship of the Ring",
                "desc": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
                "year": 2001,
                "director": "Peter Jackson",
                "cast": "Elijah Wood, Ian McKellen, Orlando Bloom",
                "duration": 178,
                "trailer_url": "https://www.youtube.com/watch?v=V75dMMIW2B4",
                "rating": 4.6,
                "img_file": "the-lord-of-the-rings-the-fellowship-of-the-ring.jpg",
                "genres": ["Action", "Adventure", "Drama", "Fantasy"]
            },
            {
                "name": "Forrest Gump",
                "desc": "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
                "year": 1994,
                "director": "Robert Zemeckis",
                "cast": "Tom Hanks, Robin Wright, Gary Sinise",
                "duration": 142,
                "trailer_url": "https://www.youtube.com/watch?v=bLvqoHBptjg",
                "rating": 4.6,
                "img_file": "forrest-gump.jpg",
                "genres": ["Drama", "Romance"]
            },
            {
                "name": "The Matrix",
                "desc": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
                "year": 1999,
                "director": "Lana Wachowski, Lilly Wachowski",
                "cast": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
                "duration": 136,
                "trailer_url": "https://www.youtube.com/watch?v=vKQi3bBA1y8",
                "rating": 4.5,
                "img_file": "the-matrix.jpg",
                "genres": ["Action", "Sci-Fi"]
            },
            {
                "name": "Goodfellas",
                "desc": "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
                "year": 1990,
                "director": "Martin Scorsese",
                "cast": "Robert De Niro, Ray Liotta, Joe Pesci",
                "duration": 146,
                "trailer_url": "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
                "rating": 4.6,
                "img_file": "goodfellas.jpg",
                "genres": ["Biography", "Crime", "Drama"]
            },
            {
                "name": "Interstellar",
                "desc": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                "year": 2014,
                "director": "Christopher Nolan",
                "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
                "duration": 169,
                "trailer_url": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
                "rating": 4.5,
                "img_file": "interstellar.jpg",
                "genres": ["Adventure", "Drama", "Sci-Fi"]
            }
        ]

        # Sample comment data
        sample_comments = {
            "male_names": [
                "James", "Michael", "William", "Daniel", "David", "Robert", "John", "Thomas",
                "Matthew", "Christopher", "Joseph", "Andrew", "Edward", "Mark", "Brian", "Steven",
                "Kevin", "Jason", "Timothy", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas",
                "Eric", "Jonathan", "Stephen", "Justin", "Charles", "Anthony", "Richard", "Scott"
            ],
            "female_names": [
                "Emma", "Sophia", "Olivia", "Ava", "Isabella", "Mia", "Charlotte", "Amelia",
                "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Madison", "Avery",
                "Ella", "Scarlett", "Grace", "Victoria", "Lily", "Samantha", "Eleanor", "Hannah",
                "Lillian", "Addison", "Aubrey", "Layla", "Ellie", "Stella", "Natalie", "Zoe", "Leah", "Haley"
            ],
            "positive_comments": [
                "Absolutely loved this movie! A masterpiece that stands the test of time.",
                "One of the best films I've ever seen. The acting was phenomenal.",
                "Incredible storytelling and direction. This movie deserves all the praise!",
                "The cinematography was breathtaking. Every frame looked like a painting.",
                "A perfect blend of emotion and technical brilliance.",
                "This film had me on the edge of my seat the entire time!",
                "I've watched this multiple times and it gets better with each viewing.",
                "The score perfectly complements the storytelling. A true classic!",
                "Masterful performances by the entire cast. Truly unforgettable.",
                "This movie changed my perspective on cinema. Absolutely brilliant."
            ],
            "mixed_comments": [
                "Good film overall, though some scenes dragged on a bit too long.",
                "Solid performances, but the plot had a few holes I couldn't ignore.",
                "Visually stunning, but the character development felt a bit weak.",
                "Enjoyed it, but I think it's slightly overrated in some aspects.",
                "A good movie that could have been great with some tighter editing.",
                "Interesting concept but the execution was somewhat inconsistent.",
                "Worth watching, though I expected a bit more given all the hype.",
                "Some brilliant moments mixed with a few that didn't quite land."
            ],
            "critical_comments": [
                "Not my cup of tea. I found the pacing to be too slow.",
                "The plot was confusing and hard to follow at times.",
                "I expected more given the high ratings. A bit disappointing.",
                "The characters weren't believable enough for me to get invested.",
                "Technically well-made but emotionally distant."
            ]
        }
        
        # First check if movies already exist
        auto_confirm = os.environ.get('AUTO_SEED', 'false').lower() == 'true'
        
        if Movie.objects.count() > 0:
            if auto_confirm:
                Comment.objects.all().delete()
                Movie.objects.all().delete()
                self.stdout.write(self.style.SUCCESS("All existing movies and comments deleted."))
            else:
                self.stdout.write(self.style.WARNING(
                    "Movies already exist in the database. "
                    "Do you want to delete all existing movies and comments? (yes/no)"
                ))
                confirm = input()
                if confirm.lower() != 'yes':
                    self.stdout.write(self.style.SUCCESS("Seeding cancelled."))
                    return
                else:
                    Comment.objects.all().delete()
                    Movie.objects.all().delete()
                    self.stdout.write(self.style.SUCCESS("All existing movies and comments deleted."))
        
        # Create movies
        created_movies = []
        for movie_data in movies_data:
            try:
                # Nombre de archivo local que YA tienes en media/gallery
                file_name = movie_data['img_file']
                
                # Ruta absoluta hasta donde está tu imagen en media/gallery
                local_path = os.path.join(settings.MEDIA_ROOT, "gallery", file_name)
                
                # Creamos la instancia del Movie
                movie = Movie(
                    name=movie_data['name'],
                    desc=movie_data['desc'],
                    year=movie_data['year'],
                    director=movie_data['director'],
                    cast=movie_data['cast'],
                    duration=movie_data['duration'],
                    trailer_url=movie_data['trailer_url'],
                    rating=movie_data['rating']
                )
                movie.save()
                
                # Asignamos la imagen local (asumiendo que existe en media/gallery)
                if os.path.exists(local_path):
                    # Ajusta la ruta relativa para que Django la maneje
                    movie.img = f"gallery/{file_name}"
                    movie.save()
                    self.stdout.write(self.style.SUCCESS(
                        f"Using local image: Movie '{movie_data['name']}'"
                    ))
                else:
                    self.stdout.write(self.style.WARNING(
                        f"Image not found for '{movie_data['name']}': {local_path}"
                    ))
                
                # Añadimos géneros
                for genre_name in movie_data['genres']:
                    if genre_name in genres:
                        movie.genres.add(genres[genre_name])
                
                created_movies.append(movie)
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f"Error creating movie {movie_data['name']}: {e}"
                ))
        
        # Add comments to movies
        self.stdout.write(self.style.SUCCESS("Adding comments to movies..."))
        
        male_names = sample_comments["male_names"]
        female_names = sample_comments["female_names"]
        positive_comments = sample_comments["positive_comments"]
        mixed_comments = sample_comments["mixed_comments"]
        critical_comments = sample_comments["critical_comments"]
        
        now = timezone.now()
        
        # Define avatar associations - person1.jpg and person4.jpg are female, person2.png and person3.jpg are male
        female_avatars = ["person1.jpg", "person4.jpg"]
        male_avatars = ["person2.png", "person3.jpg"]
        
        for movie in created_movies:
            # Determine number of comments for this movie (3-8)
            num_comments = random.randint(3, 8)
            
            # Generate comments with different sentiment distributions based on rating
            if movie.rating >= 4.5:
                sentiment_weights = [0.8, 0.15, 0.05]  # 80% positive, 15% mixed, 5% critical
            elif movie.rating >= 4.0:
                sentiment_weights = [0.6, 0.3, 0.1]    # 60% positive, 30% mixed, 10% critical
            else:
                sentiment_weights = [0.4, 0.4, 0.2]    # 40% positive, 40% mixed, 20% critical
            
            for _ in range(num_comments):
                sentiment = random.choices(
                    ["positive", "mixed", "critical"], 
                    weights=sentiment_weights, 
                    k=1
                )[0]
                
                if sentiment == "positive":
                    comment_text = random.choice(positive_comments)
                elif sentiment == "mixed":
                    comment_text = random.choice(mixed_comments)
                else:
                    comment_text = random.choice(critical_comments)
                
                # Create a random date in the past 60 days
                days_ago = random.randint(1, 60)
                comment_date = now - timedelta(days=days_ago)
                
                # Randomly select gender and name
                use_male = random.choice([True, False])
                if use_male:
                    commenter_name = random.choice(male_names)
                    avatar_file = f"gallery/people/{random.choice(male_avatars)}"
                else:
                    commenter_name = random.choice(female_names)
                    avatar_file = f"gallery/people/{random.choice(female_avatars)}"
                
                Comment.objects.create(
                    movie=movie,
                    name=commenter_name,
                    content=comment_text,
                    created_at=comment_date
                )
            
            self.stdout.write(f"Added {num_comments} comments to '{movie.name}'")
        
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
