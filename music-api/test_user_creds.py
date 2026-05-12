import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

load_dotenv()

def test_user_credentials():
    client_id = os.getenv("SPOTIPY_CLIENT_ID")
    client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
    
    print(f"Testing with ID: {client_id}")
    
    try:
        auth_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        sp = spotipy.Spotify(auth_manager=auth_manager)
        
        # Test fetching a playlist
        playlist = sp.playlist("37i9dQZF1DXcBWIGoYBM5M", fields="tracks")
        
        tracks = playlist['tracks']['items']
        print(f"SUCCESS! Found {len(tracks)} tracks.")
        for i, item in enumerate(tracks[:5]):
            track = item['track']
            print(f"{i+1}. {track['name']} by {track['artists'][0]['name']}")
            
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_user_credentials()
