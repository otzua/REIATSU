import requests
import random

def get_free_proxy():
    print("Fetching free proxies...")
    resp = requests.get("https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps")
    if resp.ok:
        data = resp.json()
        proxies = data.get('data', [])
        if proxies:
            proxy = random.choice(proxies)
            return f"http://{proxy['ip']}:{proxy['port']}"
    return None

if __name__ == "__main__":
    p = get_free_proxy()
    print(f"Got proxy: {p}")
