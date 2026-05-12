import sys
import os
import requests
import pyotp
import json

_SP_TOTP_SECRET = "GM3TMMJTGYZTQNZVGM4DINJZHA4TGOBYGMZTCMRTGEYDSMJRHE4TEOBUG4YTCMRUGQ4DQOJUGQYTAMRRGA2TCMJSHE3TCMBY"
_SP_TOTP_VERSION = 61

def main():
    totp = pyotp.TOTP(_SP_TOTP_SECRET)
    code = totp.now()
    resp = requests.get(
        "https://open.spotify.com/api/token",
        params={
            "reason": "init",
            "productType": "web-player",
            "totp": code,
            "totpVer": str(_SP_TOTP_VERSION),
            "totpServer": code,
        },
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        timeout=10,
    )
    token = resp.json().get("accessToken")
    print(f"Token: {token[:10]}...")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "App-Platform": "WebPlayer",
        "Spotify-App-Version": "1.0.0",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    
    playlist_id = "37i9dQZF1DXcBWIGoYBM5M"
    payload = {
        "variables": {
            "uri": f"spotify:playlist:{playlist_id}",
            "offset": 0,
            "limit": 50,
            "enableWatchFeedEntrypoint": False
        },
        "operationName": "fetchPlaylist",
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": "bb67e0af06e8d6f52b531f97468ee4acd44cd0f82b988e15c2ea47b1148efc77"
            }
        }
    }
    
    resp2 = requests.post(
        "https://api-partner.spotify.com/pathfinder/v2/query",
        headers=headers,
        json=payload,
        timeout=15,
    )
    
    print(f"Status: {resp2.status_code}")
    print("Response JSON:")
    print(json.dumps(resp2.json(), indent=2)[:1000])

if __name__ == "__main__":
    main()
