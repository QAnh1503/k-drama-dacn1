import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Cấu hình CORS để Next.js gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BƯỚC 1: ĐỊNH NGHĨA LẠI CÁC HÀM TIỀN XỬ LÝ (BẮT BUỘC) ---
def my_tokenizer(text):
    return text.split()

def clean_tags(text):
    return str(text).replace('(Vote tags)', '').replace(',', ' ')

# --- BƯỚC 2: LOAD CÁC FILE .PKL ---
# Đảm bảo bạn để các file này trong thư mục 'models'
models_dict = joblib.load('models/models_ridge.pkl')
mlb = joblib.load('models/mlb_genres.pkl')
tfidf_tag = joblib.load('models/tfidf_tag.pkl')
tfidf_content = joblib.load('models/tfidf_content.pkl')
encoding_maps = joblib.load('models/encoding_maps.pkl')
feature_lists = joblib.load('models/feature_lists.pkl')  # Load danh sách cột để AI không bị "lẫn lộn"

# Các mốc Popularity (Bạn có thể lấy từ kết quả print ở Colab rồi điền số cứng vào đây)
THRESHOLD_HOT = 500  # Ví dụ: Hạng dưới 500 là HOT
THRESHOLD_MEDIUM = 1500

# --- BƯỚC 3: ĐỊNH NGHĨA SCHEMA DỮ LIỆU NHẬN TỪ REACT ---
class MovieInput(BaseModel):
    title: str
    main_lead1: str
    main_lead2: str
    directors: str
    screenwriters: str
    genres: str
    tags: str
    content: str
    episodes: int
    duration_mins: int
    start_year: int
    start_month: int
    age_rating: str

# --- BƯỚC 4: LOGIC DỰ ĐOÁN ---
@app.post("/predict")
async def predict_kdrama(data: MovieInput):
    # 1. Chuyển input về DataFrame
    input_df = pd.DataFrame([data.dict()])

    # 2. Xử lý các cột số & Thời gian
    input_df['movie_age'] = 2026 - data.start_year
    input_df['start_month_sin'] = np.sin(2 * np.pi * data.start_month / 12)
    input_df['start_month_cos'] = np.cos(2 * np.pi * data.start_month / 12)
    
    age_map = {'G': 1, '13+': 2, '15+': 3, '18+': 4, 'Unknown': 0}
    input_df['age_rating_val'] = age_map.get(data.age_rating, 0)

    # 3. Apply Target Encoding (Lấy điểm từ encoding_maps.pkl)
    def get_score(val, map_type):
        return encoding_maps[map_type].get(val, encoding_maps['global_mean'])

    input_df['main_lead1_score'] = get_score(data.main_lead1, 'lead1')
    input_df['main_lead2_score'] = get_score(data.main_lead2, 'lead2')
    input_df['directors_score'] = get_score(data.directors, 'director')
    input_df['screenwriters_score'] = get_score(data.screenwriters, 'screenwriter')

    # 4. Xử lý NLP (TF-IDF & MLB)
    genres_list = [i.strip() for i in data.genres.split(',')]
    genres_encoded = mlb.transform([genres_list])
    
    tags_cleaned = clean_tags(data.tags)
    tags_encoded = tfidf_tag.transform([tags_cleaned])
    
    content_encoded = tfidf_content.transform([data.content])

    # 5. Kết hợp tất cả đặc trưng y hệt hàm finalize_df trong Colab
    # Lưu ý: Bạn cần tạo đúng các cột mà model Ridge yêu cầu
    # (Ở đây cần thận trọng vì mỗi model Rating/Watchers có list features riêng)
    # Tạo DataFrame từ các mảng NLP (Genres, Tags, Content)
    genres_df = pd.DataFrame(genres_encoded, columns=[f"genre_{c}" for c in mlb.classes_])
    tags_df = pd.DataFrame(tags_encoded.toarray(), columns=[f"tag_{c}" for c in tfidf_tag.get_feature_names_out()])
    content_df = pd.DataFrame(content_encoded.toarray(), columns=[f"txt_{c}" for c in tfidf_content.get_feature_names_out()])

    # Gom các cột số (numeric_features)
    # Lưu ý: 'watchers_log', 'popularity_log', 'rating' trong code Colab là cột mục tiêu, 
    # nhưng khi dự đoán phim MỚI ta chưa có chúng, nên ta không đưa vào X_total.
    numeric_features = [
        'episodes', 'duration_mins', 'start_year', 'movie_age', 'age_rating_val',
        'main_lead1_score', 'main_lead2_score', 'directors_score', 'screenwriters_score',
        'start_month_sin', 'start_month_cos'
    ]
    res_numeric = input_df[numeric_features].reset_index(drop=True)

    # Tạo DataFrame tổng hợp X_total (bao gồm hàng trăm cột)
    X_total = pd.concat([res_numeric, genres_df, tags_df, content_df], axis=1)


    # 6. Dự đoán (Dùng feature_lists để lọc đúng cột cho mỗi model)
    # 6.1. Dự đoán Rating
    # Lọc ra đúng 137 cột mà model Rating cần
    input_r = X_total[feature_lists['features_rating']]
    res_rating = models_dict['Rating'].predict(input_r)[0]
    
    # 6.2. Dự đoán Watchers
    # Lọc ra đúng 180 cột mà model Watchers cần
    input_w = X_total[feature_lists['features_watchers']]
    log_watchers = models_dict['Watchers (Log)'].predict(input_w)[0]
    res_watchers = np.expm1(log_watchers) # Chuyển từ Log về số người thực

    # 6.3. Dự đoán Popularity (Hạng)
    # Lọc ra đúng 176 cột mà model Popularity cần
    input_p = X_total[feature_lists['features_pop']]
    log_pop = models_dict['Popularity (Log)'].predict(input_p)[0]
    rank_pop = np.expm1(log_pop) # Chuyển từ Log về Hạng thực (ví dụ: Hạng 100)

    # Xác định nhãn Popularity dựa trên mốc Threshold
    def get_status(rank):
        if rank <= THRESHOLD_HOT: return "🔥 HOT (Cực kỳ phổ biến)"
        if rank <= THRESHOLD_MEDIUM: return "📈 Trung bình"
        return "☁️ Thấp"

    return {
        "predicted_rating": round(float(res_rating), 2),
        "predicted_watchers": int(res_watchers),
        "popularity_rank": int(rank_pop),
        "popularity_level": get_status(rank_pop)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)