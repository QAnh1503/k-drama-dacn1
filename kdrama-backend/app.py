@app.get("/metadata")
async def get_metadata():
    # Nên lấy từ các file actor_scores.csv, director_scores.csv đã xuất
    actors = pd.read_csv('actor_scores.csv')['actor'].tolist()
    directors = pd.read_csv('director_scores.csv')['directors'].tolist()
    
    return {
        "actors": actors,
        "directors": directors
    }