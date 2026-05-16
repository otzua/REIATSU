import json

with open('/tmp/episodes_21.json', 'r') as f:
    data = json.load(f)

providers = data.get('data', {}).get('providers', {})
print(f"Providers: {list(providers.keys())}")
for prov, prov_data in providers.items():
    episodes = prov_data.get('episodes', {})
    print(f"  {prov}: categories={list(episodes.keys())}")
    for cat, ep_list in episodes.items():
        print(f"    {cat}: count={len(ep_list)}")
        if ep_list:
            print(f"      sample: {ep_list[0].get('id')}")
