import psycopg2

def test_full_database():
    try:
        # Kết nối đến Postgres
        conn = psycopg2.connect(
            host="localhost", 
            database="kdrama", 
            user="postgres", 
            password="123456"
        )
        cur = conn.cursor()
        print("✅ Kết nối Postgres thành công!\n")

        # 1. Kiểm tra thống kê phim (Public Schema)
        cur.execute("SELECT start_year, COUNT(*) FROM public.dramas GROUP BY start_year ORDER BY start_year DESC LIMIT 3")
        print("--- THỐNG KÊ PHIM THEO NĂM ---")
        for row in cur.fetchall():
            print(f"Năm {row[0]}: {row[1]} bộ phim")

        # 2. Kiểm tra Bảng điểm (Scoring Data Schema)
        print("\n--- KIỂM TRA BẢNG ĐIỂM (SCORING) ---")
        
        cur.execute("SELECT COUNT(*) FROM scoring_data.actor_scores")
        print(f"Số lượng Diễn viên: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM scoring_data.director_scores")
        print(f"Số lượng Đạo diễn: {cur.fetchone()[0]}")
        
        cur.execute("SELECT COUNT(*) FROM scoring_data.writer_scores")
        print(f"Số lượng Biên kịch: {cur.fetchone()[0]}")

        cur.close()
        conn.close()
        print("\n=> Database của bạn đã sẵn sàng phối hợp với AI!")
        
    except Exception as e:
        print(f"❌ Lỗi rồi: {e}")

test_full_database()