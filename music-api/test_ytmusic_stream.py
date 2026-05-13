from ytmusicapi import YTMusic
import json

def test_ytmusic_stream(query):
    print(f"--- TESTING YTMUSICAPI FOR: {query} ---")
    yt = YTMusic()
    try:
        print("1. Searching for song...")
        results = yt.search(query, filter="songs")
        if results:
            track = results[0]
            video_id = track['videoId']
            print(f"   - Found Video ID: {video_id}")
            
            print("2. Getting song details (including streamingData)...")
            song_info = yt.get_song(video_id)
            
            # Check if streamingData exists
            if 'streamingData' in song_info:
                print("   - SUCCESS! streamingData found.")
                formats = song_info['streamingData'].get('adaptiveFormats', [])
                # Look for audio/mp4 (m4a)
                audio_formats = [f for f in formats if 'audio' in f.get('mimeType', '')]
                if audio_formats:
                    best_audio = audio_formats[0]
                    print(f"   - Found Audio Format: {best_audio.get('mimeType')}")
                    print(f"   - Stream URL starts with: {best_audio.get('url')[:50]}...")
                    return True
                else:
                    print("   - FAILED: No audio formats in streamingData.")
            else:
                print("   - FAILED: No streamingData in response.")
        else:
            print("   - FAILED: No search results.")
    except Exception as e:
        print(f"   - ERROR: {e}")
    return False

if __name__ == "__main__":
    test_ytmusic_stream("Daft Punk - One More Time")
