"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { getBooks } from "@/dynamic/v2-data";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { BookEditor, type BookEditorData } from "@/components/books/BookEditor";
import type { Book } from "@/data/books";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, BookOpen, Edit, Trash2, Plus, Save, Mail, MapPin, Globe, Heart, FileText, Bookmark } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  favoriteGenres: string;
};

const buildFallbackBook = (bookId: string): Book => ({
  id: bookId,
  title: bookId,
  synopsis: "Dataset entry not found for this seed.",
  year: new Date().getFullYear(),
  duration: 320,
  rating: 4,
  director: "Unknown Author",
  cast: [],
  trailerUrl: "",
  poster: "/media/gallery/default_book.png",
  genres: ["General"],
  category: "General",
  imagePath: "gallery/default_book.png",
});

const parseGenreList = (value: string) =>
  value
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);

export default function ProfilePage() {
  const { currentUser, addAllowedBook, removeAllowedBook, removeFromReadingList } = useAuth();
  const books = getBooks();
  const initialProfileState: ProfileFormState = {
    firstName: "",
    lastName: "",
    email: currentUser ? `${currentUser.username}@autobooks.com` : "",
    bio: "",
    location: "",
    website: "",
    favoriteGenres: "",
  };

  const [profileForm, setProfileForm] = useState<ProfileFormState>(initialProfileState);
  const [previousProfileValues, setPreviousProfileValues] = useState<ProfileFormState>(initialProfileState);
  const [bookMessage, setBookMessage] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [addBookMessage, setAddBookMessage] = useState<string | null>(null);
  const [addBookKey, setAddBookKey] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    setProfileForm((prev) => ({
      ...prev,
      email: prev.email || `${currentUser.username}@autobooks.com`,
    }));
    setPreviousProfileValues((prev) => ({
      ...prev,
      email: prev.email || `${currentUser.username}@autobooks.com`,
    }));
  }, [currentUser]);

  // Move useMemo before conditional return to follow Rules of Hooks
  const addBookTemplate = useMemo(() => buildFallbackBook(`new-book-${addBookKey}`), [addBookKey]);
  const dyn = useDynamicSystem();

  if (!currentUser) {
    return (
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen flex items-center justify-center">
        {/* Background grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        {/* Background gradient overlays */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
        
        <main className="relative mx-auto max-w-2xl px-4 py-16 text-white">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 text-center backdrop-blur-sm shadow-2xl">
            <h1 className="text-3xl font-semibold">Please sign in</h1>
            <p className="mt-3 text-white/70">Sign in with the credential provided in your task instructions.</p>
            <SeedLink
              href="/login"
              className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary hover:bg-secondary/10 transition-colors"
            >
              Go to login
            </SeedLink>
          </div>
        </main>
      </div>
    );
  }

  const entries = currentUser.allowedBooks.map((bookId) => ({
    bookId,
    book: books.find((book) => book.id === bookId),
  }));

  const handleProfileInputChange = (key: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const favoriteGenres = parseGenreList(profileForm.favoriteGenres);
    const previousGenres = parseGenreList(previousProfileValues.favoriteGenres);
    logEvent(EVENT_TYPES.EDIT_USER_BOOK, {
      username: currentUser.username,
      first_name: profileForm.firstName.trim() || null,
      last_name: profileForm.lastName.trim() || null,
      email: profileForm.email.trim() || `${currentUser.username}@autobooks.com`,
      bio: profileForm.bio.trim() || null,
      location: profileForm.location.trim() || null,
      website: profileForm.website.trim() || null,
      favorite_genres: favoriteGenres,
      previous_values: {
        first_name: previousProfileValues.firstName || null,
        last_name: previousProfileValues.lastName || null,
        email: previousProfileValues.email || null,
        bio: previousProfileValues.bio || null,
        location: previousProfileValues.location || null,
        website: previousProfileValues.website || null,
        favorite_genres: previousGenres,
      },
    });
    setPreviousProfileValues(profileForm);
    setProfileMessage("Profile updated successfully.");
  };

  const handleEntryEdit = (baseBook: Book, data: BookEditorData) => {
    logEvent(EVENT_TYPES.EDIT_BOOK, {
      book_id: baseBook.id,
      username: currentUser.username,
      name: data.title,
      author: data.director,
      year: Number.parseInt(data.year, 10),
      rating: Number.parseFloat(data.rating),
      pages: Number.parseInt(data.duration, 10),
      genres: data.genres.split(",").map((g) => g.trim()).filter(Boolean),
    });
    setBookMessage(`Book edited: ${baseBook.title}`);
  };

  const handleEntryDelete = (baseBook: Book) => {
    logEvent(EVENT_TYPES.DELETE_BOOK, {
      book_id: baseBook.id,
      username: currentUser.username,
      name: baseBook.title,
    });
    
    // Remove the book from the user's allowed books
    removeAllowedBook(baseBook.id);
    
    setBookMessage(`Book deleted: ${baseBook.title}`);
  };

  const handleAddBook = (data: BookEditorData) => {
    // Generate a unique book ID based on timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const newBookId = `book-v2-${timestamp}`;
    
    logEvent(EVENT_TYPES.ADD_BOOK, {
      book_id: newBookId,
      username: currentUser.username,
      name: data.title,
      author: data.director,
      year: Number.parseInt(data.year, 10),
      rating: Number.parseFloat(data.rating),
      pages: Number.parseInt(data.duration, 10),
      genres: data.genres.split(",").map((g) => g.trim()).filter(Boolean),
    });
    
    // Add the new book to the user's allowed books
    addAllowedBook(newBookId);
    
    setAddBookMessage(`Book added: ${data.title}`);
    setAddBookKey((prev) => prev + 1);
  };

  return (
    dyn.v1.addWrapDecoy("profile-page", (
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen" id={dyn.v3.getVariant("profile-page", ID_VARIANTS_MAP, "profile-page")}>
        {/* Background grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        {/* Background gradient overlays */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
        
        {dyn.v1.addWrapDecoy("profile-content", (
          <main className="relative mx-auto max-w-5xl px-4 py-10 text-white" id={dyn.v3.getVariant("profile-content", ID_VARIANTS_MAP, "profile-content")}>
            {/* Header */}
            {dyn.v1.addWrapDecoy("profile-header", (
              <header className="mb-8" id={dyn.v3.getVariant("profile-header", ID_VARIANTS_MAP, "profile-header")}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30">
                    <User className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">Profile</p>
                    <h1 className="text-3xl md:text-4xl font-bold" id={dyn.v3.getVariant("profile-title", ID_VARIANTS_MAP, "profile-title")}>
                      {dyn.v3.getVariant("profile_welcome", TEXT_VARIANTS_MAP, "Welcome")}, {currentUser.username}
                    </h1>
                  </div>
                </div>
                <p className="text-white/70">
                  {dyn.v3.getVariant("profile_description", TEXT_VARIANTS_MAP, "Manage your profile and assigned books for validation.")}
                </p>
              </header>
            ), "profile-header-wrap")}

        {/* Success Messages */}
        {profileMessage && (
          <div className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-green-200">{profileMessage}</p>
          </div>
        )}
        {bookMessage && (
          <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-200">{bookMessage}</p>
          </div>
        )}
        {addBookMessage && (
          <div className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-green-200">{addBookMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {dyn.v3.getVariant("edit_profile", TEXT_VARIANTS_MAP, "Edit Profile")}
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {dyn.v3.getVariant("edit_books", TEXT_VARIANTS_MAP, "Edit Books")}
            </TabsTrigger>
            <TabsTrigger value="reading-list" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              {dyn.v3.getVariant("reading_list", TEXT_VARIANTS_MAP, "Reading List")}
            </TabsTrigger>
            <TabsTrigger value="add-books" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {dyn.v3.getVariant("add_books", TEXT_VARIANTS_MAP, "Add Books")}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {dyn.v1.addWrapDecoy("edit-profile-section", (
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl" id={dyn.v3.getVariant("edit-profile-section", ID_VARIANTS_MAP, "edit-profile-section")}>
                <div className="flex items-center gap-3 mb-6">
                  <Edit className="h-5 w-5 text-secondary" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{dyn.v3.getVariant("edit_profile", TEXT_VARIANTS_MAP, "Edit Profile")}</h2>
                    <p className="text-sm text-white/70">Update your profile information and preferences.</p>
                  </div>
                </div>
                
                {dyn.v1.addWrapDecoy("edit-profile-form", (
                  <form className="space-y-6" onSubmit={handleProfileSubmit} id={dyn.v3.getVariant("edit-profile-form", ID_VARIANTS_MAP, "edit-profile-form")}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <User className="h-4 w-4 text-secondary" />
                      First Name
                    </label>
                    <Input 
                      value={profileForm.firstName} 
                      onChange={(event) => handleProfileInputChange("firstName", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <User className="h-4 w-4 text-secondary" />
                      Last Name
                    </label>
                    <Input 
                      value={profileForm.lastName} 
                      onChange={(event) => handleProfileInputChange("lastName", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <Mail className="h-4 w-4 text-secondary" />
                      Email
                    </label>
                    <Input 
                      value={profileForm.email} 
                      onChange={(event) => handleProfileInputChange("email", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <Heart className="h-4 w-4 text-secondary" />
                      Favorite Genres
                    </label>
                    <Input
                      value={profileForm.favoriteGenres}
                      onChange={(event) => handleProfileInputChange("favoriteGenres", event.target.value)}
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="Fiction, Mystery, Romance..."
                    />
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      Location
                    </label>
                    <Input 
                      value={profileForm.location} 
                      onChange={(event) => handleProfileInputChange("location", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                      <Globe className="h-4 w-4 text-secondary" />
                      Website
                    </label>
                    <Input 
                      value={profileForm.website} 
                      onChange={(event) => handleProfileInputChange("website", event.target.value)} 
                      className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20" 
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <FileText className="h-4 w-4 text-secondary" />
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(event) => handleProfileInputChange("bio", event.target.value)}
                    className="w-full min-h-[120px] rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                    <div className="flex flex-wrap gap-3 pt-2">
                      {dyn.v1.addWrapDecoy("save-profile-button", (
                        <Button 
                          type="submit"
                          id={dyn.v3.getVariant("save-profile-button", ID_VARIANTS_MAP, "save-profile-button")}
                          className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "h-12 px-8 bg-secondary text-black hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 transition-all hover:scale-105")}
                        >
                          <Save className="h-5 w-5 mr-2" />
                          {dyn.v3.getVariant("save_profile", TEXT_VARIANTS_MAP, "Save Profile")}
                        </Button>
                      ), "save-profile-button-wrap")}
                    </div>
                  </form>
                ), "edit-profile-form-wrap")}
              </div>
            ), "edit-profile-section-wrap")}
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            {dyn.v1.addWrapDecoy("edit-books-section", (
              <div className="space-y-4" id={dyn.v3.getVariant("edit-books-section", ID_VARIANTS_MAP, "edit-books-section")}>
                {entries.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <h2 className="text-2xl font-bold text-white">{dyn.v3.getVariant("edit_books", TEXT_VARIANTS_MAP, "Edit Books")}</h2>
                    <span className="text-sm text-white/60">({entries.length})</span>
                  </div>
                )}
                
                {entries.map(({ bookId, book }) => {
                  const baseBook = book ?? buildFallbackBook(bookId);
                  return (
                    dyn.v1.addWrapDecoy(`book-entry-${bookId}`, (
                      <div key={bookId} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wide text-white/50 mb-2">
                              {dyn.v3.getVariant("assigned_book", TEXT_VARIANTS_MAP, "Assigned Book")}
                            </p>
                            <h3 className="text-2xl font-bold text-white mb-2">{baseBook.title}</h3>
                        {book ? (
                          <>
                            <p className="text-sm text-white/70 mb-4 line-clamp-2">{book.synopsis}</p>
                            <div className="grid gap-3 text-sm text-white/80 md:grid-cols-2">
                              <div className="space-y-2">
                                <p><span className="text-white/50">Author:</span> <span className="font-medium">{book.director}</span></p>
                                <p><span className="text-white/50">Year:</span> <span className="font-medium">{book.year}</span></p>
                                <p><span className="text-white/50">Pages:</span> <span className="font-medium">{book.duration}</span></p>
                              </div>
                              <div className="space-y-2">
                                <p><span className="text-white/50">Genres:</span> <span className="font-medium">{book.genres.join(", ")}</span></p>
                                <p><span className="text-white/50">Contributors:</span> <span className="font-medium">{book.cast.slice(0, 3).join(", ")}{book.cast.length > 3 ? "..." : ""}</span></p>
                                <p><span className="text-white/50">Rating:</span> <span className="font-medium">{book.rating}</span></p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-white/60">
                            This book is not available in the current dataset, but you can still edit or delete it.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                            {book && (
                              dyn.v1.addWrapDecoy(`view-details-button-${bookId}`, (
                                <SeedLink
                                  href={`/books/${book.id}`}
                                  id={dyn.v3.getVariant("view-details-button", ID_VARIANTS_MAP, `view-details-button-${bookId}`)}
                                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                                >
                                  <BookOpen className="h-4 w-4" />
                                  {dyn.v3.getVariant("view_details", TEXT_VARIANTS_MAP, "View Details")}
                                </SeedLink>
                              ), `view-details-button-wrap-${bookId}`)
                            )}
                            {dyn.v1.addWrapDecoy(`delete-book-button-${bookId}`, (
                              <Button
                                variant="ghost"
                                id={dyn.v3.getVariant("delete-book-button", ID_VARIANTS_MAP, `delete-book-button-${bookId}`)}
                                className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors"
                                onClick={() => handleEntryDelete(baseBook)}
                              >
                                <Trash2 className="h-4 w-4" />
                                {dyn.v3.getVariant("delete_book", TEXT_VARIANTS_MAP, "Delete Book")}
                              </Button>
                            ), `delete-book-button-wrap-${bookId}`)}
                          </div>
                          
                          <div className="border-t border-white/10 pt-6">
                            <BookEditor book={baseBook} onSubmit={(data) => handleEntryEdit(baseBook, data)} submitLabel={dyn.v3.getVariant("save_changes", TEXT_VARIANTS_MAP, "Save Changes")} />
                          </div>
                        </div>
                      ), `book-entry-wrap-${bookId}`)
                    );
                  })}
                </div>
              ), "edit-books-section-wrap")}
          </TabsContent>

          {/* Reading List Tab */}
          <TabsContent value="reading-list" className="space-y-6">
            {dyn.v1.addWrapDecoy("reading-list-section", (
              <div className="space-y-4" id={dyn.v3.getVariant("reading-list-section", ID_VARIANTS_MAP, "reading-list-section")}>
                {currentUser.readingList && currentUser.readingList.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <Bookmark className="h-5 w-5 text-secondary" />
                    <h2 className="text-2xl font-bold text-white">
                      {dyn.v3.getVariant("reading_list", TEXT_VARIANTS_MAP, "Reading List")}
                    </h2>
                    <span className="text-sm text-white/60">({currentUser.readingList.length})</span>
                  </div>
                )}
                
                {currentUser.readingList && currentUser.readingList.length > 0 ? (
                  <div className="space-y-4">
                    {currentUser.readingList.map((bookId) => {
                      const book = books.find((b) => b.id === bookId);
                      const baseBook = book ?? buildFallbackBook(bookId);
                      
                      return (
                        dyn.v1.addWrapDecoy(`reading-list-item-${bookId}`, (
                          <div key={bookId} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <div
                                    className="w-24 h-32 rounded-xl bg-cover bg-center shadow-xl"
                                    style={{ backgroundImage: `url(${baseBook.poster}), url('/media/gallery/default_book.png')` }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Reading List</p>
                                    <h3 className="text-2xl font-bold text-white mb-2">{baseBook.title}</h3>
                                    {book ? (
                                      <>
                                        <p className="text-sm text-white/70 mb-4 line-clamp-2">{book.synopsis}</p>
                                        <div className="grid gap-3 text-sm text-white/80 md:grid-cols-2">
                                          <div className="space-y-2">
                                            <p><span className="text-white/50">Author:</span> <span className="font-medium">{book.director}</span></p>
                                            <p><span className="text-white/50">Year:</span> <span className="font-medium">{book.year}</span></p>
                                            <p><span className="text-white/50">Pages:</span> <span className="font-medium">{book.duration}</span></p>
                                          </div>
                                          <div className="space-y-2">
                                            <p><span className="text-white/50">Genres:</span> <span className="font-medium">{book.genres.join(", ")}</span></p>
                                            <p><span className="text-white/50">Rating:</span> <span className="font-medium">{book.rating}</span></p>
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-sm text-white/60">
                                        This book is not available in the current dataset.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                              {book && (
                                dyn.v1.addWrapDecoy(`view-details-reading-${bookId}`, (
                                  <SeedLink
                                    href={`/books/${book.id}`}
                                    id={dyn.v3.getVariant("view-details-button", ID_VARIANTS_MAP, `view-details-reading-${bookId}`)}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                                  >
                                    <BookOpen className="h-4 w-4" />
                                    {dyn.v3.getVariant("view_details", TEXT_VARIANTS_MAP, "View Details")}
                                  </SeedLink>
                                ), `view-details-reading-wrap-${bookId}`)
                              )}
                              {dyn.v1.addWrapDecoy(`remove-from-list-button-${bookId}`, (
                                <Button
                                  variant="ghost"
                                  id={dyn.v3.getVariant("remove-from-list-button", ID_VARIANTS_MAP, `remove-from-list-button-${bookId}`)}
                                  className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors"
                                  onClick={() => {
                                    removeFromReadingList(bookId);
                                    setBookMessage(`Book removed from reading list: ${baseBook.title}`);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {dyn.v3.getVariant("remove_from_list", TEXT_VARIANTS_MAP, "Remove from List")}
                                </Button>
                              ), `remove-from-list-button-wrap-${bookId}`)}
                            </div>
                          </div>
                        ), `reading-list-item-wrap-${bookId}`)
                      );
                    })}
                  </div>
                ) : (
                <div className="rounded-3xl border border-dashed border-white/20 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center backdrop-blur-sm">
                  <Bookmark className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Your reading list is empty</h3>
                  <p className="text-white/70 mb-6">
                    Start building your reading list by adding books from the catalog.
                  </p>
                  <SeedLink
                    href="/search"
                    className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/20 px-6 py-3 text-sm font-semibold text-secondary hover:bg-secondary hover:text-black transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Browse Books
                  </SeedLink>
                </div>
              )}
              </div>
            ), "reading-list-section-wrap")}
          </TabsContent>

          {/* Add Books Tab */}
          <TabsContent value="add-books" className="space-y-6">
            {dyn.v1.addWrapDecoy("add-books-section", (
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl" id={dyn.v3.getVariant("add-books-section", ID_VARIANTS_MAP, "add-books-section")}>
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="h-5 w-5 text-secondary" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {dyn.v3.getVariant("add_books", TEXT_VARIANTS_MAP, "Add Books")}
                    </h2>
                    <p className="text-sm text-white/70">Add a new book to the catalog.</p>
                  </div>
                </div>
                <BookEditor
                  key={`add-book-${addBookKey}`}
                  book={addBookTemplate}
                  onSubmit={handleAddBook}
                  submitLabel={dyn.v3.getVariant("add_book", TEXT_VARIANTS_MAP, "Add Book")}
                />
              </div>
            ), "add-books-section-wrap")}
          </TabsContent>
        </Tabs>
        </main>
      ), "profile-content-wrap")}
    </div>
    ), "profile-page-wrap")
  );
}
