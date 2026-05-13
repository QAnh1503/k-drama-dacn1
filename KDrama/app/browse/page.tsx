"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/footer"
import { DramaCarousel } from "@/components/drama-carousel"
import { Search, Play, Star, X, Heart, MessageCircle, Send } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { Drama } from "@/components/types/drama"


// Cast member data
const castMembers = [
  { name: "Hyun Bin", role: "Ri Jeong-hyeok", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { name: "Son Ye-jin", role: "Yoon Se-ri", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { name: "Seo Ji-hye", role: "Seo Dan", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { name: "Kim Jung-hyun", role: "Gu Seung-jun", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
]

// User reviews data
interface Review {
  id: number
  username: string
  avatar: string | null 
  comment: string
  date: string
  rating: number
}
const userReviews = [
  {
    id: 1,
    username: "DramaFan2024",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    comment: "Best K-drama I have ever watched! The chemistry between the leads is amazing.",
    date: "January 15, 2024" 
  },
  {
    id: 2,
    username: "SeoulWatcher",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop",
    comment: "A perfect blend of romance, comedy, and political intrigue. Highly recommend!",
    date: "January 10, 2024"
  },
  {
    id: 3,
    username: "KoreanDrama",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=50&h=50&fit=crop",
    comment: "This drama made me laugh and cry. The supporting cast is also fantastic.",
    date: "January 5, 2024"
  },
]

// Sample drama data with full details
const allDramas = [
  { 
    id: 1, 
    title: "Crash Landing on You", 
    year: 2019, 
    episodes: 16, 
    rating: 9.1, 
    genre: "Romance",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop",
    description: "A South Korean heiress accidentally paraglides into North Korea and falls in love with an army officer who helps her hide. This heartwarming romance crosses political boundaries and showcases the power of love.",
    director: "Lee Jeong-hyo",
    cast: castMembers,
    trailerUrl: "https://www.youtube.com/embed/eXMjTXL2Vks",
    reviews: userReviews,
    likes: 2847
  },
  { id: 2, title: "Itaewon Class", year: 2020, episodes: 16, rating: 8.6, genre: "Drama", imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop", description: "An ex-con opens a bar in Itaewon and begins a quest to take down the family that ruined his life.", director: "Kim Sung-yoon", cast: castMembers, trailerUrl: "https://www.youtube.com/embed/NsYvP1KjNvs", reviews: userReviews, likes: 1923 },
  { id: 3, title: "Vincenzo", year: 2021, episodes: 20, rating: 8.9, genre: "Action", imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop", description: "A Korean-Italian mafia lawyer returns to Korea and uses unorthodox methods against a powerful conglomerate.", director: "Kim Hee-won", cast: castMembers, trailerUrl: "https://www.youtube.com/embed/MHb7RFNM3NQ", reviews: userReviews, likes: 2156 },
  { id: 4, title: "Hospital Playlist", year: 2020, episodes: 12, rating: 9.0, genre: "Melodrama", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop", description: "Five doctors who have been friends since medical school navigate their careers and personal lives.", director: "Shin Won-ho", cast: castMembers, trailerUrl: "https://www.youtube.com/embed/hDJCPVDTp5M", reviews: userReviews, likes: 1847 },
  { id: 5, title: "Reply 1988", year: 2015, episodes: 20, rating: 9.2, genre: "Comedy", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop", description: "Five families living in the same neighborhood in 1988 Seoul share their stories of love and friendship.", director: "Shin Won-ho", cast: castMembers, trailerUrl: "https://www.youtube.com/embed/0g-G5hN2Hs8", reviews: userReviews, likes: 3124 },
  { id: 6, title: "Guardian", year: 2016, episodes: 16, rating: 8.7, genre: "Fantasy", imageUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop", description: "A goblin needs a human bride to end his immortal life, and finds one in a high school student.", director: "Lee Eung-bok", cast: castMembers, trailerUrl: "https://www.youtube.com/embed/yLUt_Giu4dg", reviews: userReviews, likes: 2567 },
  { id: 7, title: "Descendant of the Sun", year: 2016, episodes: 16, rating: 8.5, genre: "Romance", imageUrl: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop", description: "A love story between a soldier and a doctor set against the backdrop of a fictional war-torn country.", director: "Lee Eung-bok", cast: castMembers, trailerUrl: "https://www.youtube.com/embed/yJz8NHg7VkU", reviews: userReviews, likes: 1756 },
  { id: 8, title: "Hotel Del Luna", year: 2019, episodes: 16, rating: 8.8, genre: "Fantasy", imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop", description: "A hotel for ghosts is run by an ill-tempered woman who is stuck there as punishment for a past sin.", director: "Oh Choong-hwan", cast: castMembers, trailerUrl: "https://www.youtube.com/embed/4gVhxJaHbEI", reviews: userReviews, likes: 2089 },
]

const trendingDramas = allDramas.slice(1, 8)
const topRatedDramas = allDramas.filter(d => d.rating >= 8.5)
const romanceDramas = allDramas.filter(d => d.genre === "Romance" || d.genre === "Melodrama")
const thrillerDramas = allDramas.filter(d => d.genre === "Action" || d.genre === "Fantasy")

const genres = ["All Genres", "Romance", "Thriller", "Melodrama", "Fantasy", "Historical", "Comedy", "Action", "Mystery"]
const years = ["All Years", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"]
const sortOptions = ["Highest Rated", "Latest", "Most Popular", "Alphabetical"]

// interface Drama {
//   id: number
//   title: string
//   year: number
//   episodes: number
//   rating: number
//   genre: string
//   imageUrl: string
//   description: string
//   director: string
//   cast: typeof castMembers
//   trailerUrl: string
//   reviews: typeof userReviews
//   likes: number
// }

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All Genres")
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [selectedSort, setSelectedSort] = useState("Highest Rated")
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Review form states
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [userReviewsList, setUserReviewsList] = useState<Record<number, Review[]>>({})
  
  // Similar dramas carousel ref
  const similarDramasRef = useRef<HTMLDivElement>(null)
  
  const { user, toggleLikeDrama, isLiked } = useAuth()

  const handleDramaClick = (drama: Drama) => {
    setSelectedDrama(drama)
    setIsDialogOpen(true)
  }

  const handleLike = () => {
    if (selectedDrama && user) {
      toggleLikeDrama(selectedDrama.id)
    }
  }

  const scrollSimilarDramas = (direction: 'left' | 'right') => {
    if (similarDramasRef.current) {
      const scrollAmount = 200
      similarDramasRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

   const handleSubmitReview = () => {
    if (!selectedDrama || !user || !userComment.trim() || userRating === 0) return
    
    const newReview = {
      id: Date.now(),
      username: user.name,
      avatar: user.avatar,
      comment: userComment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      rating: userRating
    }
    
    setUserReviewsList(prev => ({
      ...prev,
      [selectedDrama.id]: [...(prev[selectedDrama.id] || []), newReview]
    }))
    
    // Reset form
    setUserComment("")
    setUserRating(0)
  }

  const getReviewsForDrama = (dramaId: number) => {
    const drama = allDramas.find(d => d.id === dramaId)
    const baseReviews = drama?.reviews || []
    const userAddedReviews = userReviewsList[dramaId] || []
    return [...baseReviews, ...userAddedReviews]
  }

  const featuredDrama = allDramas[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Browse K-Dramas</h1>
        <p className="mt-3 text-muted-foreground">
          Discover popular Korean dramas with our recommendation system
        </p>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-6 py-6">
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search dramas, actors, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-32 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-36 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Drama */}
      <div className="container mx-auto px-6 pb-8">
        <Card 
          className="group relative overflow-hidden rounded-2xl border-border bg-card cursor-pointer"
          onClick={() => handleDramaClick(featuredDrama)}
        >
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={featuredDrama.imageUrl}
              alt={featuredDrama.title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <span className="inline-block rounded bg-primary px-3 py-1 text-xs font-semibold uppercase text-primary-foreground">
                Featured
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                {featuredDrama.title}
              </h2>
              <p className="mt-3 max-w-lg text-gray-300 line-clamp-2">
                {featuredDrama.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold text-yellow-500">{featuredDrama.rating}</span>
                </div>
                <span>{featuredDrama.year}</span>
                <span>{featuredDrama.episodes} Episodes</span>
                <span>{featuredDrama.genre}</span>
              </div>
              <Button className="mt-6 bg-primary hover:bg-primary/90">
                <Play className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Drama Carousels */}
      <div className="container mx-auto space-y-10 px-6 pb-12">
        <DramaCarousel title="Trending Now" dramas={trendingDramas} onDramaClick={handleDramaClick} />
        <DramaCarousel title="Top Rated" dramas={topRatedDramas} onDramaClick={handleDramaClick} />
        <DramaCarousel title="Romance" dramas={romanceDramas} onDramaClick={handleDramaClick} />
        <DramaCarousel title="Thriller & Mystery" dramas={thrillerDramas} onDramaClick={handleDramaClick} />
      </div>

      {/* Drama Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-card border-border p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedDrama?.title}
          </DialogTitle>
          {selectedDrama && (
            <ScrollArea className="max-h-[90vh]">
              {/* Banner Image */}
              <div className="relative aspect-video w-full">
                <Image
                  src={selectedDrama.imageUrl}
                  alt={selectedDrama.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Title & Info */}
                <div>
                  <h2 className="text-2xl font-bold">{selectedDrama.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold text-yellow-500">{selectedDrama.rating}</span>
                    </div>
                    <span>{selectedDrama.year}</span>
                    <span>{selectedDrama.episodes} Episodes</span>
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-primary">{selectedDrama.genre}</span>
                  </div>
                  {/* Stats: Likes & Reviews */}
                  <div className="mt-3 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4 text-primary" />
                      <span><span className="font-semibold text-foreground">{selectedDrama.likes.toLocaleString()}</span> likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span><span className="font-semibold text-foreground">{selectedDrama.reviews.length}</span> reviews</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {selectedDrama.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant={user && isLiked(selectedDrama.id) ? "default" : "outline"}
                    onClick={handleLike}
                    disabled={!user}
                    className={user && isLiked(selectedDrama.id) ? "bg-primary" : ""}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${user && isLiked(selectedDrama.id) ? "fill-current" : ""}`} />
                    {user && isLiked(selectedDrama.id) ? "Liked" : "Like"}
                  </Button>
                  {!user && (
                    <span className="text-sm text-muted-foreground self-center">
                      Login to like dramas
                    </span>
                  )}
                </div>

                {/* Trailer Section */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Trailer</h3>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={selectedDrama.trailerUrl}
                      title={`${selectedDrama.title} Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>

                {/* Cast Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cast</h3>
                  <div className="flex flex-wrap gap-6">
                    {selectedDrama.cast.map((member, index) => (
                      <div key={index} className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-muted">
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="mt-2 font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Reviews Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">User Reviews</h3>

                  {/* Add Review Form */}
                  {user ? (
                    <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="font-medium mb-3">Write a Review</p>
                      
                      {/* Star Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-muted-foreground">Your Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star 
                                className={`h-6 w-6 ${
                                  (hoverRating || userRating) >= star 
                                    ? "fill-yellow-500 text-yellow-500" 
                                    : "text-muted-foreground"
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                        {userRating > 0 && (
                          <span className="text-sm font-semibold text-yellow-500">{userRating}/5</span>
                        )}
                      </div>
                      
                      {/* Comment Input */}
                      <Textarea
                        placeholder="Share your thoughts about this drama..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="mb-3 bg-input resize-none"
                        rows={3}
                      />
                      
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={!userComment.trim() || userRating === 0}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Submit Review
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border text-center">
                      <p className="text-muted-foreground">
                        Please <a href="/login" className="text-primary hover:underline">login</a> to write a review
                      </p>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {selectedDrama.reviews.map((review) => (
                      <div key={review.id} className="flex gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={review.avatar}
                            alt={review.username}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{review.username}</p>
                            {'rating' in review && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs text-yellow-500">{review.rating}/5</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                          <p className="text-xs text-primary mt-1">{review.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Dramas */}
                {/* <div>
                  <h4 className="font-semibold mb-4">Recommended Similar Dramas</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {allDramas.filter(d => d.id !== selectedDrama.id).slice(0, 4).map((drama) => (
                      <div 
                        key={drama.id} 
                        className="relative aspect-[2/3] overflow-hidden rounded-lg cursor-pointer"
                        onClick={() => handleDramaClick(drama)}
                      >
                        <Image
                          src={drama.imageUrl}
                          alt={drama.title}
                          fill
                          className="object-cover transition-all hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-2">
                          <span className="text-xs font-medium text-white line-clamp-1">{drama.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
                <DramaCarousel
                  title="Recommended Similar Dramas"
                  dramas={allDramas.filter(d => d.id !== selectedDrama?.id).slice(0, 8)}
                  onDramaClick={handleDramaClick}
                />
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
