import { Clock, BookOpen, User, Users, Calendar } from "lucide-react";
import type { Book } from "@/data/books";

interface MovieMetaProps {
  movie: Book;
}

export function MovieMeta({ movie }: MovieMetaProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl text-white">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-secondary" />
            <h2 className="text-2xl font-bold">Synopsis</h2>
          </div>
          <p className="text-lg text-white/80 leading-relaxed">{movie.synopsis}</p>
        </div>
        <div className="lg:border-l lg:border-white/10 lg:pl-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-5 w-5 text-secondary" />
            <h3 className="text-2xl font-bold">Book Details</h3>
          </div>
          <dl className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <dt className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Clock className="h-4 w-4 text-secondary" />
                Pages
              </dt>
              <dd className="text-base font-semibold text-white">{movie.duration}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <dt className="flex items-center gap-2 text-sm font-medium text-white/70">
                <BookOpen className="h-4 w-4 text-secondary" />
                Genres
              </dt>
              <dd className="text-base font-semibold text-white text-right max-w-[60%]">{movie.genres.slice(0, 3).join(", ") || "General"}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <dt className="flex items-center gap-2 text-sm font-medium text-white/70">
                <User className="h-4 w-4 text-secondary" />
                Author
              </dt>
              <dd className="text-base font-semibold text-white text-right max-w-[60%]">{movie.director}</dd>
            </div>
            <div className="flex items-start justify-between pt-2">
              <dt className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Users className="h-4 w-4 text-secondary" />
                Contributors
              </dt>
              <dd className="text-base font-semibold text-white text-right max-w-[60%]">{movie.cast.slice(0, 4).join(", ") || "Classified"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
