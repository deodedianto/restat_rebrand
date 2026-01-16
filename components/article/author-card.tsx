import Image from 'next/image'
import { Author } from '@/lib/authors'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Briefcase } from 'lucide-react'

interface AuthorCardProps {
  author: Author
}

export function AuthorCard({ author }: AuthorCardProps) {
  if (!author) return null

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-muted">
              {author.thumbnail ? (
                <Image
                  src={`/authors/${author.thumbnail}`}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Author Info */}
          <div className="flex-1 space-y-3">
            {/* Name and Title */}
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {author.name}
              </h3>
              {author.title && (
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{author.title}</span>
                </div>
              )}
            </div>

            {/* Description/Bio */}
            {author.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {author.description}
              </p>
            )}

            {/* Skills/Expertise */}
            {author.skills && author.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Keahlian:</h4>
                <div className="flex flex-wrap gap-2">
                  {author.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
