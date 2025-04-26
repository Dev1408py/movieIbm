from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load data and model at startup
ratings_df = pd.read_csv(r"C:\Users\devpa\OneDrive\Documents\Desktop\movieibm\Model\Netflix_Dataset_Rating.csv")
movies_df = pd.read_csv(r"C:\Users\devpa\OneDrive\Documents\Desktop\movieibm\Model\Netflix_Dataset_Movie.csv")

user_item_matrix = ratings_df.pivot(index='User_ID', columns='Movie_ID', values='Rating').fillna(0)

with open(r'C:\Users\devpa\OneDrive\Documents\Desktop\movieibm\Model\movie_recommendation_model_svd-aneri.pkl', 'rb') as f:
    svd = pickle.load(f)

@app.route('/movies', methods=['GET'])
def get_movies():
    try:
        # Get all movies from the movies DataFrame
        movies = movies_df.to_dict('records')
        
        # Add default values for missing fields
        for movie in movies:
            movie.setdefault('image', "https://images.unsplash.com/photo-1440404653325-ab127d49abc1")
            movie.setdefault('duration', "2h")
            movie.setdefault('genre', ["Action", "Drama"])
            movie.setdefault('director', "Various")
            movie.setdefault('year', "2023")
            movie.setdefault('rating', "8.0")
            movie.setdefault('description', f"Watch {movie['Name']} - A great movie!")
        
        # Rename 'Name' to 'title' to match frontend expectations
        for movie in movies:
            movie['title'] = movie.pop('Name')
            movie['id'] = movie.pop('Movie_ID')
        
        return jsonify(movies)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    movie_name = data.get('movie_name')
    rating = data.get('rating')
    n_recommendations = data.get('n_recommendations', 5)
    
    # Validate input
    if not movie_name or rating is None:
        return jsonify({'error': 'Missing `movie_name` or `rating`'}), 400
    
    try:
        rating = float(rating)
        if not 0 <= rating <= 5:
            return jsonify({'error': 'Rating must be between 0 and 5'}), 400
    except ValueError:
        return jsonify({'error': 'Rating must be a number'}), 400
    
    # Get recommendations
    recommendations = recommend_movies(movie_name, rating, n_recommendations)
    if not recommendations:
        return jsonify({'error': 'Movie not found in database'}), 404
    
    return jsonify({
        'input_movie': movie_name,
        'input_rating': rating,
        'recommendations': recommendations
    })

def recommend_movies(movie_name, rating, n_recommendations=5):
    """Generate movie recommendations based on a single input movie and rating."""
    user_ratings_vector = np.zeros(user_item_matrix.shape[1])
    
    # Find the movie by name (case-insensitive)
    movie_row = movies_df[movies_df['Name'].str.lower() == movie_name.lower()]
    if movie_row.empty:
        return None  # Movie not found
    
    movie_id = movie_row['Movie_ID'].values[0]
    if movie_id in user_item_matrix.columns:
        user_ratings_vector[user_item_matrix.columns.get_loc(movie_id)] = rating
    
    # Generate recommendations using SVD
    user_ratings_transformed = svd.transform([user_ratings_vector])
    movie_scores = user_ratings_transformed @ svd.components_
    top_movie_indices = np.argsort(movie_scores[0])[-n_recommendations:][::-1]
    top_movie_ids = user_item_matrix.columns[top_movie_indices]
    top_movies = movies_df[movies_df['Movie_ID'].isin(top_movie_ids)]
    
    return top_movies[['Movie_ID', 'Name']].to_dict('records')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 