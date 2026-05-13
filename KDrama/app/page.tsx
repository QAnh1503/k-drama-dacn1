"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/footer"
import { Layers, Star, TrendingUp, HelpCircle } from "lucide-react"

const genres = [
  "Romance", "Thriller", "Melodrama", "Fantasy", "Historical", 
  "Comedy", "Action", "Mystery", "Horror", "Slice of Life"
]

const platforms = [
  "Netflix", "tvN", "JTBC", "SBS", "KBS", "MBC", "Disney+", "Viki"
]

interface PredictionResult {
  rating: number
  trend: "HIGH" | "MEDIUM" | "LOW"
  factors: { name: string; impact: number }[]
}

export default function PredictPage() {
  
  // const [formData, setFormData] = useState({
  //   dramaName: "",
  //   genre: "",
  //   platform: "",
  //   actors: "",     // Nhập dạng: Lee Min Ho, Gong Yoo
  //   director: "",
  //   writer: "",      // Mới
  //   tags: "",        // Mới
  //   content: "",     // Mới (Rất quan trọng cho TF-IDF)
  //   episodes: "16",
  //   duration: "60",  // Mới
  //   year: "2026",
  //   month: "5",      // Mới
  //   ageRating: "15+" // Mới
  // })
  
  
  // SẴN DỮ LIỆU MẪU ĐỂ BẠN TEST NHANH
  const [formData, setFormData] = useState({
    dramaName: "The Moonlight Sonata",
    genre: "Romance",
    platform: "Netflix",
    actors: "Kim Soo Hyun, Jun Ji Hyun", 
    director: "Park Shin Woo",
    writer: "Park Ji Eun",      
    tags: "Contract Relationship, Rich Male Lead, Emotional",        
    content: "A beautiful story about a pianist who loses his hearing and a violinist who helps him find his music again through a secret contract.", 
    episodes: "16",
    duration: "70",  
    year: "2026",
    month: "12",      
    ageRating: "15+" 
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // const handlePredict = async () => {
  //   setIsLoading(true)
  //   // Simulate AI prediction
  //   await new Promise(resolve => setTimeout(resolve, 1500))
    
  //   const rating = 7.5 + Math.random() * 2
  //   const trendRandom = Math.random()
  //   const trend: "HIGH" | "MEDIUM" | "LOW" = trendRandom > 0.6 ? "HIGH" : trendRandom > 0.3 ? "MEDIUM" : "LOW"
    
  //   setPrediction({
  //     rating: Math.round(rating * 10) / 10,
  //     trend,
  //     factors: [
  //       { name: "Actor Popularity", impact: 85 + Math.floor(Math.random() * 10) },
  //       { name: `Genre (${formData.genre || "Romance"})`, impact: 70 + Math.floor(Math.random() * 15) },
  //       { name: `Platform (${formData.platform || "Netflix"})`, impact: 65 + Math.floor(Math.random() * 15) },
  //       { name: "Director Reputation", impact: 55 + Math.floor(Math.random() * 20) },
  //       { name: "Episode Count", impact: 45 + Math.floor(Math.random() * 20) },
  //     ]
  //   })
  //   setIsLoading(false)
  // }
  const handlePredict = async () => {
    if (!formData.dramaName || !formData.content) {
      alert("Vui lòng nhập tên phim và nội dung tóm tắt!");
      return;
    }

    setIsLoading(true);
    try {
      // Tách tên diễn viên từ chuỗi nhập vào
      const actorList = formData.actors.split(",").map(a => a.trim());
      
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.dramaName,
          main_lead1: actorList[0] || "Unknown",
          main_lead2: actorList[1] || "Unknown",
          directors: formData.director,
          screenwriters: formData.writer || "Unknown",
          genres: formData.genre,
          tags: formData.tags,
          content: formData.content,
          episodes: parseInt(formData.episodes),
          duration_mins: parseInt(formData.duration),
          start_year: parseInt(formData.year),
          start_month: parseInt(formData.month),
          age_rating: formData.ageRating
        }),
      });

      if (!response.ok) throw new Error("Không thể kết nối đến Server AI");

      const result = await response.json();

      // Cập nhật kết quả từ AI thật vào giao diện
      setPrediction({
        rating: result.predicted_rating,
        trend: result.popularity_rank <= 500 ? "HIGH" : (result.popularity_rank <= 1500 ? "MEDIUM" : "LOW"),
        factors: [
          // { name: "Dự kiến người xem (Watchers)", impact: Math.min(Math.round((result.predicted_watchers / 100000) * 100), 100) },
          { name: "Lượt xem dự kiến", impact: Math.min(Math.round((result.predicted_watchers / 50000) * 100), 100) },
          { name: "Thứ hạng phổ biến (Rank)", impact: Math.max(100 - Math.round(result.popularity_rank / 50), 5) },
          { name: "Độ Hot", impact: result.popularity_level.includes("HOT") ? 95 : 50 }
        ]
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Lỗi kết nối Backend! Hãy đảm bảo file main.py đang chạy.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "HIGH": return "text-green-500"
      case "MEDIUM": return "text-yellow-500"
      case "LOW": return "text-red-500"
      default: return "text-muted-foreground"
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return "text-green-500"
    if (rating >= 7.5) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          Predict <span className="text-primary">K-Drama Ratings</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter drama details to get AI-powered rating predictions and trend analysis
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Drama Information</CardTitle>
              <CardDescription>Fill in the details of the Korean drama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drama Name */}
              <div className="space-y-2">
                <Label htmlFor="dramaName">Drama Name</Label>
                <Input
                  id="dramaName"
                  placeholder="Enter drama name..."
                  value={formData.dramaName}
                  onChange={(e) => setFormData({ ...formData, dramaName: e.target.value })}
                  className="bg-input"
                />
              </div>

              {/* Genre & Platform */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(value) => setFormData({ ...formData, genre: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Select genre..." />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Main Actors */}
              <div className="space-y-2">
                <Label htmlFor="actors">Main Actors</Label>
                <Input
                  id="actors"
                  placeholder="Enter main actors (comma separated)..."
                  value={formData.actors}
                  onChange={(e) => setFormData({ ...formData, actors: e.target.value })}
                  className="bg-input"
                />
              </div>

              {/* Director */}
              <div className="space-y-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  placeholder="Enter director name..."
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  className="bg-input"
                />
              </div>

              {/* Episodes & Year */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="episodes">Number of Episodes</Label>
                  <Input
                    id="episodes"
                    type="number"
                    value={formData.episodes}
                    onChange={(e) => setFormData({ ...formData, episodes: e.target.value })}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Release Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="bg-input"
                  />
                </div>
              </div>
              
              {/* Thay thế Input Month bằng Select */}
              <div className="space-y-2">
                <Label>Release Month</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => setFormData({ ...formData, month: value })}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Select month..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Thay thế Input Age Rating bằng Select: */}
              <div className="space-y-2">
                <Label>Age Rating</Label>
                <Select
                  value={formData.ageRating}
                  onValueChange={(value) => setFormData({ ...formData, ageRating: value })}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Select age rating..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["G", "13+", "15+", "18+"].map((rating) => (
                      <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Thêm ô nhập Biên kịch */}
              <div className="space-y-2">
                <Label htmlFor="writer">Screenwriter</Label>
                <Input
                  id="writer"
                  placeholder="Enter screenwriter name..."
                  value={formData.writer}
                  onChange={(e) => setFormData({ ...formData, writer: e.target.value })}
                />
              </div>

              {/* Thêm ô nhập Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. Revenge, Hidden Identity, Medical"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              {/* Thêm ô nhập Content (Dùng Textarea) */}
              <div className="space-y-2">
                <Label htmlFor="content">Synopsis / Content</Label>
                <textarea
                  id="content"
                  rows={4}
                  className="w-full rounded-md border bg-input p-2 text-sm"
                  placeholder="Paste the drama plot here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              {/* Predict Button */}
              <Button 
                onClick={handlePredict} 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                <Layers className="mr-2 h-4 w-4" />
                {isLoading ? "Analyzing..." : "Predict Rating"}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
              <CardDescription>AI-powered rating and trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {!prediction ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full border-2 border-dashed border-muted-foreground/50 p-6">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {"Enter drama details and click \"Predict\" to see results"}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Rating Display */}
                  <div className="text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <Star className={`h-8 w-8 fill-current ${getRatingColor(prediction.rating)}`} />
                      <span className={`text-5xl font-bold ${getRatingColor(prediction.rating)}`}>
                        {prediction.rating}
                      </span>
                      <span className="text-2xl text-muted-foreground">/ 10</span>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <TrendingUp className={`h-5 w-5 ${getTrendColor(prediction.trend)}`} />
                      <span className={`text-lg font-semibold ${getTrendColor(prediction.trend)}`}>
                        {prediction.trend} TREND
                      </span>
                    </div>
                  </div>

                  {/* Rating Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rating</span>
                      <span>{prediction.rating}/10</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          prediction.rating >= 8.5 ? "bg-green-500" : 
                          prediction.rating >= 7.5 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${prediction.rating * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Factors */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Key Prediction Factors</h4>
                    {prediction.factors.map((factor, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{factor.name}</span>
                          <span className="text-primary">{factor.impact}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div 
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${factor.impact}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
  
}


