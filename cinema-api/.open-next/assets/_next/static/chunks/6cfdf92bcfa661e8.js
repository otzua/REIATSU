(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,77741,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(18566),r=e.i(22016),o=e.i(63415),i=e.i(67881),n=e.i(70065),l=e.i(94179),p=e.i(81140),d=e.i(30030),c=e.i(42727),m=e.i(96626),u=e.i(48425),h=e.i(86318),g=e.i(69340),x=e.i(10772),v="Tabs",[y,E]=(0,d.createContextScope)(v,[c.createRovingFocusGroupScope]),b=(0,c.createRovingFocusGroupScope)(),[f,T]=y(v),k=s.forwardRef((e,s)=>{let{__scopeTabs:a,value:r,onValueChange:o,defaultValue:i,orientation:n="horizontal",dir:l,activationMode:p="automatic",...d}=e,c=(0,h.useDirection)(l),[m,y]=(0,g.useControllableState)({prop:r,onChange:o,defaultProp:i??"",caller:v});return(0,t.jsx)(f,{scope:a,baseId:(0,x.useId)(),value:m,onValueChange:y,orientation:n,dir:c,activationMode:p,children:(0,t.jsx)(u.Primitive.div,{dir:c,"data-orientation":n,...d,ref:s})})});k.displayName=v;var U="TabsList",j=s.forwardRef((e,s)=>{let{__scopeTabs:a,loop:r=!0,...o}=e,i=T(U,a),n=b(a);return(0,t.jsx)(c.Root,{asChild:!0,...n,orientation:i.orientation,dir:i.dir,loop:r,children:(0,t.jsx)(u.Primitive.div,{role:"tablist","aria-orientation":i.orientation,...o,ref:s})})});j.displayName=U;var w="TabsTrigger",_=s.forwardRef((e,s)=>{let{__scopeTabs:a,value:r,disabled:o=!1,...i}=e,n=T(w,a),l=b(a),d=A(n.baseId,r),m=I(n.baseId,r),h=r===n.value;return(0,t.jsx)(c.Item,{asChild:!0,...l,focusable:!o,active:h,children:(0,t.jsx)(u.Primitive.button,{type:"button",role:"tab","aria-selected":h,"aria-controls":m,"data-state":h?"active":"inactive","data-disabled":o?"":void 0,disabled:o,id:d,...i,ref:s,onMouseDown:(0,p.composeEventHandlers)(e.onMouseDown,e=>{o||0!==e.button||!1!==e.ctrlKey?e.preventDefault():n.onValueChange(r)}),onKeyDown:(0,p.composeEventHandlers)(e.onKeyDown,e=>{[" ","Enter"].includes(e.key)&&n.onValueChange(r)}),onFocus:(0,p.composeEventHandlers)(e.onFocus,()=>{let e="manual"!==n.activationMode;h||o||!e||n.onValueChange(r)})})})});_.displayName=w;var R="TabsContent",Y=s.forwardRef((e,a)=>{let{__scopeTabs:r,value:o,forceMount:i,children:n,...l}=e,p=T(R,r),d=A(p.baseId,o),c=I(p.baseId,o),h=o===p.value,g=s.useRef(h);return s.useEffect(()=>{let e=requestAnimationFrame(()=>g.current=!1);return()=>cancelAnimationFrame(e)},[]),(0,t.jsx)(m.Presence,{present:i||h,children:({present:s})=>(0,t.jsx)(u.Primitive.div,{"data-state":h?"active":"inactive","data-orientation":p.orientation,role:"tabpanel","aria-labelledby":d,hidden:!s,id:c,tabIndex:0,...l,ref:a,style:{...e.style,animationDuration:g.current?"0s":void 0},children:s&&n})})});function A(e,t){return`${e}-trigger-${t}`}function I(e,t){return`${e}-content-${t}`}Y.displayName=R;var C=e.i(47163);function q({className:e,...s}){return(0,t.jsx)(k,{"data-slot":"tabs",className:(0,C.cn)("flex flex-col gap-2",e),...s})}function G({className:e,...s}){return(0,t.jsx)(j,{"data-slot":"tabs-list",className:(0,C.cn)("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",e),...s})}function P({className:e,...s}){return(0,t.jsx)(_,{"data-slot":"tabs-trigger",className:(0,C.cn)("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",e),...s})}function S({className:e,...s}){return(0,t.jsx)(Y,{"data-slot":"tabs-content",className:(0,C.cn)("flex-1 outline-none",e),...s})}let O=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);var D=e.i(74886),K=e.i(31343),$=e.i(43531),H=e.i(17521),H=H,M=e.i(72136),z=e.i(30009);let L=[{name:"4kHDHub Home",method:"GET",endpoint:"/api/4khdhub",provider:"4kHDHub",description:"Get recent movies and TV shows from 4kHDHub homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/4khdhub?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  imageUrl: string;
  year: string;
  season?: string;
  formats: string[];
}

const movies: Movie[] = await response.json();
console.log(movies);`,jsExample:`fetch(\`\${baseUrl}/api/4khdhub?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/4khdhub?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "title": "Inception (2010)",
    "url": "/inception-2010",
    "imageUrl": "https://...",
    "year": "2010",
    "formats": ["4K", "BluRay", "WEB-DL"]
  }
]`},{name:"4kHDHub Search",method:"GET",endpoint:"/api/4khdhub/search",provider:"4kHDHub",description:"Search movies and TV shows on 4kHDHub",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/4khdhub/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  title: string;
  url: string;
  imageUrl: string;
  year: string;
  season?: string;
  formats: string[];
}

const results: SearchResult[] = await response.json();
console.log(results);`,jsExample:`fetch(\`\${baseUrl}/api/4khdhub/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/4khdhub/search?q=inception" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "title": "Inception (2010)",
    "url": "/inception-2010",
    "imageUrl": "https://...",
    "year": "2010",
    "formats": ["4K", "BluRay", "WEB-DL"]
  }
]`},{name:"4kHDHub Details",method:"GET",endpoint:"/api/4khdhub/details",provider:"4kHDHub",description:"Get movie/show details and download links from 4kHDHub",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Movie/show URL path"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/4khdhub/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface MovieDetails {
  title: string;
  imageUrl: string;
  year: string;
  description: string;
  downloadLinks: Array<{
    quality: string;
    size: string;
    url: string;
  }>;
}

const details: MovieDetails = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/4khdhub/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/4khdhub/details?url=/inception-2010" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "Inception (2010)",
  "imageUrl": "https://...",
  "year": "2010",
  "description": "A thief who steals corporate secrets...",
  "downloadLinks": [
    {
      "quality": "4K BluRay",
      "size": "8.5GB",
      "url": "https://..."
    }
  ]
}`},{name:"4kHDHub Gadget Link Decoder",method:"GET",endpoint:"/api/4khdhub/gadget",provider:"4kHDHub",description:"Decode encrypted gadgetsweb.xyz links to get actual download/redirect links",requiresAuth:!0,parameters:[{name:"link",type:"string",required:!0,description:"Encrypted gadgetsweb.xyz link to decode"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/4khdhub/gadget?link=\${encodeURIComponent(gadgetLink)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface GadgetResponse {
  success: boolean;
  originalLink: string;
  decodedLink: string;
  finalLink: string;
}

const result: GadgetResponse = await response.json();
console.log(result);`,jsExample:`fetch(\`\${baseUrl}/api/4khdhub/gadget?link=\${encodeURIComponent(gadgetLink)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/4khdhub/gadget?link=https%3A%2F%2Fgadgetsweb.xyz%2F%3Fid%3D..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "originalLink": "https://gadgetsweb.xyz/?id=...",
  "decodedLink": "https://hubcloud.lol/...",
  "finalLink": "https://hubcloud.lol/drive/..."
}`},{name:"DesireMovies Home",method:"GET",endpoint:"/api/desiremovies",provider:"DesireMovies",description:"Get recent movies from DesireMovies homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/desiremovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  description: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,jsExample:`fetch(\`\${baseUrl}/api/desiremovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/desiremovies?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "id": "12345",
    "title": "Avatar: The Way of Water",
    "url": "/avatar-the-way-of-water-2022",
    "imageUrl": "https://...",
    "description": "Set more than a decade after..."
  }
]`},{name:"DesireMovies Search",method:"GET",endpoint:"/api/desiremovies/search",provider:"DesireMovies",description:"Search movies on DesireMovies",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/desiremovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  description: string;
}

const results: { query: string; results: Movie[] } = await response.json();
console.log(results);`,jsExample:`fetch(\`\${baseUrl}/api/desiremovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/desiremovies/search?q=avatar" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "query": "avatar",
  "results": [
    {
      "id": "avatar-2022",
      "title": "Avatar: The Way of Water",
      "url": "/avatar-the-way-of-water-2022",
      "imageUrl": "https://...",
      "description": "Set more than a decade after..."
    }
  ]
}`},{name:"DesireMovies Details",method:"GET",endpoint:"/api/desiremovies/details",provider:"DesireMovies",description:"Get movie details and download links from DesireMovies",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Movie URL path"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/desiremovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/desiremovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/desiremovies/details?url=/avatar-2022" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "Avatar: The Way of Water",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2.5GB",
      "url": "https://..."
    }
  ]
}`},{name:"Drive Home",method:"GET",endpoint:"/api/drive",provider:"Drive",description:"Get recent movies from Drive homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/drive?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  imageUrl: string;
  quality: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,jsExample:`fetch(\`\${baseUrl}/api/drive?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/drive?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "title": "Inception",
    "url": "/movie/inception-2010",
    "imageUrl": "https://...",
    "quality": "1080p"
  }
]`},{name:"Drive Search",method:"GET",endpoint:"/api/drive/search",provider:"Drive",description:"Search movies and TV shows on Drive",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"},{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/drive/search?q=\${query}&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  category: string[];
  imdbId: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    page: number;
    results: SearchResult[];
    totalResults: number;
    found: number;
  };
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/drive/search?q=\${query}&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/drive/search?q=inception&page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "query": "inception",
    "page": 1,
    "results": [
      {
        "id": "12345",
        "title": "Inception",
        "url": "/movie/inception-2010",
        "imageUrl": "https://...",
        "category": ["Action", "Sci-Fi"],
        "imdbId": "tt1375666"
      }
    ],
    "totalResults": 10,
    "found": 150
  }
}`},{name:"Drive Details",method:"GET",endpoint:"/api/drive/details",provider:"Drive",description:"Get detailed information and download links for a movie or TV show",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the movie/show page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/drive/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  title: string;
  url: string;
}

interface MovieDetails {
  title: string;
  imdbRating: string;
  language: string;
  year: string;
  episodeSize: string;
  completeZip: string;
  quality: string;
  format: string;
  storyline: string;
  screenshots: string[];
  downloadLinks: {
    "480p": DownloadLink[];
    "720p": DownloadLink[];
    "1080p": DownloadLink[];
    "4K": DownloadLink[];
  };
}

const details: MovieDetails = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/drive/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/drive/details?url=https%3A%2F%2Fdrive.com%2Fmovie%2Finception-2010" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "Inception (2010)",
  "imdbRating": "8.8/10",
  "language": "English",
  "year": "2010",
  "episodeSize": "300MB",
  "completeZip": "2.5GB",
  "quality": "BluRay",
  "format": "MKV",
  "storyline": "A thief who steals corporate secrets...",
  "screenshots": ["https://...", "https://..."],
  "downloadLinks": {
    "480p": [
      {
        "title": "480p x264",
        "url": "https://..."
      }
    ],
    "720p": [
      {
        "title": "720p x264",
        "url": "https://..."
      }
    ],
    "1080p": [
      {
        "title": "1080p x264",
        "url": "https://..."
      }
    ],
    "4K": []
  }
}`},{name:"Drive MDrive",method:"GET",endpoint:"/api/drive/mdrive",provider:"Drive",description:"Extract HubCloud download links for episodes or movies",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the page containing HubCloud links"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/drive/mdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Episode {
  episode: string;
  size: string;
  hubCloudUrl: string;
}

interface MDriveResponse {
  success: boolean;
  url: string;
  title: string;
  totalEpisodes: number;
  episodes: Episode[];
}

const data: MDriveResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/drive/mdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/drive/mdrive?url=https%3A%2F%2Fdrive.com%2Fseries%2Fbreaking-bad" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "url": "https://drive.com/series/breaking-bad",
  "title": "Breaking Bad S01",
  "totalEpisodes": 7,
  "episodes": [
    {
      "episode": "Ep1",
      "size": "150MB",
      "hubCloudUrl": "https://hubcloud.lol/..."
    },
    {
      "episode": "Ep2",
      "size": "155MB",
      "hubCloudUrl": "https://hubcloud.lol/..."
    }
  ]
}`},{name:"NetMirror Home",method:"GET",endpoint:"/api/netmirror",provider:"NetMirror",description:"Get recent content from NetMirror homepage",requiresAuth:!0,parameters:[],tsExample:`const response = await fetch(\`\${baseUrl}/api/netmirror\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface NetMirrorItem {
  id: string;
  title: string;
  imageUrl: string;
  postUrl: string;
  category: string;
}

interface Response {
  success: boolean;
  data: {
    items: NetMirrorItem[];
    totalResults: number;
  };
}

const result: Response = await response.json();
console.log(result);`,jsExample:`fetch(\`\${baseUrl}/api/netmirror\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/netmirror" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "items": [
      {
        "id": "12345",
        "title": "Movie Title",
        "imageUrl": "https://...",
        "postUrl": "/post/movie-title",
        "category": "Movies"
      }
    ],
    "totalResults": 50
  }
}`},{name:"Movies4u Home",method:"GET",endpoint:"/api/movies4u",provider:"Movies4u",description:"Get recent movies from Movies4u homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/movies4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  videoLabel: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,jsExample:`fetch(\`\${baseUrl}/api/movies4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/movies4u?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "id": "batman-2022",
    "title": "The Batman",
    "url": "/the-batman-2022",
    "imageUrl": "https://...",
    "videoLabel": "BluRay"
  }
]`},{name:"Movies4u Search",method:"GET",endpoint:"/api/movies4u/search",provider:"Movies4u",description:"Search movies on Movies4u",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"},{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/movies4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  videoLabel: string;
}

const results: SearchResult[] = await response.json();
console.log(results);`,jsExample:`fetch(\`\${baseUrl}/api/movies4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/movies4u/search?q=batman" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "id": "batman-2022",
    "title": "The Batman",
    "url": "/the-batman-2022",
    "imageUrl": "https://...",
    "videoLabel": "BluRay"
  }
]`},{name:"Movies4u Details",method:"GET",endpoint:"/api/movies4u/details",provider:"Movies4u",description:"Get movie details and download links from Movies4u",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Movie URL path"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/movies4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/movies4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/movies4u/details?url=/batman-2022" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "The Batman (2022)",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "3GB",
      "url": "https://..."
    }
  ]
}`},{name:"Movies4u M4U Links",method:"GET",endpoint:"/api/movies4u/m4ulinks",provider:"Movies4u",description:"Extract episode download links from Movies4u pages with Hub-Cloud and Direct-Drive-link options",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the Movies4u page containing episode links"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/movies4u/m4ulinks?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadOption {
  label: string;
  url: string;
  type: string; // Hub-Cloud, Direct-Drive-link, G-Drive, etc.
}

interface QualityDownload {
  quality: string; // Episode 1, Episode 2, etc.
  size: string;
  options: DownloadOption[];
}

interface M4ULinksData {
  title: string;
  note: string;
  downloads: QualityDownload[];
}

interface M4UResponse {
  success: boolean;
  data: M4ULinksData;
  hubcloudLinks: string[];
  totalEpisodes: number;
}

const result: M4UResponse = await response.json();
console.log(result);`,jsExample:`fetch(\`\${baseUrl}/api/movies4u/m4ulinks?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/movies4u/m4ulinks?url=https%3A%2F%2Fmovies4u.foo%2Fseries-episode-page" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "Always Use Official Website Movies4u.Foo",
    "note": "NOTE: In V-Cloud [Resumable] Download Option Show Download Limit Error then use {Download From Telegram 🔥} Option For Download in V-Cloud",
    "downloads": [
      {
        "quality": "Episode 1",
        "size": "N/A",
        "options": [
          {
            "label": "🚀 Hub-Cloud [DD]",
            "url": "https://hubcloud.foo/video/omxbqublmm6kfjy",
            "type": "Hub-Cloud"
          },
          {
            "label": "🚀 Direct-[Drive-link]",
            "url": "https://filebee.xyz/file/6669aabebdec4829239352b7",
            "type": "Direct-Drive-link"
          }
        ]
      },
      {
        "quality": "Episode 2",
        "size": "N/A",
        "options": [
          {
            "label": "🚀 Hub-Cloud [DD]",
            "url": "https://hubcloud.foo/video/mpsml6h8cfll6c8",
            "type": "Hub-Cloud"
          },
          {
            "label": "🚀 Direct-[Drive-link]",
            "url": "https://filebee.xyz/file/6669aabfbdec4829239352f4",
            "type": "Direct-Drive-link"
          }
        ]
      }
    ]
  },
  "hubcloudLinks": [
    "https://hubcloud.foo/video/omxbqublmm6kfjy",
    "https://hubcloud.foo/video/mpsml6h8cfll6c8"
  ],
  "totalEpisodes": 8
}`},{name:"HDHub4U Home",method:"GET",endpoint:"/api/hdhub4u",provider:"HDHub4U",description:"Get recent movies from HDHub4U homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/hdhub4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,jsExample:`fetch(\`\${baseUrl}/api/hdhub4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/hdhub4u?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "id": "avengers-2019",
    "title": "Avengers: Endgame",
    "url": "/movie/avengers-endgame-2019",
    "imageUrl": "https://..."
  }
]`},{name:"HDHub4U Search",method:"GET",endpoint:"/api/hdhub4u/search",provider:"HDHub4U",description:"Search movies on HDHub4U",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/hdhub4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface MovieResult {
  title: string;
  url: string;
  imageUrl: string;
  year?: string;
  quality?: string;
}

const results: MovieResult[] = await response.json();
console.log(results);`,jsExample:`fetch(\`\${baseUrl}/api/hdhub4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/hdhub4u/search?q=avengers" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "title": "Avengers: Endgame",
    "url": "/movie/avengers-endgame-2019",
    "imageUrl": "https://...",
    "year": "2019",
    "quality": "BluRay"
  }
]`},{name:"HDHub4U Details",method:"GET",endpoint:"/api/hdhub4u/details",provider:"HDHub4U",description:"Get movie details and download links",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Movie URL path"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/hdhub4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface MovieDetails {
  title: string;
  imageUrl: string;
  description: string;
  downloadLinks: Array<{
    quality: string;
    size: string;
    url: string;
  }>;
}

const details: MovieDetails = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/hdhub4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/hdhub4u/details?url=/movie/inception-2010" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "Inception (2010)",
  "imageUrl": "https://...",
  "description": "A thief who steals corporate secrets...",
  "downloadLinks": [
    {
      "quality": "1080p BluRay",
      "size": "2.4GB",
      "url": "https://..."
    }
  ]
}`},{name:"Zeefliz Home",method:"GET",endpoint:"/api/zeefliz",provider:"Zeefliz",description:"Get recent movies and shows from Zeefliz homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zeefliz?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  quality: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,jsExample:`fetch(\`\${baseUrl}/api/zeefliz?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zeefliz?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "id": "stranger-things",
    "title": "Stranger Things",
    "url": "/stranger-things-complete-series",
    "imageUrl": "https://...",
    "quality": "1080p"
  }
]`},{name:"Zeefliz Search",method:"GET",endpoint:"/api/zeefliz/search",provider:"Zeefliz",description:"Search movies and shows on Zeefliz",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"},{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zeefliz/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
}

const results: SearchResult[] = await response.json();
console.log(results);`,jsExample:`fetch(\`\${baseUrl}/api/zeefliz/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zeefliz/search?q=stranger" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "id": "stranger-things",
    "title": "Stranger Things",
    "url": "/stranger-things-complete-series",
    "imageUrl": "https://..."
  }
]`},{name:"Zeefliz Details",method:"GET",endpoint:"/api/zeefliz/details",provider:"Zeefliz",description:"Get movie/show details and download links from Zeefliz",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Content URL path"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zeefliz/details?url=\${contentUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/zeefliz/details?url=\${contentUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zeefliz/details?url=/movie-2024" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "Movie Title (2024)",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2GB",
      "url": "https://..."
    }
  ]
}`},{name:"Vega Movies Home",method:"GET",endpoint:"/api/vega",provider:"Vega Movies",description:"Get recent movies from Vega Movies homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/vega?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  imageUrl: string;
  date: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,jsExample:`fetch(\`\${baseUrl}/api/vega?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/vega?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "title": "Spider-Man: No Way Home",
    "url": "/movie/spiderman-no-way-home",
    "imageUrl": "https://...",
    "date": "2021-12-15"
  }
]`},{name:"Vega Movies Search",method:"GET",endpoint:"/api/vega/search",provider:"Vega Movies",description:"Search movies on Vega Movies",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/vega/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const results = await response.json();
console.log(results);`,jsExample:`fetch(\`\${baseUrl}/api/vega/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/vega/search?q=spiderman" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "title": "Spider-Man: No Way Home",
    "url": "/movie/spiderman-no-way-home",
    "imageUrl": "https://...",
    "year": "2021"
  }
]`},{name:"Vega Movies Details",method:"GET",endpoint:"/api/vega/details",provider:"Vega Movies",description:"Get movie details and download links from Vega Movies",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Movie URL path"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/vega/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/vega/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/vega/details?url=/spiderman-2021" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "Spider-Man: No Way Home",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2.8GB",
      "url": "https://..."
    }
  ]
}`},{name:"Vega Movies NextDrive",method:"GET",endpoint:"/api/vega/nextdrive",provider:"Vega Movies",description:"Extract V-Cloud download links from Vega Movies pages",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the Vega Movies page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/vega/nextdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VCloudLink {
  label: string;
  url: string;
}

interface NextDriveResponse {
  success: boolean;
  title: string;
  vcloudLinks: VCloudLink[];
}

const data: NextDriveResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/vega/nextdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/vega/nextdrive?url=https%3A%2F%2Fvegamovies.com%2Fmovie%2Fspiderman-2021" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "title": "Spider-Man: No Way Home",
  "vcloudLinks": [
    {
      "label": "V-Cloud 1080p",
      "url": "https://vcloud.lol/..."
    },
    {
      "label": "V-Cloud 720p",
      "url": "https://vcloud.lol/..."
    }
  ]
}`},{name:"ZinkMovies Home",method:"GET",endpoint:"/api/zinkmovies",provider:"ZinkMovies",description:"Get recent movies from ZinkMovies homepage (slider and trending)",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zinkmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  rating: string;
  quality: string;
  language: string;
  year: string;
  type: string;
}

interface Response {
  slider: Movie[];
  trending: Movie[];
}

const data: Response = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/zinkmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zinkmovies?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "slider": [
    {
      "id": "joker-2019",
      "title": "Joker",
      "url": "/movie/joker-2019",
      "imageUrl": "https://...",
      "rating": "8.4",
      "quality": "BluRay",
      "language": "English",
      "year": "2019",
      "type": "movie"
    }
  ],
  "trending": [...]
}`},{name:"ZinkMovies Search",method:"GET",endpoint:"/api/zinkmovies/search",provider:"ZinkMovies",description:"Search movies on ZinkMovies",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zinkmovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const results = await response.json();
console.log(results);`,jsExample:`fetch(\`\${baseUrl}/api/zinkmovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zinkmovies/search?q=joker" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`[
  {
    "title": "Joker",
    "url": "/movie/joker-2019",
     "imageUrl": "https://...",
    "rating": "8.4"
  }
]`},{name:"ZinkMovies Details",method:"GET",endpoint:"/api/zinkmovies/details",provider:"ZinkMovies",description:"Get movie details and download links from ZinkMovies",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Movie URL path"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zinkmovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/zinkmovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zinkmovies/details?url=/joker-2019" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "title": "Joker (2019)",
  "imageUrl": "https://...",
  "rating": "8.4",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2.1GB",
      "url": "https://..."
    }
  ]
}`},{name:"ZinkCloud Extract",method:"GET",endpoint:"/api/zinkmovies/zinkcloud",provider:"ZinkMovies",description:"Extract file info and HubCloud download links from ZinkCloud URL",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"ZinkCloud URL to extract"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zinkmovies/zinkcloud?url=\${encodeURIComponent(zinkcloudUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface ZinkCloudDetails {
  success: boolean;
  data: {
    fileInfo: {
      fileName: string;
      format: string;
      fileSize: string;
      addedOn: string;
    };
    hubCloudLinks: Array<{
      url: string;
      title: string;
    }>;
  };
}

const details: ZinkCloudDetails = await response.json();
console.log(details);`,jsExample:`fetch(\`\${baseUrl}/api/zinkmovies/zinkcloud?url=\${encodeURIComponent(zinkcloudUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zinkmovies/zinkcloud?url=https%3A%2F%2Fzinkcloud.example%2Ffile" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "fileInfo": {
      "fileName": "Movie.Name.2024.1080p.WEB-DL.mkv",
      "format": "MKV",
      "fileSize": "2.5 GB",
      "addedOn": "2024-01-15"
    },
    "hubCloudLinks": [
      {
        "url": "https://hubcloud.example/d/abc123",
        "title": "Download Link 1"
      },
      {
        "url": "https://hubcloud.example/d/xyz789",
        "title": "Download Link 2"
      }
    ]
  }
}`},{name:"Nextdrive Episodes Extract",method:"GET",endpoint:"/api/zeefliz/nextdrive",provider:"Zeefliz",description:"Extract episode links and ZeeCloud download links from Nextdrive/Zeefliz page URL",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Nextdrive page URL to extract episodes from"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/zeefliz/nextdrive?url=\${encodeURIComponent(nextdriveUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface NextdriveData {
  success: boolean;
  data: {
    title: string;
    note?: string;
    episodes: Array<{
      episode: string;
      episodeNumber: string;
      url: string;
      type: string; // 'Zee-Cloud' | 'G-Direct' | 'Batch/Zip'
    }>;
    zeeCloudLinks: string[];
  };
}

const episodeData: NextdriveData = await response.json();
console.log(episodeData);`,jsExample:`fetch(\`\${baseUrl}/api/zeefliz/nextdrive?url=\${encodeURIComponent(nextdriveUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(episodeData => console.log(episodeData))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/zeefliz/nextdrive?url=https%3A%2F%2Fnextdrive.example%2Fshow" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "Show Name Season 1",
    "note": "Note: Use Download Manager for faster downloads",
    "episodes": [
      {
        "episode": "Episode 1",
        "episodeNumber": "1",
        "url": "https://example.com/ep1",
        "type": "Zee-Cloud"
      },
      {
        "episode": "Episode 1",
        "episodeNumber": "1",
        "url": "https://example.com/ep1-direct",
        "type": "G-Direct"
      },
      {
        "episode": "Episode 2",
        "episodeNumber": "2",
        "url": "https://example.com/ep2",
        "type": "Zee-Cloud"
      }
    ],
    "zeeCloudLinks": [
      "https://example.com/ep1",
      "https://example.com/ep2"
    ]
  }
}`},{name:"AnimeSalt Home",method:"GET",endpoint:"/api/animesalt",provider:"AnimeSalt",description:"Get recent anime releases from AnimeSalt homepage ⚠️ Warning: IP-based streaming - content may be region-restricted",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/animesalt?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface AnimeResult {
  title: string;
  url: string;
  image: string;
  type: "series" | "movie" | "unknown";
}

interface AnimeResponse {
  success: boolean;
  data: {
    results: AnimeResult[];
    currentPage: number;
    hasNextPage: boolean;
  };
}

const data: AnimeResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/animesalt?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/animesalt?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "results": [
      {
        "title": "One Piece Episode 1100",
        "url": "https://animesalt.lol/one-piece-episode-1100",
        "image": "https://animesalt.lol/wp-content/uploads/...",
        "type": "series"
      }
    ],
    "currentPage": 1,
    "hasNextPage": true
  }
}`},{name:"AnimeSalt Search",method:"GET",endpoint:"/api/animesalt/search",provider:"AnimeSalt",description:"Search anime on AnimeSalt ⚠️ Warning: IP-based streaming - content may be region-restricted",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/animesalt/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  title: string;
  url: string;
  image: string;
  type: "series" | "movie" | "unknown";
  year?: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    results: SearchResult[];
    totalResults: number;
  };
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/animesalt/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/animesalt/search?q=naruto" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "query": "naruto",
    "results": [
      {
        "title": "Naruto Shippuden",
        "url": "https://animesalt.lol/naruto-shippuden",
        "image": "https://animesalt.lol/wp-content/uploads/...",
        "type": "series",
        "year": "2007"
      }
    ],
    "totalResults": 10
  }
}`},{name:"AnimeSalt Details",method:"GET",endpoint:"/api/animesalt/details",provider:"AnimeSalt",description:"Get anime details including episodes and download links ⚠️ Warning: IP-based streaming - content may be region-restricted",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Anime URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/animesalt/details?url=\${animeUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  quality: string;
  size?: string;
  url: string;
}

interface Episode {
  number: string;
  title?: string;
  url: string;
}

interface AnimeDetails {
  title: string;
  image?: string;
  description?: string;
  genres: string[];
  status?: string;
  type?: string;
  releaseYear?: string;
  episodes: Episode[];
  downloadLinks: DownloadLink[];
}

interface DetailsResponse {
  success: boolean;
  data: AnimeDetails;
}

const data: DetailsResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/animesalt/details?url=\${animeUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/animesalt/details?url=https://animesalt.lol/one-piece" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "One Piece",
    "image": "https://animesalt.lol/wp-content/uploads/...",
    "description": "Monkey D. Luffy sets off on an adventure...",
    "genres": ["Action", "Adventure", "Comedy"],
    "status": "Ongoing",
    "type": "TV Series",
    "releaseYear": "1999",
    "episodes": [
      {
        "number": "1",
        "title": "I'm Luffy! The Man Who Will Become Pirate King!",
        "url": "https://animesalt.lol/one-piece-episode-1"
      }
    ],
    "downloadLinks": [
      {
        "quality": "1080p",
        "size": "450MB",
        "url": "https://..."
      }
    ]
  }
}`},{name:"AnimeSalt Stream",method:"GET",endpoint:"/api/animesalt/stream",provider:"AnimeSalt",description:"Get streaming links for anime episodes ⚠️ Warning: IP-based streaming - content may be region-restricted",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Episode URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/animesalt/stream?url=\${episodeUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface StreamSource {
  quality: string;
  url: string;
  type: string;
}

interface StreamResponse {
  success: boolean;
  data: {
    title: string;
    episode?: string;
    sources: StreamSource[];
    downloadLinks: Array<{
      quality: string;
      size?: string;
      url: string;
    }>;
  };
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/animesalt/stream?url=\${episodeUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/animesalt/stream?url=https://animesalt.lol/one-piece-episode-1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "One Piece",
    "episode": "Episode 1",
    "sources": [
      {
        "quality": "1080p",
        "url": "https://stream.example.com/video.m3u8",
        "type": "m3u8"
      }
    ],
    "downloadLinks": [
      {
        "quality": "1080p",
        "size": "450MB",
        "url": "https://download.example.com/episode1.mp4"
      }
    ]
  }
}`},{name:"AnimePahe Airing",method:"GET",endpoint:"/api/animepahe",provider:"AnimePahe",description:"Get currently airing anime from AnimePahe. Fetches data from multiple pages in a single request.",requiresAuth:!0,parameters:[{name:"maxPages",type:"string",required:!1,description:"Number of pages to fetch (default: 5, max recommended: 10)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/animepahe?maxPages=5\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface AnimeEpisode {
  id: number;
  anime_id: number;
  anime_title: string;
  anime_session: string;
  episode: number;
  episode2: number;
  edition: string;
  fansub: string;
  snapshot: string;
  disc: string;
  session: string;
  filler: number;
  created_at: string;
  completed: number;
}

interface AiringResponse {
  success: boolean;
  result: {
    total: number;
    per_page: number;
    pages_fetched: number;
    last_page: number;
    data: AnimeEpisode[];
  };
}

const data: AiringResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/animepahe?maxPages=5\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/animepahe?maxPages=5" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "result": {
    "total": 6110,
    "per_page": 12,
    "pages_fetched": 5,
    "last_page": 510,
    "data": [
      {
        "id": 73615,
        "anime_id": 6302,
        "anime_title": "Hell Teacher: Jigoku Sensei Nube Part 2",
        "anime_session": "ed961a64-29fb-baf9-64bb-f4227238e2bc",
        "episode": 17,
        "episode2": 0,
        "edition": "",
        "fansub": "Amazon",
        "snapshot": "https://i.animepahe.si/snapshots/...",
        "disc": "",
        "session": "1a1aaa8be45f086c3ba2381e33158a6385ecf1790d151db861cd1d1b9d65bd1d",
        "filler": 0,
        "created_at": "2026-01-28 16:24:13",
        "completed": 0
      }
    ]
  }
}`},{name:"AnimePahe Episode Details",method:"GET",endpoint:"/api/animepahe/details",provider:"AnimePahe",description:"Get detailed information about an anime episode including all available episodes and streaming details.",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full AnimePahe play URL (e.g., https://animepahe.si/play/anime_session/episode_session)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/animepahe/details?url=\${encodeURIComponent(playUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Episode {
  episode: number;
  session: string;
  url: string;
  isActive: boolean;
}

interface CurrentEpisode {
  episode: number;
  session: string;
  provider: string;
  stream_url: string;
}

interface DetailsResponse {
  success: boolean;
  data: {
    anime_session: string;
    anime_title: string;
    current_episode: CurrentEpisode;
    episodes: Episode[];
    total_episodes: number;
  };
}

const data: DetailsResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/animepahe/details?url=\${encodeURIComponent(playUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/animepahe/details?url=https%3A%2F%2Fanimepahe.si%2Fplay%2F99c9e7db-403a-f564-bc74-52d7ea781f91%2F9f5e55583d79a47bb69d6f905f86fba8c64339a5783d07b2ae2f42c5743c0be2" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "anime_session": "99c9e7db-403a-f564-bc74-52d7ea781f91",
    "anime_title": "Tamon's B-Side - Episode 5",
    "current_episode": {
      "episode": 5,
      "session": "9f5e55583d79a47bb69d6f905f86fba8c64339a5783d07b2ae2f42c5743c0be2",
      "provider": "kwik",
      "stream_url": "https://kwik.cx/e/Sm5UhKJc9L5Y"
    },
    "episodes": [
      {
        "episode": 1,
        "session": "a8bed0a582cc22ecacbfae1b8f59133a486dc52136ce974cfa06c30b963a4ced",
        "url": "https://animepahe.si/play/99c9e7db-403a-f564-bc74-52d7ea781f91/a8bed0a582cc22ecacbfae1b8f59133a486dc52136ce974cfa06c30b963a4ced",
        "isActive": false
      },
      {
        "episode": 5,
        "session": "9f5e55583d79a47bb69d6f905f86fba8c64339a5783d07b2ae2f42c5743c0be2",
        "url": "https://animepahe.si/play/99c9e7db-403a-f564-bc74-52d7ea781f91/9f5e55583d79a47bb69d6f905f86fba8c64339a5783d07b2ae2f42c5743c0be2",
        "isActive": true
      }
    ],
    "total_episodes": 5
  }
}`},{name:"AnimePahe Stream Extractor",method:"GET",endpoint:"/api/animepahe/stream",provider:"AnimePahe",description:"Extract m3u8 stream URL from kwik.cx or other AnimePahe streaming providers. ⚠️ IMPORTANT: Requires Referer and Origin headers to play.",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Streaming page URL (e.g., https://kwik.cx/e/...)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/animepahe/stream?url=\${encodeURIComponent(streamUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface StreamResponse {
  success: boolean;
  data: {
    m3u8_url: string;
    source_url: string;
  };
}

const data: StreamResponse = await response.json();

// IMPORTANT: To play the m3u8 URL, you must include these headers:
const videoResponse = await fetch(data.data.m3u8_url, {
  headers: {
    'Referer': 'https://kwik.cx/',
    'Origin': 'https://kwik.cx'
  }
});`,jsExample:`fetch(\`\${baseUrl}/api/animepahe/stream?url=\${encodeURIComponent(streamUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => {
    console.log(data);
    
    // IMPORTANT: To play the m3u8 URL, you must include these headers:
    // Referer: https://kwik.cx/
    // Origin: https://kwik.cx
  })
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/animepahe/stream?url=https%3A%2F%2Fkwik.cx%2Fe%2FSm5UhKJc9L5Y" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "m3u8_url": "https://top-owocdn.vault.stream/01/46b3708cfeea9148ff5bff940b2e922a775b0c03cc54bf246535fc1fd58199e8/uwu.m3u8",
    "source_url": "https://kwik.cx/e/Sm5UhKJc9L5Y"
  }
}

⚠️ IMPORTANT: To play this m3u8 URL, you MUST include these headers:
- Referer: https://kwik.cx/
- Origin: https://kwik.cx

Without these headers, the stream will not work!`},{name:"Castel Stream Extractor",method:"GET",endpoint:"/api/castel",provider:"Castel",description:"Extract streaming links using TMDB ID for movies and TV shows via Castle API with AES-CBC decryption",requiresAuth:!0,parameters:[{name:"tmdb",type:"string",required:!0,description:"TMDB ID of the movie or TV show"},{name:"type",type:"string",required:!0,description:"Media type: 'movie' or 'tv'"},{name:"season",type:"string",required:!1,description:"Season number (required for TV shows)"},{name:"episode",type:"string",required:!1,description:"Episode number (required for TV shows)"}],tsExample:`// For Movies
const response = await fetch(\`\${baseUrl}/api/castel?tmdb=550&type=movie\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// For TV Shows
const tvResponse = await fetch(\`\${baseUrl}/api/castel?tmdb=1399&type=tv&season=1&episode=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface CastelStream {
  name: string;
  title: string;
  url: string;
  quality: string;
  size: string;
  headers: {
    'User-Agent': string;
    'Accept': string;
    'Accept-Language': string;
    'Accept-Encoding': string;
    'Connection': string;
    'Sec-Fetch-Dest': string;
    'Sec-Fetch-Mode': string;
    'Sec-Fetch-Site': string;
    'DNT': string;
  };
  provider: string;
}

interface CastelResponse {
  success: boolean;
  data: CastelStream[];
}

const data: CastelResponse = await response.json();
console.log(data);`,jsExample:`// For Movies
fetch(\`\${baseUrl}/api/castel?tmdb=550&type=movie\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('Castel streams:', data.data);
    data.data.forEach(stream => {
      console.log(\`\${stream.name}: \${stream.url} [\${stream.quality}]\`);
    });
  })
  .catch(error => console.error('Error:', error));

// For TV Shows  
fetch(\`\${baseUrl}/api/castel?tmdb=1399&type=tv&season=1&episode=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log('TV episode streams:', data.data))
  .catch(error => console.error('Error:', error));`,curlExample:`# For Movies
curl -X GET "https://screenscapeapi.dev/api/castel?tmdb=550&type=movie" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# For TV Shows
curl -X GET "https://screenscapeapi.dev/api/castel?tmdb=1399&type=tv&season=1&episode=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": [
    {
      "name": "Castle Hindi - 720p",
      "title": "Fight Club (1999)",
      "url": "https://example.com/stream.m3u8",
      "quality": "720p",
      "size": "1.2 GB",
      "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "video/webm,video/ogg,video/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "video",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "DNT": "1"
      },
      "provider": "castle"
    },
    {
      "name": "Castle English - 1080p", 
      "title": "Fight Club (1999)",
      "url": "https://example.com/stream-hd.m3u8",
      "quality": "1080p",
      "size": "2.4 GB",
      "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "video/webm,video/ogg,video/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "video",
        "Sec-Fetch-Mode": "no-cors", 
        "Sec-Fetch-Site": "cross-site",
        "DNT": "1"
      },
      "provider": "castle"
    }
  ]
}`},{name:"KMMovies Home",method:"GET",endpoint:"/api/kmmovies",provider:"KMMovies",description:"Get latest movie releases from KMMovies homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/kmmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  image: string;
  imageAlt: string;
}

interface Pagination {
  current: number;
  next: string | null;
  last: string | null;
}

interface KMMoviesResponse {
  success: boolean;
  data: {
    movies: Movie[];
    pagination: Pagination;
  };
}

const data: KMMoviesResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/kmmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/kmmovies?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "movies": [
      {
        "id": "108066",
        "title": "Rahu Ketu 2026 Hindi Download 1080p HDTC",
        "url": "https://kmmovies.store/rahu-ketu-2026/",
        "image": "https://kmmovies.store/wp-content/uploads/...",
        "imageAlt": "Rahu Ketu 2026 Poster"
      }
    ],
    "pagination": {
      "current": 1,
      "next": "2",
      "last": "360"
    }
  }
}`},{name:"KMMovies Search",method:"GET",endpoint:"/api/kmmovies/search",provider:"KMMovies",description:"Search movies on KMMovies",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/kmmovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  image: string;
  imageAlt: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    results: Movie[];
    totalResults: number;
  };
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/kmmovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/kmmovies/search?q=inception" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "query": "inception",
    "results": [
      {
        "id": "12345",
        "title": "Inception 2010 Dual Audio Download",
        "url": "https://kmmovies.store/inception-2010/",
        "image": "https://kmmovies.store/wp-content/uploads/...",
        "imageAlt": "Inception 2010 Poster"
      }
    ],
    "totalResults": 5
  }
}`},{name:"KMMovies Details",method:"GET",endpoint:"/api/kmmovies/details",provider:"KMMovies",description:"Get movie details including screenshots, info, and download links",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Movie URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/kmmovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  quality: string;
  badge?: string;
  fileSize?: string;
  url: string;
}

interface MovieInfo {
  imdbRating?: string;
  movieName?: string;
  director?: string;
  starring?: string;
  genres?: string;
  runningTime?: string;
  writer?: string;
  releaseDate?: string;
  ott?: string;
  quality?: string;
  language?: string;
  subtitles?: string;
  format?: string;
}

interface DetailsResponse {
  success: boolean;
  data: {
    title: string;
    releaseDate?: string;
    categories: string[];
    posterImage?: string;
    screenshots: string[];
    storyline?: string;
    movieInfo: MovieInfo;
    downloadLinks: DownloadLink[];
  };
}

const data: DetailsResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/kmmovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/kmmovies/details?url=https://kmmovies.store/inception-2010/" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "Inception 2010 Dual Audio Download",
    "releaseDate": "16 July 2010",
    "categories": ["Hollywood", "Dual Audio", "Movies"],
    "posterImage": "https://kmmovies.store/wp-content/uploads/...",
    "screenshots": [
      "https://images.kmphotos.cv/screenshot1.webp",
      "https://images.kmphotos.cv/screenshot2.webp"
    ],
    "storyline": "A thief who steals corporate secrets...",
    "movieInfo": {
      "imdbRating": "8.8/10",
      "movieName": "Inception (2010)",
      "director": "Christopher Nolan",
      "starring": "Leonardo DiCaprio, Joseph Gordon-Levitt",
      "genres": "Action, Sci-Fi, Thriller",
      "runningTime": "148 min",
      "releaseDate": "16 Jul 2010",
      "ott": "Netflix, Amazon Prime Video",
      "quality": "480p || 720p || 1080p || 4K",
      "language": "Hindi, English",
      "subtitles": "English",
      "format": "MKV"
    },
    "downloadLinks": [
      {
        "quality": "480p",
        "fileSize": "450MB",
        "url": "https://w1.magiclinks.my/..."
      },
      {
        "quality": "1080p",
        "badge": "HQ",
        "fileSize": "2.5GB",
        "url": "https://w1.magiclinks.my/..."
      }
    ]
  }
}`},{name:"KMMovies Magic Links",method:"GET",endpoint:"/api/kmmovies/magiclinks",provider:"KMMovies",description:"Get all download server links from magic links page with resolved streaming URLs",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Magic links URL from download link"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/kmmovies/magiclinks?url=\${magicUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  label: string;
  url: string;
}

interface FileInfo {
  fileName?: string;
  size?: string;
  format?: string;
  dateAdded?: string;
}

interface MagicLinksResponse {
  success: boolean;
  data: {
    fileInfo: FileInfo;
    downloadLinks: DownloadLink[];
  };
}

const data: MagicLinksResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/kmmovies/magiclinks?url=\${magicUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/kmmovies/magiclinks?url=https://w1.magiclinks.my/12345/" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "fileInfo": {
      "fileName": "Inception.2010.Hindi.1080p.BluRay.x264.mkv",
      "size": "2.5GB",
      "format": "MKV",
      "dateAdded": "2026-01-16"
    },
    "downloadLinks": [
      {
        "label": "WATCH ONLINE",
        "url": "https://w1.zipzap.lol/nf/index.php?videoUrl=https%3A%2F%2Fpub-210cae7350984565b187867103b2aa3e.r2.dev%2FInception.2010.mkv"
      },
      {
        "label": "SKYDROP (10 GBPS)",
        "url": "https://w1.skydrop.sbs/download.php?id=..."
      },
      {
        "label": "ZIP-ZAP",
        "url": "https://w1.zipzap.lol/download99.php?file=..."
      },
      {
        "label": "TELEGRAM",
        "url": "https://t.me/kmsenderbot?start=..."
      },
      {
        "label": "ONE CLICK",
        "url": "https://w1.zipzap.lol/clouddownload.php?file_id=..."
      },
      {
        "label": "GOFILE",
        "url": "https://gofile.io/d/..."
      }
    ]
  }
}`},{name:"NetMirror Home",method:"GET",endpoint:"/api/netmirror",provider:"NetMirror",description:"Get latest movies and shows from NetMirror homepage with categories",requiresAuth:!0,parameters:[],tsExample:`const response = await fetch(\`\${baseUrl}/api/netmirror\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface NetMirrorItem {
  id: string;
  title: string;
  imageUrl: string;
  postUrl: string;
  category: string;
}

interface NetMirrorResponse {
  success: boolean;
  data: {
    items: NetMirrorItem[];
    totalResults: number;
  };
}

const data: NetMirrorResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/netmirror\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/netmirror" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "items": [
      {
        "id": "12345",
        "title": "Breaking Bad",
        "imageUrl": "https://net20.cc/images/...",
        "postUrl": "https://net20.cc/watch/12345",
        "category": "Trending Now"
      }
    ],
    "totalResults": 50
  }
}`},{name:"NetMirror Search",method:"GET",endpoint:"/api/netmirror/search",provider:"NetMirror",description:"Search for movies and shows on NetMirror",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/netmirror/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface NetMirrorSearchResponse {
  success: boolean;
  data: {
    searchUrl: string;
    searchResults?: Record<string, unknown>;
    requestParams: {
      query: string;
      timestamp: string;
    };
  };
}

const data: NetMirrorSearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/netmirror/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/netmirror/search?q=breaking+bad" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "searchUrl": "https://net20.cc/search.php?s=breaking+bad&t=1234567890",
    "searchResults": {
      "results": [
        {
          "id": "12345",
          "title": "Breaking Bad",
          "year": "2008"
        }
      ]
    },
    "requestParams": {
      "query": "breaking bad",
      "timestamp": "1234567890"
    }
  }
}`},{name:"NetMirror Get Post",method:"GET",endpoint:"/api/netmirror/getpost",provider:"NetMirror",description:"Get detailed information about a specific movie or show by ID",requiresAuth:!0,parameters:[{name:"id",type:"string",required:!0,description:"Movie/show ID"},{name:"t",type:"string",required:!1,description:"Timestamp (auto-generated if not provided)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/netmirror/getpost?id=\${id}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface NetMirrorPostResponse {
  success: boolean;
  data?: Record<string, unknown>;
  requestParams?: {
    id: string;
    timestamp: string;
  };
}

const data: NetMirrorPostResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/netmirror/getpost?id=\${id}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/netmirror/getpost?id=12345" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "id": "12345",
    "title": "Breaking Bad",
    "description": "A high school chemistry teacher...",
    "rating": "9.5",
    "year": "2008",
    "genres": ["Crime", "Drama", "Thriller"],
    "seasons": [
      {
        "number": 1,
        "episodes": 7
      }
    ]
  },
  "requestParams": {
    "id": "12345",
    "timestamp": "1234567890"
  }
}`},{name:"NetMirror Stream",method:"GET",endpoint:"/api/netmirror/stream",provider:"NetMirror",description:"Get streaming playlist URL for a movie or episode",requiresAuth:!0,parameters:[{name:"id",type:"string",required:!0,description:"Content ID for streaming"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/netmirror/stream?id=\${id}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface StreamSource {
  file: string;
  label?: string;
  type?: string;
}

interface NetMirrorStreamResponse {
  success: boolean;
  data?: {
    playlistUrl: string;
    streamData?: {
      sources: StreamSource[];
      subtitles?: Array<{
        file: string;
        label: string;
      }>;
    };
    requestParams: {
      id: string;
      timestamp: string;
      h: string;
    };
  };
}

const data: NetMirrorStreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/netmirror/stream?id=\${id}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/netmirror/stream?id=12345" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "playlistUrl": "https://net51.cc/playlist/12345.m3u8",
    "streamData": {
      "sources": [
        {
          "file": "https://net51.cc/videos/breaking-bad-s01e01.m3u8",
          "label": "1080p",
          "type": "hls"
        },
        {
          "file": "https://net51.cc/videos/breaking-bad-s01e01-720p.m3u8",
          "label": "720p",
          "type": "hls"
        }
      ],
      "subtitles": [
        {
          "file": "https://net51.cc/subs/breaking-bad-s01e01-en.vtt",
          "label": "English"
        }
      ]
    },
    "requestParams": {
      "id": "12345",
      "timestamp": "1234567890",
      "h": "abc123hash"
    }
  }
}`},{name:"NetMirror Episodes",method:"GET",endpoint:"/api/netmirror/eps",provider:"NetMirror",description:"Get all episodes for a season, including paginated results",requiresAuth:!0,parameters:[{name:"link",type:"string",required:!0,description:"Season ID, or seasonId|seriesId"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/netmirror/eps?link=12345|67890\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface EpisodeLink {
  title: string;
  link: string;
}

interface NetMirrorEpisodesResponse {
  success: boolean;
  data?: {
    episodes: EpisodeLink[];
    totalEpisodes: number;
    pagesFetched: number;
    requestParams: {
      link: string;
      seasonId: string;
      seriesId: string;
      timestamp: string;
    };
  };
}

const data: NetMirrorEpisodesResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/netmirror/eps?link=12345|67890\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/netmirror/eps?link=12345%7C67890" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "episodes": [
      {
        "title": "Episode 1",
        "link": "ep_12345"
      },
      {
        "title": "Episode 2",
        "link": "ep_12346"
      }
    ],
    "totalEpisodes": 2,
    "pagesFetched": 1,
    "requestParams": {
      "link": "12345|67890",
      "seasonId": "12345",
      "seriesId": "67890",
      "timestamp": "1711122334"
    }
  }
}`},{name:"XM Home",method:"GET",endpoint:"/api/adult/xm",provider:"Adult (XM)",description:"Get latest adult videos from xHamster homepage (18+ Only)",requiresAuth:!0,parameters:[],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xm\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoInfo {
  id: number;
  title: string;
  duration: number;
  created: number;
  videoType: string;
  pageURL: string;
  thumbURL: string;
  imageURL: string;
  previewThumbURL: string;
  spriteURL: string;
  trailerURL: string;
  views: number;
  landing: {
    type: string;
    id: number;
    name: string;
    logo: string;
    link: string;
    subscribers: number | null;
  };
}

interface XMResponse {
  videos: VideoInfo[];
}

const data: XMResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xm\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xm" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "videos": [
    {
      "id": 12345678,
      "title": "Sample Video Title",
      "duration": 600,
      "created": 1705449600,
      "videoType": "premium",
      "pageURL": "https://xhamster.com/videos/...",
      "thumbURL": "https://thumb-p6.xhcdn.com/...",
      "imageURL": "https://thumb-p6.xhcdn.com/...",
      "previewThumbURL": "https://thumb-p6.xhcdn.com/...",
      "spriteURL": "https://thumb-p6.xhcdn.com/...",
      "trailerURL": "https://thumb-p6.xhcdn.com/...",
      "views": 150000,
      "landing": {
        "type": "creator",
        "id": 123456,
        "name": "Creator Name",
        "logo": "https://thumb-p6.xhcdn.com/...",
        "link": "https://xhamster.com/creators/...",
        "subscribers": 50000
      }
    }
  ]
}`},{name:"XM Search",method:"GET",endpoint:"/api/adult/xm/search",provider:"Adult (XM)",description:"Search adult videos on xHamster (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"},{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xm/search?q=\${query}&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchVideo {
  id: number;
  title: string;
  duration: string;
  views: string;
  rating: string;
  thumbURL: string;
  pageURL: string;
  videoType: string;
  created: string;
  uploaderName: string;
  uploaderUrl: string;
  isVerified: boolean;
}

interface SearchResponse {
  success: boolean;
  query: string;
  page: number;
  totalResults: number;
  searchSuggestions: Array<{ label: string; url: string }>;
  pagination: {
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number | null;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  videos: SearchVideo[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xm/search?q=\${query}&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xm/search?q=search+term&page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "search term",
  "page": 1,
  "totalResults": 50000,
  "searchSuggestions": [
    {
      "label": "suggestion tag",
      "url": "https://xhamster.com/tags/..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "nextPage": 2,
    "prevPage": null,
    "totalPages": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "videos": [
    {
      "id": 12345678,
      "title": "Video Title",
      "duration": "10:00",
      "views": "1.5M",
      "rating": "95%",
      "thumbURL": "https://thumb-p6.xhcdn.com/...",
      "pageURL": "https://xhamster.com/videos/...",
      "videoType": "premium",
      "created": "2024-01-15",
      "uploaderName": "Creator Name",
      "uploaderUrl": "https://xhamster.com/creators/...",
      "isVerified": true
    }
  ]
}`},{name:"XM Stream",method:"GET",endpoint:"/api/adult/xm/stream",provider:"Adult (XM)",description:"Get video streaming details and related videos from xHamster (18+ Only)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full video URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xm/stream?url=\${videoUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface StreamResponse {
  success: boolean;
  preloadLinks: {
    videoUrl: string | null;
    thumbnailUrl: string | null;
    promoImageUrl: string | null;
  };
  videoDetails: {
    id: string | number | null;
    title: string | null;
    duration: number | null;
    views: number | null;
    rating: number | null;
    created: string | null;
    categories: unknown[];
    tags: unknown[];
    uploader: {
      id: string | number | null;
      name: string | null;
      url: string | null;
      subscribers: number | null;
      isVerified: boolean;
    } | null;
  };
  relatedVideos: {
    maxPages: number;
    videoThumbProps: unknown[];
  } | null;
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xm/stream?url=\${videoUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xm/stream?url=https://xhamster.com/videos/..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "preloadLinks": {
    "videoUrl": "https://vcdn.xhcdn.com/.../playlist.m3u8",
    "thumbnailUrl": "https://thumb-p6.xhcdn.com/...",
    "promoImageUrl": "https://thumb-p6.xhcdn.com/..."
  },
  "videoDetails": {
    "id": "12345678",
    "title": "Video Title",
    "duration": 600,
    "views": 150000,
    "rating": 95,
    "created": "2024-01-15T10:30:00Z",
    "categories": ["category1", "category2"],
    "tags": ["tag1", "tag2"],
    "uploader": {
      "id": "123456",
      "name": "Creator Name",
      "url": "https://xhamster.com/creators/...",
      "subscribers": 50000,
      "isVerified": true
    }
  },
  "relatedVideos": {
    "maxPages": 5,
    "videoThumbProps": []
  }
}`},{name:"XX Home",method:"GET",endpoint:"/api/adult/xx",provider:"Adult (XX)",description:"Get latest adult videos from XX homepage (18+ Only)",requiresAuth:!0,parameters:[],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xx\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoInfo {
  title: string;
  url: string;
  image: string;
  views: string;
  comments: string;
  likes: string;
  isHd: boolean;
}

interface XXResponse {
  success: boolean;
  totalVideos: number;
  videos: VideoInfo[];
}

const data: XXResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xx\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xx" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "totalVideos": 50,
  "videos": [
    {
      "title": "Sample Video Title",
      "url": "https://xx.com/videos/sample-video",
      "image": "https://cdn.xx.com/thumb/sample.jpg",
      "views": "1.2M",
      "comments": "523",
      "likes": "12.5K",
      "isHd": true
    }
  ]
}`},{name:"XX Search",method:"GET",endpoint:"/api/adult/xx/search",provider:"Adult (XX)",description:"Search adult videos on XX (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xx/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchVideo {
  title: string;
  url: string;
  image: string;
  views: string;
  comments: string;
  likes: string;
  isHd: boolean;
}

interface SearchResponse {
  success: boolean;
  query: string;
  searchUrl: string;
  totalResults: number;
  videos: SearchVideo[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xx/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xx/search?q=search+term" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "search term",
  "searchUrl": "https://xx.com/search/search%20term",
  "totalResults": 45,
  "videos": [
    {
      "title": "Search Result Video",
      "url": "https://xx.com/videos/search-result",
      "image": "https://cdn.xx.com/thumb/result.jpg",
      "views": "850K",
      "comments": "234",
      "likes": "8.2K",
      "isHd": true
    }
  ]
}`},{name:"XX Stream",method:"GET",endpoint:"/api/adult/xx/stream",provider:"Adult (XX)",description:"Get video streaming details and related videos from XX (18+ Only)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full video URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xx/stream?url=\${videoUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoSource {
  quality: string;
  url: string;
}

interface RelatedVideo {
  title: string;
  url: string;
  image: string;
  views: string;
  comments: string;
  likes: string;
  isHd: boolean;
}

interface StreamResponse {
  success: boolean;
  videoId: string;
  title: string;
  videoLink: string;
  poster: string;
  sources: VideoSource[];
  relatedVideos: RelatedVideo[];
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xx/stream?url=\${videoUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xx/stream?url=https://xx.com/videos/..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "videoId": "12345678",
  "title": "Video Title ♥ ★",
  "videoLink": "https://xx.com/videos/sample",
  "poster": "https://cdn.xx.com/posters/sample.jpg",
  "sources": [
    {
      "quality": "1080p",
      "url": "https://cdn.xx.com/videos/1080p/sample.mp4"
    },
    {
      "quality": "720p",
      "url": "https://cdn.xx.com/videos/720p/sample.mp4"
    },
    {
      "quality": "480p",
      "url": "https://cdn.xx.com/videos/480p/sample.mp4"
    }
  ],
  "relatedVideos": [
    {
      "title": "Related Video 1",
      "url": "https://xx.com/videos/related-1",
      "image": "https://cdn.xx.com/thumb/related1.jpg",
      "views": "950K",
      "comments": "145",
      "likes": "7.8K",
      "isHd": true
    }
  ]
}`},{name:"Xozilla Home",method:"GET",endpoint:"/api/adult/xoz",provider:"Adult (Xozilla)",description:"Get latest adult videos from Xozilla homepage with multiple sections (18+ Only)",requiresAuth:!0,parameters:[],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xoz\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoItem {
  title: string;
  url: string;
  imageUrl: string;
  videoPreviewUrl?: string;
  duration?: string;
  hdLabel?: boolean;
}

interface XozillaResponse {
  videosWatchedRightNow: VideoItem[];
  sections: Array<{
    sectionName: string;
    videos: VideoItem[];
  }>;
}

const data: XozillaResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xoz\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xoz" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "videosWatchedRightNow": [
    {
      "title": "Popular Video Title",
      "url": "/video/12345/video-slug/",
      "imageUrl": "https://static-ca-cdn.xozilla.xyz/...",
      "videoPreviewUrl": "https://static-ca-cdn.xozilla.xyz/...",
      "duration": "12:34",
      "hdLabel": true
    }
  ],
  "sections": [
    {
      "sectionName": "Most Recent Videos",
      "videos": [
        {
          "title": "Recent Video Title",
          "url": "/video/67890/video-slug/",
          "imageUrl": "https://static-ca-cdn.xozilla.xyz/...",
          "videoPreviewUrl": "https://static-ca-cdn.xozilla.xyz/...",
          "duration": "08:45",
          "hdLabel": false
        }
      ]
    },
    {
      "sectionName": "Top Rated Videos",
      "videos": []
    }
  ]
}`},{name:"Xozilla Search",method:"GET",endpoint:"/api/adult/xoz/search",provider:"Adult (Xozilla)",description:"Search adult videos on Xozilla (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xoz/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchVideo {
  title: string;
  url: string;
  imageUrl: string;
  videoPreviewUrl?: string;
  duration?: string;
  hdLabel?: boolean;
}

interface SearchResponse {
  success: boolean;
  query: string;
  searchUrl: string;
  videos: SearchVideo[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xoz/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xoz/search?q=search+term" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "search term",
  "searchUrl": "https://xozilla.xyz/search/search+term/",
  "videos": [
    {
      "title": "Search Result Video",
      "url": "/video/12345/video-slug/",
      "imageUrl": "https://static-ca-cdn.xozilla.xyz/...",
      "videoPreviewUrl": "https://static-ca-cdn.xozilla.xyz/...",
      "duration": "15:30",
      "hdLabel": true
    }
  ]
}`},{name:"Xozilla Stream",method:"GET",endpoint:"/api/adult/xoz/stream",provider:"Adult (Xozilla)",description:"Get video streaming details from Xozilla (Note: Same as search endpoint) (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Video identifier or search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xoz/stream?q=\${videoId}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface StreamVideo {
  title: string;
  url: string;
  imageUrl: string;
  videoPreviewUrl?: string;
  duration?: string;
  hdLabel?: boolean;
}

interface StreamResponse {
  success: boolean;
  query: string;
  searchUrl: string;
  videos: StreamVideo[];
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xoz/stream?q=\${videoId}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xoz/stream?q=video-slug" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "video-slug",
  "searchUrl": "https://xozilla.xyz/search/video-slug/",
  "videos": [
    {
      "title": "Video Title",
      "url": "/video/12345/video-slug/",
      "imageUrl": "https://static-ca-cdn.xozilla.xyz/...",
      "videoPreviewUrl": "https://static-ca-cdn.xozilla.xyz/...",
      "duration": "20:15",
      "hdLabel": true
    }
  ]
}`},{name:"XS Home",method:"GET",endpoint:"/api/adult/xs",provider:"Adult (XS)",description:"Get latest adult videos from xxxstreams.org homepage (18+ Only)",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xs?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Article {
  title: string;
  url: string;
  image: string;
  categories: string[];
  isSticky?: boolean;
}

interface XSResponse {
  success: boolean;
  page: number;
  totalArticles: number;
  articles: Article[];
}

const data: XSResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xs?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xs?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "page": 1,
  "totalArticles": 20,
  "articles": [
    {
      "title": "Transfixed 26/01/17 Leah Hayes Bringing The Date To Her FullHD MP4",
      "url": "https://xxxstreams.org/transfixed-26-01-17-leah-hayes-bringing-the-date-to-her-fullhd-mp4-narcos/",
      "image": "https://xxxstreams.org/wp-content/uploads/2026/01/narcos-tfx-26-01-17-leah-hayes-bringing-the-date-to-her-1080p.jpg",
      "categories": ["0day Clips"],
      "isSticky": false
    }
  ]
}`},{name:"XS Search",method:"GET",endpoint:"/api/adult/xs/search",provider:"Adult (XS)",description:"Search adult videos on xxxstreams.org (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xs/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  title: string;
  url: string;
  image: string;
  category?: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  totalResults: number;
  results: SearchResult[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xs/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xs/search?q=mom" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "mom",
  "totalResults": 15,
  "results": [
    {
      "title": "Alex Bishop – Girlfriend's Free Use Step-Mom",
      "url": "https://xxxstreams.org/alex-bishop-girlfriends-free-use-step-mom/",
      "image": "https://xxxstreams.org/wp-content/uploads/2026/01/alex_bishop_-_girlfriends_free_use_step-mom.jpg",
      "category": "Girlfriends"
    }
  ]
}`},{name:"XS Stream Details",method:"GET",endpoint:"/api/adult/xs/stream",provider:"Adult (XS)",description:"Get video stream details and download links from xxxstreams.org (18+ Only)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the video page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xs/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoData {
  format: string;
  size: string;
  duration: string;
  resolution: string;
}

interface TezfilesData {
  id: string;
  name: string;
  size: number;
  contentType: string;
  videoInfo: {
    duration: number;
    isStreamable: boolean;
    resolution: {
      width: number;
      height: number;
    };
    format: string;
    w320h240: string[];
  };
  thumbnails: string[];
  videoPreview: {
    video: string;
    duration: number;
    alternativeResolutions: Array<{
      resolution: string;
      url: string;
    }>;
    cover: string;
  };
}

interface StreamResponse {
  success: boolean;
  video: VideoData;
  downloadLink: string;
  streamUrl: string;
  thumbnail: {
    url: string;
    alt: string;
  };
  tezfilesData: TezfilesData | null;
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xs/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xs/stream?url=https%3A%2F%2Fxxxstreams.org%2Fvideo-page" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "video": {
    "format": "mp4",
    "size": "828.49 MB",
    "duration": "00:29:52",
    "resolution": "1920X1080"
  },
  "downloadLink": "https://tezfiles.com/file/072833ee8cc6b/video.mp4",
  "streamUrl": "https://tezfiles.com/file/072833ee8cc6b/video.mp4",
  "thumbnail": {
    "url": "https://xxxstreams.org/wp-content/uploads/2026/01/video-thumbnail.jpg",
    "alt": "Video Title"
  },
  "tezfilesData": {
    "id": "072833ee8cc6b",
    "name": "video.mp4",
    "size": 868464423,
    "contentType": "video/mp4",
    "videoInfo": {
      "duration": 1792.942,
      "isStreamable": true,
      "resolution": {
        "width": 1920,
        "height": 1080
      },
      "format": "mp4",
      "w320h240": ["https://static-cache.tezfiles.com/thumbnail/..."]
    },
    "thumbnails": ["https://static-cache.tezfiles.com/thumbnail/..."],
    "videoPreview": {
      "video": "https://str-09.filestore.app/...",
      "duration": 90,
      "alternativeResolutions": [
        {
          "resolution": "360p",
          "url": "https://str-27.filestore.app/..."
        }
      ],
      "cover": "https://static-cache.tezfiles.com/thumbnail/..."
    }
  }
}`},{name:"XP Home",method:"GET",endpoint:"/api/adult/xp",provider:"Adult (XPrimeHub)",description:"Get latest adult content from xprimehub.my homepage (18+ Only)",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xp?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Item {
  title: string;
  url: string;
  image: string;
  date: string;
}

interface XPResponse {
  success: boolean;
  page: number;
  hasNextPage: boolean;
  totalItems: number;
  items: Item[];
}

const data: XPResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xp?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xp?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "page": 1,
  "hasNextPage": true,
  "totalItems": 18,
  "items": [
    {
      "title": "[18+] Horny Public (2026) English [Adults-Film] Video 720p [350MB] HDRip",
      "url": "https://xprimehub.my/horny-public-2026-english-short-films-720p-hdrip/",
      "image": "https://xprimehub.my/wp-content/uploads/2026/01/Horny-Public.jpg",
      "date": "Jan 18, 2026"
    }
  ]
}`},{name:"XP Search",method:"GET",endpoint:"/api/adult/xp/search",provider:"Adult (XPrimeHub)",description:"Search adult content on xprimehub.my (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xp/search?q=\${encodeURIComponent(query)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  title: string;
  url: string;
  image: string;
  date: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  totalResults: number;
  results: SearchResult[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xp/search?q=\${encodeURIComponent(query)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xp/search?q=brazzers" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "brazzers",
  "totalResults": 15,
  "results": [
    {
      "title": "[18+] Another Me (2026) Brazzers English [Adults-Film] Video 720p [350MB] HDRip",
      "url": "https://xprimehub.my/another-me-2026-english-short-films-720p-hdrip/",
      "image": "https://xprimehub.my/wp-content/uploads/2026/01/Another-Me.jpg",
      "date": "Jan 16, 2026"
    }
  ]
}`},{name:"XP Details",method:"GET",endpoint:"/api/adult/xp/details",provider:"Adult (XPrimeHub)",description:"Get detailed information about a specific adult content item including download links (18+ Only)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the content page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xp/details?url=\${encodeURIComponent(contentUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface MovieInfo {
  movieName?: string;
  releaseYear?: string;
  language?: string;
  quality?: string;
  format?: string;
}

interface DownloadLink {
  quality: string;
  size: string;
  url: string;
}

interface DetailsResponse {
  success: boolean;
  data: {
    title: string;
    movieInfo: MovieInfo;
    synopsis: string;
    screenshots: string[];
    downloadLinks: DownloadLink[];
    sourceUrl: string;
  };
}

const data: DetailsResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xp/details?url=\${encodeURIComponent(contentUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xp/details?url=https%3A%2F%2Fxprimehub.my%2Fperformers-of-the-year-2026-english-short-films-720p-hdrip%2F" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "[18+] Performers Of The Year (2026) ElegantAngel English [Adults-Film] Video 720p [800MB] HDRip",
    "movieInfo": {
      "movieName": "Performers Of The Year",
      "releaseYear": "2026",
      "language": "English",
      "quality": "720p || 1080p – HDRip",
      "format": "MKV"
    },
    "synopsis": "Performers Of The Year (2026) ElegantAngel English Short Film 720p HDRip Download",
    "screenshots": [
      "https://imgbb.zip/ib/i90sBxieAB0lbHm_1768689542.jpg"
    ],
    "downloadLinks": [
      {
        "quality": "720p",
        "size": "800MB",
        "url": "https://nexdrive.pro/genxfm784776464538/"
      }
    ],
    "sourceUrl": "https://xprimehub.my/performers-of-the-year-2026-english-short-films-720p-hdrip/"
  }
}`},{name:"NextDrive Link Extractor",method:"GET",endpoint:"/api/vega/nextdrive",provider:"Utilities",description:"Extract V-Cloud download links from NextDrive URLs (works with XPrimeHub and other sources)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full NextDrive/Vega URL to extract links from"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/vega/nextdrive?url=\${encodeURIComponent(nextdriveUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  label: string;
  url: string;
}

interface NextDriveResponse {
  success: boolean;
  title: string;
  vcloudLinks: DownloadLink[];
}

const data: NextDriveResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/vega/nextdrive?url=\${encodeURIComponent(nextdriveUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/vega/nextdrive?url=https%3A%2F%2Fnexdrive.pro%2Fgenxfm784776464538%2F" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "title": "[18+] Performers Of The Year (2026) ElegantAngel English [Adults-Film] Video 720p [800MB] HDRip",
  "vcloudLinks": [
    {
      "label": "V-Cloud Link",
      "url": "https://vcloud.example.com/download/abc123"
    }
  ]
}`},{name:"SB Home",method:"GET",endpoint:"/api/adult/sb",provider:"Adult (SB)",description:"Get latest adult videos from SpankBang homepage (18+ Only)",requiresAuth:!0,parameters:[],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/sb\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoInfo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  views: string;
  rating: string;
  channel: string;
  channelUrl: string;
  isChannelBadge: boolean;
}

interface SBResponse {
  videos: VideoInfo[];
}

const data: SBResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/sb\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/sb" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "videos": [
    {
      "id": "12345",
      "title": "Sample Video Title",
      "url": "https://spankbang.com/...",
      "thumbnail": "https://...",
      "duration": "10:30",
      "views": "1.2M",
      "rating": "95%",
      "channel": "Channel Name",
      "channelUrl": "https://spankbang.com/profile/...",
      "isChannelBadge": true
    }
  ]
}`},{name:"SB Search",method:"GET",endpoint:"/api/adult/sb/search",provider:"Adult (SB)",description:"Search adult videos on SpankBang (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/sb/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoInfo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  resolution: string;
  views: string;
  rating: string;
  channel: string;
  channelUrl: string;
  isChannelBadge: boolean;
}

interface SearchResponse {
  relatedKeywords: Array<{
    label: string;
    url: string;
  }>;
  alsoSearchedFor: Array<{
    label: string;
    url: string;
  }>;
  videos: VideoInfo[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/sb/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/sb/search?q=sample" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "relatedKeywords": [
    {
      "label": "keyword1",
      "url": "https://spankbang.com/s/keyword1/"
    }
  ],
  "alsoSearchedFor": [
    {
      "label": "related search",
      "url": "https://spankbang.com/s/related+search/"
    }
  ],
  "videos": [
    {
      "id": "12345",
      "title": "Sample Video Title",
      "url": "https://spankbang.com/...",
      "thumbnail": "https://...",
      "duration": "10:30",
      "resolution": "1080p",
      "views": "1.2M",
      "rating": "95%",
      "channel": "Channel Name",
      "channelUrl": "https://spankbang.com/profile/...",
      "isChannelBadge": true
    }
  ]
}`},{name:"SB Stream",method:"GET",endpoint:"/api/adult/sb/stream",provider:"Adult (SB)",description:"Extract video stream data and download URLs from SpankBang video page (18+ Only)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Video page URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/sb/stream?url=\${videoUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface StreamData {
  ana_video_id: string | null;
  stream_data: {
    '240p': string[];
    '320p': string[];
    '480p': string[];
    '720p': string[];
    '1080p': string[];
    '4k': string[];
    'mpd': string[];
    'm3u8': string[];
    'm3u8_240p': string[];
    'm3u8_320p': string[];
    'm3u8_480p': string[];
    'm3u8_720p': string[];
    'm3u8_1080p': string[];
    'm3u8_4k': string[];
    'cover_image': string;
    'thumbnail': string;
    'stream_raw_id': number;
    'stream_sheet': string;
    'length': number;
    'main': string[];
  } | null;
  live_keywords: string | null;
  qualities: {
    '240p': string | null;
    '320p': string | null;
    '480p': string | null;
    '720p': string | null;
    '1080p': string | null;
    '4k': string | null;
  } | null;
  hls: {
    master: string | null;
    '240p': string | null;
    '320p': string | null;
    '480p': string | null;
    '720p': string | null;
    '1080p': string | null;
    '4k': string | null;
  } | null;
  mpd: string | null;
  cover_image: string | null;
  thumbnail: string | null;
  stream_raw_id: number | null;
  stream_sheet: string | null;
  length: number | null;
  main: string | null;
}

const data: StreamData = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/sb/stream?url=\${videoUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/sb/stream?url=https://spankbang.com/..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "ana_video_id": "16974604",
  "stream_data": {
    "240p": ["https://vdownload-45.sb-cd.com/..."],
    "320p": [],
    "480p": ["https://vdownload-45.sb-cd.com/..."],
    "720p": ["https://vdownload-45.sb-cd.com/..."],
    "1080p": ["https://vdownload-45.sb-cd.com/..."],
    "4k": [],
    "mpd": [],
    "m3u8": ["https://hls-uranus.sb-cd.com/hls/..."],
    "m3u8_240p": ["https://hls-uranus.sb-cd.com/hls/..."],
    "m3u8_320p": [],
    "m3u8_480p": ["https://hls-uranus.sb-cd.com/hls/..."],
    "m3u8_720p": ["https://hls-uranus.sb-cd.com/hls/..."],
    "m3u8_1080p": ["https://hls-uranus.sb-cd.com/hls/..."],
    "m3u8_4k": [],
    "cover_image": "https://tbi.sb-cd.com/t/...",
    "thumbnail": "https://tbi.sb-cd.com/t/...",
    "stream_raw_id": 16974604,
    "stream_sheet": "https://tbv.sb-cd.com/t/...",
    "length": 1369,
    "main": ["https://vdownload-45.sb-cd.com/..."]
  },
  "live_keywords": "big tits,ebony,big ass,bbw,handjob,brunette,black",
  "qualities": {
    "240p": "https://vdownload-45.sb-cd.com/...",
    "320p": null,
    "480p": "https://vdownload-45.sb-cd.com/...",
    "720p": "https://vdownload-45.sb-cd.com/...",
    "1080p": "https://vdownload-45.sb-cd.com/...",
    "4k": null
  },
  "hls": {
    "master": "https://hls-uranus.sb-cd.com/hls/...",
    "240p": "https://hls-uranus.sb-cd.com/hls/...",
    "320p": null,
    "480p": "https://hls-uranus.sb-cd.com/hls/...",
    "720p": "https://hls-uranus.sb-cd.com/hls/...",
    "1080p": "https://hls-uranus.sb-cd.com/hls/...",
    "4k": null
  },
  "mpd": null,
  "cover_image": "https://tbi.sb-cd.com/t/...",
  "thumbnail": "https://tbi.sb-cd.com/t/...",
  "stream_raw_id": 16974604,
  "stream_sheet": "https://tbv.sb-cd.com/t/...",
  "length": 1369,
  "main": "https://vdownload-45.sb-cd.com/..."
}`},{name:"Zteen Home",method:"GET",endpoint:"/api/adult/zteen",provider:"Adult (Zteen)",description:"Get latest adult videos from Zteen homepage (18+ Only)",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/zteen?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VideoItem {
  title: string;
  url: string;
  image: string;
}

interface ZteenResponse {
  success: boolean;
  page: number;
  totalVideos: number;
  videos: VideoItem[];
}

const data: ZteenResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/zteen?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/zteen?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "page": 1,
  "totalVideos": 20,
  "videos": [
    {
      "title": "Popular Teen Video Title",
      "url": "https://www.zteenporn.com/play-video/...",
      "image": "https://www.zteenporn.com/contents/videos_screenshots/..."
    }
  ]
}`},{name:"Zteen Search",method:"GET",endpoint:"/api/adult/zteen/search",provider:"Adult (Zteen)",description:"Search adult videos on Zteen (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/zteen/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchVideo {
  title: string;
  url: string;
  image: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  searchUrl: string;
  totalResults: number;
  videos: SearchVideo[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/zteen/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/zteen/search?q=teen" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "teen",
  "searchUrl": "https://www.zteenporn.com/search/teen/",
  "totalResults": 15,
  "videos": [
    {
      "title": "Search Result Video Title",
      "url": "https://www.zteenporn.com/play-video/...",
      "image": "https://www.zteenporn.com/contents/videos_screenshots/..."
    }
  ]
}`},{name:"Zteen Stream",method:"GET",endpoint:"/api/adult/zteen/stream",provider:"Adult (Zteen)",description:"Get video stream URL and related videos from Zteen video page (18+ Only)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full video page URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/zteen/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface RelatedVideo {
  title: string;
  url: string;
  image: string;
}

interface StreamResponse {
  success: boolean;
  videoId: string;
  videoSource: string;
  videoPoster: string;
  relatedVideos: RelatedVideo[];
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/zteen/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/zteen/stream?url=https%3A%2F%2Fwww.zteenporn.com%2Fplay-video%2F..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "videoId": "551",
  "videoSource": "https://www.zteenporn.com/get_file/1/.../.mp4/",
  "videoPoster": "/contents/videos_screenshots/0/551/preview.mp4.jpg",
  "relatedVideos": [
    {
      "title": "Related Video Title",
      "url": "https://www.zteenporn.com/play-video/...",
      "image": "https://www.zteenporn.com/contents/videos_screenshots/..."
    }
  ]
}`},{name:"XV Home",method:"GET",endpoint:"/api/adult/xv",provider:"Adult (XVideos)",description:"Get latest adult videos from xvideos.place (18+ Only)",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 0)"},{name:"category",type:"string",required:!1,description:"Category slug (e.g., 'amateur', 'milf')"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xv?page=0\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Uploader {
  name: string;
  url: string;
  verified: boolean;
}

interface VideoItem {
  id: string;
  encoded_id: string;
  title: string;
  url: string;
  thumbnail: string;
  thumbnail_sfw?: string;
  duration: string;
  views: string;
  uploader: Uploader;
  quality?: string;
}

interface XVResponse {
  success: boolean;
  page: number;
  totalItems: number;
  items: VideoItem[];
}

const data: XVResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xv?page=0\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xv?page=0" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "page": 0,
  "totalItems": 27,
  "items": [
    {
      "id": "84891641",
      "encoded_id": "otfomfv692c",
      "title": "Horny Asian Passionate in Bathroom then she said ''Cum in my Pussy Please''",
      "url": "https://xvideos.place/video.otfomfv692c/horny_asian_passionate_in_bathroom_then_she_said_cum_in_my_pussy_please_",
      "thumbnail": "https://thumb-cdn77.xvideos-cdn.com/8a111fa6-495c-438f-ba57-ba2f8530c71b/0/xv_7_t.jpg",
      "thumbnail_sfw": "https://thumb-cdn77.xvideos-cdn.com/8a111fa6-495c-438f-ba57-ba2f8530c71b/0/xv_1_t.jpg",
      "duration": "22 min",
      "views": "2.6M",
      "uploader": {
        "name": "bellamissU",
        "url": "https://xvideos.place/bellamissu",
        "verified": true
      },
      "quality": "1080p"
    }
  ]
}`},{name:"XV Search",method:"GET",endpoint:"/api/adult/xv/search",provider:"Adult (XVideos)",description:"Search adult videos on xvideos.place (18+ Only)",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"},{name:"page",type:"string",required:!1,description:"Page number (default: 0)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xv/search?q=\${encodeURIComponent(query)}&page=0\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Uploader {
  name: string;
  url: string;
  verified: boolean;
}

interface SearchResult {
  id: string;
  encoded_id: string;
  title: string;
  url: string;
  thumbnail: string;
  thumbnail_sfw?: string;
  duration: string;
  views: string;
  uploader: Uploader;
  quality?: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  page: number;
  totalResults: number;
  results: SearchResult[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xv/search?q=\${encodeURIComponent(query)}&page=0\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xv/search?q=asian&page=0" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "asian",
  "page": 0,
  "totalResults": 24,
  "results": [
    {
      "id": "88220307",
      "encoded_id": "ouiiivkee15",
      "title": "ModelMedia Asia - Young married woman Bai Jie - Newlyweds with a lot of love",
      "url": "https://xvideos.place/video.ouiiivkee15/modelmedia_asia_-_young_married_woman_bai_jie_-_newlyweds_with_a_lot_of_love",
      "thumbnail": "https://thumb-cdn77.xvideos-cdn.com/98c5594e-2edf-4d97-ac0f-65dfb7c7a7b7/3/xv_23_t.jpg",
      "thumbnail_sfw": "https://thumb-cdn77.xvideos-cdn.com/98c5594e-2edf-4d97-ac0f-65dfb7c7a7b7/3/xv_5_t.jpg",
      "duration": "68 min",
      "views": "61.4k",
      "uploader": {
        "name": "ModelMedia",
        "url": "https://xvideos.place/asiam",
        "verified": true
      },
      "quality": "1080p"
    }
  ]
}`},{name:"XV Stream",method:"GET",endpoint:"/api/adult/xv/stream",provider:"Adult (XVideos)",description:"Get video stream URL and related videos from xvideos.place (18+ Only)",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the video page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/xv/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface RelatedVideo {
  id: number;
  eid: string;
  u: string;
  i: string;
  tf: string;
  t: string;
  d: string;
  r: string;
  n: string;
  p: string;
  pn: string;
  pu: string;
}

interface StreamResponse {
  success: boolean;
  videoUrl: string | null;
  videoType: string | null;
  imageUrl: string | null;
  title: string | null;
  relatedVideos: RelatedVideo[];
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/xv/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/xv/stream?url=https%3A%2F%2Fxvideos.place%2Fvideo.otfomfv692c%2Fhorny_asian_passionate_in_bathroom" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "videoUrl": "https://hls-delivery.xvideos-cdn.com/videos/mp4/path/to/video.mp4",
  "videoType": "video/mp4",
  "imageUrl": "https://thumb-cdn77.xvideos-cdn.com/8a111fa6-495c-438f-ba57-ba2f8530c71b/0/xv_7_t.jpg",
  "title": "Horny Asian Passionate in Bathroom then she said ''Cum in my Pussy Please''",
  "relatedVideos": [
    {
      "id": 67086327,
      "eid": "kffamfm136c",
      "u": "https://xvideos.place/video.mlclbu1971/get_fucked_-_lesbian_sex",
      "i": "https://thumb-cdn77.xvideos-cdn.com/6c2aac99-77a1-47ae-9e7b-adda580cb3f9/0/xv_11_t.jpg",
      "tf": "https://thumb-cdn77.xvideos-cdn.com/6c2aac99-77a1-47ae-9e7b-adda580cb3f9/0/xv_1_t.jpg",
      "t": "Get Fucked - Lesbian Sex",
      "d": "11min",
      "r": "H",
      "n": "7.3M",
      "p": "https://cdn77-pic.xvideos-cdn.com/videos/thumbsl/...",
      "pn": "Teamskeet",
      "pu": "/teamskeet"
    }
  ]
}`},{name:"FZ Home",method:"GET",endpoint:"/api/adult/fz",provider:"Adult (Fuckmaza)",description:"Get latest adult videos from fuckmaza.com (18+ Only)",requiresAuth:!1,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"},{name:"filter",type:"string",required:!1,description:"Filter type: 'latest', 'popular', 'most-viewed', 'longest', 'random' (default: 'latest')"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/fz?page=1&filter=latest\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  trailer?: string;
  duration: string;
  views: string;
  rating?: string;
}

interface FZResponse {
  success: boolean;
  videos: Video[];
  totalVideos: number;
  filter?: string;
}

const data: FZResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/fz?page=1&filter=latest\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/fz?page=1&filter=latest" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "videos": [
    {
      "id": "791",
      "title": "Mallu wife wearing a gajra (flower garland) gives her first blowjob on her wedding night",
      "url": "https://fuckmaza.com/mallu-wife-wearing-a-gajra-flower-garland-gives-her-first-blowjob-on-her-wedding-night/",
      "thumbnail": "https://fuckmaza.com/wp-content/uploads/2025/12/gajra-pehni-mallu-wife-ki-first-blowjob-sex-clip-suhagrat-ke-din.jpg",
      "trailer": "https://cdn2.hindixxx2.club/2025/12/gajra-pehni-mallu-wife-ki-first-blowjob-sex-clip-suhagrat-ke-din.mp4",
      "duration": "00:35",
      "views": "2K",
      "rating": "75%"
    },
    {
      "id": "640",
      "title": "Famous TikTok girl Minahil Malik's nude MMS goes viral",
      "url": "https://fuckmaza.com/famous-tiktok-girl-minahil-maliks-nude-mms-goes-viral/",
      "thumbnail": "https://fuckmaza.com/wp-content/uploads/2025/12/famous-muslim-tiktok-girl-minahil-malik-ki-nangi-mms-viral.jpg",
      "trailer": "https://cdn2.hindixxx2.club/2025/12/famous-muslim-tiktok-girl-minahil-malik-ki-nangi-mms-viral.mp4",
      "duration": "06:11",
      "views": "6K",
      "rating": "75%"
    }
  ],
  "totalVideos": 2,
  "filter": "latest"
}`},{name:"FZ Search",method:"GET",endpoint:"/api/adult/fz/search",provider:"Adult (Fuckmaza)",description:"Search adult videos on fuckmaza.com (18+ Only)",requiresAuth:!1,parameters:[{name:"query",type:"string",required:!0,description:"Search query term"},{name:"q",type:"string",required:!0,description:"Alternative to 'query' parameter"},{name:"page",type:"string",required:!1,description:"Page number (default: 1)"},{name:"filter",type:"string",required:!1,description:"Filter type: 'latest', 'popular', 'most-viewed', 'longest', 'random' (default: 'latest')"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/fz/search?query=\${encodeURIComponent(searchQuery)}&page=1\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  trailer?: string;
  duration: string;
  views: string;
  rating?: string;
}

interface SearchData {
  success: boolean;
  query: string;
  totalResults: string;
  videos: Video[];
  filter?: string;
}

const data: SearchData = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/fz/search?query=\${encodeURIComponent(searchQuery)}&page=1\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/fz/search?query=indian&page=1" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "indian",
  "totalResults": "4 videos found",
  "videos": [
    {
      "id": "2479",
      "title": "Indian college girls ki lesbian sex video XXX MMS",
      "url": "https://fuckmaza.com/indian-college-girls-ki-lesbian-sex-video-xxx-mms/",
      "thumbnail": "https://fuckmaza.com/wp-content/uploads/2026/01/Indian-college-girls-ki-lesbian-sex-video.jpg",
      "trailer": "https://cdn.sexyvideoindian.com/2026/01/Indian-college-girls-ki-lesbian-sex-video.mp4",
      "duration": "01:18",
      "views": "9K",
      "rating": "100%"
    },
    {
      "id": "1636",
      "title": "Horny Tiktoker Lesbian Desi XXX Video Video",
      "url": "https://fuckmaza.com/horny-tiktoker-lesbian-desi-xxx-video-video/",
      "thumbnail": "https://fuckmaza.com/wp-content/uploads/2026/01/Horny-Tiktoker-Lesbian-Desi-XXX-Video.jpg",
      "trailer": "https://cdn.xxxmms.com/2026/01/Horny-Tiktoker-Lesbian-Desi-XXX-Video.mp4",
      "duration": "04:08",
      "views": "5K",
      "rating": "91%"
    }
  ],
  "filter": "latest"
}`},{name:"FZ Stream",method:"GET",endpoint:"/api/adult/fz/stream",provider:"Adult (Fuckmaza)",description:"Get video stream URL, poster, and recommended videos from fuckmaza.com (18+ Only)",requiresAuth:!1,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the video page on fuckmaza.com"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/adult/fz/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface RecommendedVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  trailer?: string;
  duration: string;
  views: string;
  rating?: string;
}

interface VideoData {
  success: boolean;
  videoUrl: string | null;
  poster: string | null;
  title: string | null;
  iframeUrl: string | null;
  recommendedVideos: RecommendedVideo[];
}

const data: VideoData = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/adult/fz/stream?url=\${encodeURIComponent(videoUrl)}\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/adult/fz/stream?url=https%3A%2F%2Ffuckmaza.com%2Ftamil-aunty-hot-sex-videos-romances-with-35-year-old-aunty%2F" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "videoUrl": "https://data.fuckmaza.com/tamil-aunty-hot-sex-videos-romances-with-35-year-old-aunty.mp4",
  "poster": "https://fuckmaza.com/wp-content/uploads/2025/12/tamil-sister-sex-video-.jpg",
  "title": "Tamil aunty hot sex videos romances with 35 year old aunty",
  "iframeUrl": "https://fuckmaza.com/wp-content/plugins/clean-tube-player/public/player-x.php?q=cG9zdF9pZD0xNTkzJnR5cGU9dmlkZW8...",
  "recommendedVideos": [
    {
      "id": "3002",
      "title": "Tamil girl giving blowjob and enjoying sex time clip video",
      "url": "https://fuckmaza.com/tamil-girl-giving-blowjob-and-enjoying-sex-time-clip-video/",
      "thumbnail": "https://fuckmaza.com/wp-content/uploads/2026/01/tamil-wife-ne-lover-ka-lund-boobs-par-ghiskar-blowjob-diya.jpg",
      "trailer": "https://cdn2.hindixxx2.club/2026/01/tamil-wife-ne-lover-ka-lund-boobs-par-ghiskar-blowjob-diya.mp4",
      "duration": "11:50",
      "views": "1K",
      "rating": "0%"
    },
    {
      "id": "3010",
      "title": "Tamil husband wife ki homemade sex video clip",
      "url": "https://fuckmaza.com/tamil-husband-wife-ki-homemade-sex-video-clip/",
      "thumbnail": "https://fuckmaza.com/wp-content/uploads/2026/01/Tamil-husband-wife-ki-homemade-sex-video.jpg",
      "trailer": "https://cdn.sexyvideoindian.com/2026/01/Tamil-husband-wife-ki-homemade-sex-video.mp4",
      "duration": "02:50",
      "views": "1K"
    }
  ]
}`},{name:"HubCloud Extractor",method:"GET",endpoint:"/api/extractors/hubcloud",provider:"Extractors",description:"Extract download/stream links from HubCloud URLs",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"HubCloud URL to extract"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/extractors/hubcloud?url=\${encodeURIComponent(hubcloudUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Stream {
  server: string;
  link: string;
  type: string;
}

interface HubCloudResponse {
  success: boolean;
  streams: Stream[];
}

const data: HubCloudResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/extractors/hubcloud?url=\${encodeURIComponent(hubcloudUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/extractors/hubcloud?url=https%3A%2F%2Fhubcloud.lol%2F..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "streams": [
    {
      "server": "HubCloud",
      "link": "https://hubcloud.lol/drive/...",
      "type": "mkv"
    }
  ]
}`},{name:"GDFlix Extractor",method:"GET",endpoint:"/api/extractors/gdflix",provider:"Extractors",description:"Extract download/stream links from GDFlix URLs",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"GDFlix URL to extract"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/extractors/gdflix?url=\${encodeURIComponent(gdflixUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Stream {
  server: string;
  link: string;
  type: string;
  quality?: string;
}

interface GDFlixResponse {
  success: boolean;
  streams: Stream[];
}

const data: GDFlixResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/extractors/gdflix?url=\${encodeURIComponent(gdflixUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/extractors/gdflix?url=https%3A%2F%2Fgdflix.cfd%2F..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "streams": [
    {
      "server": "GDFlix",
      "link": "https://gdflix.cfd/file/...",
      "type": "mkv",
      "quality": "1080p"
    }
  ]
}`},{name:"UhdMovies Home",method:"GET",endpoint:"/api/uhdmovies",provider:"UhdMovies",description:"Get recent movies and TV shows from UhdMovies homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/uhdmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
}

interface UhdMoviesResponse {
  success: boolean;
  data: {
    movies: Movie[];
    page: number;
    totalItems: number;
  };
}

const data: UhdMoviesResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/uhdmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/uhdmovies?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "movies": [
      {
        "id": "killer-whale-2026",
        "title": "Download Killer Whale (2026) {English Audio} 2160p || 4k || 1080p",
        "url": "https://uhdmovies.earth/download-killer-whale-2026/",
        "imageUrl": "https://uhdmovies.earth/wp-content/uploads/..."
      }
    ],
    "page": 1,
    "totalItems": 20
  }
}`},{name:"UhdMovies Search",method:"GET",endpoint:"/api/uhdmovies/search",provider:"UhdMovies",description:"Search movies and TV shows on UhdMovies",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"},{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/uhdmovies/search?q=\${query}&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    searchResults: SearchResult[];
    query: string;
    page: number;
    totalItems: number;
  };
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/uhdmovies/search?q=inception&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/uhdmovies/search?q=inception&page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "searchResults": [
      {
        "id": "inception-2010",
        "title": "Download Inception (2010) 4K UHD",
        "url": "https://uhdmovies.earth/inception-2010/",
        "imageUrl": "https://uhdmovies.earth/wp-content/uploads/..."
      }
    ],
    "query": "inception",
    "page": 1,
    "totalItems": 5
  }
}`},{name:"UhdMovies Details",method:"GET",endpoint:"/api/uhdmovies/details",provider:"UhdMovies",description:"Get detailed information about a movie or TV show including download links",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the movie/show page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/uhdmovies/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  quality: string;
  url: string;
  type?: string;
  size?: string;
  fileName?: string;
}

interface Episode {
  episode: string;
  links: DownloadLink[];
}

interface MovieDetails {
  title: string;
  imageUrl: string;
  posterImages: string[];
  description: string;
  genres: string[];
  releaseDate: string;
  views: string;
  youtubeTrailer: string;
  downloadLinks: DownloadLink[];
  episodes: Episode[];
}

interface DetailsResponse {
  success: boolean;
  data: MovieDetails;
}

const data: DetailsResponse = await response.json();
console.log(data);`,jsExample:`const movieUrl = 'https://uhdmovies.earth/download-killer-whale-2026/';

fetch(\`\${baseUrl}/api/uhdmovies/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/uhdmovies/details?url=https%3A%2F%2Fuhdmovies.earth%2Fdownload-killer-whale-2026%2F" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "Download Killer Whale (2026) {English Audio} 2160p || 4k || 1080p",
    "imageUrl": "https://image.tmdb.org/t/p/original/...",
    "posterImages": [
      "https://image.tmdb.org/t/p/original/..."
    ],
    "description": "Download Killer Whale (2026) WEB-DL...",
    "genres": ["Movies"],
    "releaseDate": "January 16, 2026",
    "views": "4,561 views",
    "youtubeTrailer": "https://youtube.com/embed/...",
    "downloadLinks": [
      {
        "quality": "4K/2160p",
        "url": "https://tech.unblockedgames.world/?sid=...",
        "type": "HEVC WEB-DL",
        "size": "9.56 GB",
        "fileName": "Killer.Whale.2026.2160p.AMZN.WEB-DL.DDP5.1.H.265-BYNDR"
      },
      {
        "quality": "1080p",
        "url": "https://tech.unblockedgames.world/?sid=...",
        "type": "x264 WEB-DL",
        "size": "5.39 GB",
        "fileName": "Killer.Whale.2026.1080p.AMZN.WEB-DL.DDP5.1.H.264-BYNDR"
      }
    ],
    "episodes": []
  }
}`},{name:"UhdMovies Tech Extractor",method:"GET",endpoint:"/api/uhdmovies/tech",provider:"UhdMovies",description:"Extract direct download links from tech.unblockedgames.world URLs with multiple server options",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full tech.unblockedgames.world URL with sid parameter"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/uhdmovies/tech?url=\${encodeURIComponent(techUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Stream {
  server: string;
  link: string;
  type: string;
}

interface TechResponse {
  success: boolean;
  data: {
    servers: Stream[];
    totalServers: number;
  };
}

const data: TechResponse = await response.json();
console.log(data);`,jsExample:`const techUrl = 'https://tech.unblockedgames.world/?sid=...';

fetch(\`\${baseUrl}/api/uhdmovies/tech?url=\${encodeURIComponent(techUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/uhdmovies/tech?url=https%3A%2F%2Ftech.unblockedgames.world%2F%3Fsid%3D..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "servers": [
      {
        "server": "ResumeBot",
        "link": "https://resumebot.example.com/download/...",
        "type": "mkv"
      },
      {
        "server": "Cloud Download",
        "link": "https://cloud.example.com/...",
        "type": "mkv"
      },
      {
        "server": "Cf Worker 1.0",
        "link": "https://worker1.example.com/...",
        "type": "mkv"
      },
      {
        "server": "Cf Worker 2.0",
        "link": "https://worker2.example.com/...",
        "type": "mkv"
      },
      {
        "server": "Gdrive-Instant",
        "link": "https://drive.google.com/...",
        "type": "mkv"
      }
    ],
    "totalServers": 5
  }
}`},{name:"Moviesmod Home",method:"GET",endpoint:"/api/mod",provider:"Moviesmod",description:"Get recent movies and TV shows from Moviesmod homepage",requiresAuth:!0,parameters:[{name:"page",type:"string",required:!1,description:"Page number (default: 1)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/mod?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  image: string;
}

interface ModResponse {
  success: boolean;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  totalResults: number;
  results: Movie[];
}

const data: ModResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/mod?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/mod?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "page": 1,
  "totalPages": 1015,
  "hasNextPage": true,
  "totalResults": 20,
  "results": [
    {
      "title": "Download Can This Love Be Translated? (Season 1) Multi Audio {Hindi-English-Korean} WeB-DL 480p [240MB] || 720p [430MB] || 1080p [1.7GB]",
      "url": "https://moviesmod.build/download-can-this-love-be-translated-season-1-hindi-480p-720p-1080p/",
      "image": "https://moviesmod.build/wp-content/uploads/2026/01/Download-Can-This-Love-Be-Translated-MoviesMod.jpg"
    }
  ]
}`},{name:"Moviesmod Search",method:"GET",endpoint:"/api/mod/search",provider:"Moviesmod",description:"Search movies and TV shows on Moviesmod",requiresAuth:!0,parameters:[{name:"q",type:"string",required:!0,description:"Search query"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/mod/search?q=loki\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  image: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  totalResults: number;
  results: Movie[];
}

const data: SearchResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/mod/search?q=loki\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/mod/search?q=loki" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "query": "loki",
  "totalResults": 2,
  "results": [
    {
      "title": "Download Loki (Season 1 – 2) {Hindi-English} WeB-DL 480p [160MB] || 720p [270MB] || 1080p [1.2GB]",
      "url": "https://moviesmod.build/download-loki-hindi-season-2/",
      "image": "https://moviesmod.build/wp-content/uploads/2021/06/Download-Loki-Season-1-Hindi-English-720p-WeB-DL-Esubs-200x300.jpg"
    }
  ]
}`},{name:"Moviesmod Details",method:"GET",endpoint:"/api/mod/details",provider:"Moviesmod",description:"Get movie/show details including screenshots and download links",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the movie/show page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/mod/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  quality: string;
  format?: string;
  audio?: string;
  size?: string;
  episodeLink?: string;
  batchLink?: string;
}

interface MovieDetails {
  title: string;
  description?: string;
  image?: string;
  screenshots: string[];
  downloadLinks: DownloadLink[];
}

interface DetailsResponse {
  success: boolean;
  data: MovieDetails;
}

const data: DetailsResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/mod/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/mod/details?url=https%3A%2F%2Fmoviesmod.build%2Fdownload-the-rip-2026-hindi-english-480p-720p-1080p%2F" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "title": "Download The Rip (2026) Dual Audio (Hindi-English) Msubs Web-Dl 480p [380MB] || 720p [1GB] || 1080p [2.4GB]",
    "description": "A master interpreter faces his toughest task yet: unraveling the whimsical heart of a celebrity. Can he translate emotions into the language of love?",
    "image": "https://moviesmod.build/wp-content/uploads/2026/01/Download-The-Rip-MoviesMod.jpg",
    "screenshots": [
      "https://i0.wp.com/blogger.googleusercontent.com/img/...",
      "https://i0.wp.com/blogger.googleusercontent.com/img/..."
    ],
    "downloadLinks": [
      {
        "quality": "480p",
        "format": "x264",
        "audio": "Hindi-English",
        "size": "380MB",
        "episodeLink": "https://links.modpro.blog/archives/148034"
      },
      {
        "quality": "720p",
        "format": "10bit",
        "audio": "Hindi-English",
        "size": "670MB",
        "episodeLink": "https://links.modpro.blog/archives/148099"
      },
      {
        "quality": "1080p",
        "audio": "Hindi-English",
        "size": "2.4GB",
        "episodeLink": "https://links.modpro.blog/archives/148036"
      }
    ]
  }
}`},{name:"Moviesmod Episode/Download Links",method:"GET",endpoint:"/api/mod/modpro",provider:"Moviesmod",description:"Get episode links, tech links, and server download links from modpro.blog pages",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Full URL of the episode/download links page"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/mod/modpro?url=\${encodeURIComponent(linksUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface EpisodeLink {
  episode: string;
  url: string;
}

interface ServerLink {
  server: string;
  url: string;
  title?: string;
}

interface ModProResponse {
  success: boolean;
  data: {
    serverLinks: ServerLink[];
    episodeLinks: EpisodeLink[];
    techLinks: EpisodeLink[];
    downloadLinks: string[];
    totalEpisodes: number;
  };
}

const data: ModProResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/mod/modpro?url=\${encodeURIComponent(linksUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/mod/modpro?url=https%3A%2F%2Fepisodes.modpro.blog%2Farchives%2F122296" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "serverLinks": [
      {
        "server": "✅ Fast Server (G-Drive)",
        "url": "https://tech.unblockedgames.world/?sid=...",
        "title": "✔ Fast Google Drive Links (No Login Required)"
      },
      {
        "server": "🚀 Google Drive (Server 2)",
        "url": "https://tech.unblockedgames.world/?sid=...",
        "title": "✔ Fast Google Drive Links (No Need to Login)"
      }
    ],
    "episodeLinks": [],
    "techLinks": [
      {
        "episode": "Episode 1",
        "url": "https://tech.unblockedgames.world/?sid=..."
      },
      {
        "episode": "Episode 2",
        "url": "https://tech.unblockedgames.world/?sid=..."
      }
    ],
    "downloadLinks": [],
    "totalEpisodes": 2
  }
}`},{name:"Moviesmod Stream Extractor",method:"GET",endpoint:"/api/uhdmovies/tech",provider:"Moviesmod",description:"Extract direct download links from tech.unblockedgames.world URLs (ResumeBot, Cloud Download, CF Workers, Instant, CDN) - Uses UHDMovies tech extractor",requiresAuth:!0,parameters:[{name:"url",type:"string",required:!0,description:"Tech.unblockedgames.world URL with sid parameter"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/uhdmovies/tech?url=\${encodeURIComponent(techUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Stream {
  server: string;
  link: string;
  type: string;
}

interface StreamResponse {
  success: boolean;
  data: {
    servers: Stream[];
    totalServers: number;
  };
}

const data: StreamResponse = await response.json();
console.log(data);`,jsExample:`fetch(\`\${baseUrl}/api/uhdmovies/tech?url=\${encodeURIComponent(techUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/uhdmovies/tech?url=https%3A%2F%2Ftech.unblockedgames.world%2F%3Fsid%3D..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "data": {
    "servers": [
      {
        "server": "ResumeBot",
        "link": "https://resumebot-download-url.com/file.mkv",
        "type": "mkv"
      },
      {
        "server": "Cf Worker 1.0",
        "link": "https://worker.example.com/file.mkv",
        "type": "mkv"
      },
      {
        "server": "Gdrive-Instant",
        "link": "https://drive.google.com/uc?id=...",
        "type": "mkv"
      }
    ],
    "totalServers": 3
  }
}`},{name:"YouTube Y2Mate Downloader",method:"GET",endpoint:"/api/youtubes/y2mate",provider:"YouTube (Private)",description:"Download YouTube videos and audio using Y2Mate API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",requiresAuth:!0,isPrivate:!0,requestLimit:5,ownerContact:{email:"hunternisha55@gmail.com",telegram:"https://t.me/ScreenScapee"},parameters:[{name:"url",type:"string",required:!0,description:"YouTube video URL"},{name:"format",type:"string",required:!1,description:"Output format: 'mp3' or 'mp4' (default: mp3)"},{name:"audioBitrate",type:"string",required:!1,description:"Audio bitrate: '128', '192', '256', '320' (default: 320)"},{name:"videoQuality",type:"string",required:!1,description:"Video quality: '360', '480', '720', '1080' (default: 720)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/youtubes/y2mate?url=https://youtube.com/watch?v=VIDEO_ID&format=mp3&audioBitrate=320\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Y2MateResponse {
  success: boolean;
  videoId: string;
  iframeUrl: string;
  downloads?: unknown;
  error?: string;
}

const data: Y2MateResponse = await response.json();
console.log(data);

// ⚠️ WARNING: Limited to 5 requests per API key
// Contact owner to request access or increase limit
// Email: hunternisha55@gmail.com
// Telegram: https://t.me/ScreenScapee`,jsExample:`fetch(\`\${baseUrl}/api/youtubes/y2mate?url=https://youtube.com/watch?v=VIDEO_ID&format=mp3\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
  
// ⚠️ LIMITED TO 5 REQUESTS - Contact owner for access`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/youtubes/y2mate?url=https://youtube.com/watch?v=VIDEO_ID&format=mp3&audioBitrate=320" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"
  
# ⚠️ LIMITED TO 5 REQUESTS PER KEY
# Contact: hunternisha55@gmail.com or https://t.me/ScreenScapee`,responseExample:`{
  "success": true,
  "videoId": "VIDEO_ID",
  "iframeUrl": "https://frame.y2meta-uk.com/wwwindex.php?videoId=VIDEO_ID",
  "downloads": {
    "title": "Video Title",
    "downloadUrl": "https://...",
    "format": "mp3",
    "quality": "320kbps"
  }
}`},{name:"YouTube VidsSave Downloader",method:"GET",endpoint:"/api/youtubes/vidssave",provider:"YouTube (Private)",description:"Download Instagram content via VidsSave. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",requiresAuth:!0,isPrivate:!0,requestLimit:5,ownerContact:{email:"hunternisha55@gmail.com",telegram:"https://t.me/ScreenScapee"},parameters:[{name:"link",type:"string",required:!0,description:"Instagram post/reel/story URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/youtubes/vidssave?link=https://instagram.com/p/POST_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VidsSaveResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

const data: VidsSaveResponse = await response.json();
console.log(data);

// ⚠️ WARNING: Limited to 5 requests per API key
// Contact owner: hunternisha55@gmail.com | https://t.me/ScreenScapee`,jsExample:`fetch(\`\${baseUrl}/api/youtubes/vidssave?link=https://instagram.com/p/POST_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/youtubes/vidssave?link=https://instagram.com/p/POST_ID" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "downloadUrl": "https://...",
  "thumbnail": "https://...",
  "title": "Post Title"
}`},{name:"YouTube Main Downloader",method:"GET",endpoint:"/api/youtubes/youtube",provider:"YouTube (Private)",description:"Download YouTube videos using primary API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",requiresAuth:!0,isPrivate:!0,requestLimit:5,ownerContact:{email:"hunternisha55@gmail.com",telegram:"https://t.me/ScreenScapee"},parameters:[{name:"url",type:"string",required:!0,description:"YouTube video URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/youtubes/youtube?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface YouTubeResponse {
  type: string;
  url: string;
  thumbnail: string | null;
  title: string | null;
  duration: number | null;
  videos: {
    format: string;
    quality: string | null;
    url: string;
    sizeMB: number;
  }[];
  audios: {
    format: string;
    quality: string | null;
    url: string;
    sizeMB: number;
  }[];
}

const data: YouTubeResponse = await response.json();
console.log(data);

// ⚠️ Contact: hunternisha55@gmail.com | https://t.me/ScreenScapee`,jsExample:`fetch(\`\${baseUrl}/api/youtubes/youtube?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/youtubes/youtube?url=https://youtube.com/watch?v=VIDEO_ID" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "type": "video",
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "thumbnail": "https://...",
  "title": "Video Title",
  "duration": 180,
  "videos": [
    {
      "format": "mp4",
      "quality": "1080p",
      "url": "https://...",
      "sizeMB": 45.5
    }
  ],
  "audios": [
    {
      "format": "mp3",
      "quality": "320kbps",
      "url": "https://...",
      "sizeMB": 5.2
    }
  ]
}`},{name:"YouTube SSYouTube Downloader",method:"GET",endpoint:"/api/youtubes/yt2",provider:"YouTube (Private)",description:"Download YouTube videos using SSYouTube API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",requiresAuth:!1,isPrivate:!0,requestLimit:5,ownerContact:{email:"hunternisha55@gmail.com",telegram:"https://t.me/ScreenScapee"},parameters:[{name:"url",type:"string",required:!0,description:"YouTube video URL"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/youtubes/yt2?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface YT2Response {
  success: boolean;
  youtubeUrl: string;
  videoId: string;
  data: unknown;
}

const data: YT2Response = await response.json();
console.log(data);

// ⚠️ LIMITED TO 5 REQUESTS
// Contact: hunternisha55@gmail.com | https://t.me/ScreenScapee`,jsExample:`fetch(\`\${baseUrl}/api/youtubes/yt2?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/youtubes/yt2?url=https://youtube.com/watch?v=VIDEO_ID" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "youtubeUrl": "https://youtube.com/watch?v=VIDEO_ID",
  "videoId": "VIDEO_ID",
  "data": {
    "downloadOptions": [...]
  }
}`},{name:"YouTube ClipTo Test",method:"GET",endpoint:"/api/youtubes/yttest",provider:"YouTube (Private)",description:"Test YouTube downloader using ClipTo API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",requiresAuth:!1,isPrivate:!0,requestLimit:5,ownerContact:{email:"hunternisha55@gmail.com",telegram:"https://t.me/ScreenScapee"},parameters:[{name:"url",type:"string",required:!1,description:"YouTube video URL (optional, uses default if not provided)"}],tsExample:`const response = await fetch(\`\${baseUrl}/api/youtubes/yttest?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface YTTestResponse {
  success: boolean;
  youtubeUrl: string;
  data: unknown;
}

const data: YTTestResponse = await response.json();
console.log(data);

// ⚠️ FOR TESTING ONLY - LIMITED TO 5 REQUESTS
// Owner Contact:
// Email: hunternisha55@gmail.com
// Telegram: https://t.me/ScreenScapee`,jsExample:`fetch(\`\${baseUrl}/api/youtubes/yttest?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,curlExample:`curl -X GET "https://screenscapeapi.dev/api/youtubes/yttest?url=https://youtube.com/watch?v=VIDEO_ID" \\
  -H "Content-Type: application/json"`,responseExample:`{
  "success": true,
  "youtubeUrl": "https://youtube.com/watch?v=VIDEO_ID",
  "data": {
    "data": {
      "success": false,
      "message": "Failed to fetch the video"
    }
  }
}`}];function N(){let e=(0,a.useRouter)(),{data:p,isPending:d}=(0,M.useSession)(),[c,m]=(0,s.useState)("typescript"),[u,h]=(0,s.useState)(null),[g,x]=(0,s.useState)(null),[v,y]=(0,s.useState)(null),[E,b]=(0,s.useState)(null),[f,T]=(0,s.useState)({}),[k,U]=(0,s.useState)(null),[j,w]=(0,s.useState)(!0);(0,s.useEffect)(()=>{"true"===localStorage.getItem("vps-warning-dismissed")&&w(!1)},[]),(0,s.useEffect)(()=>{let e=async()=>{if(p?.user)try{let e=await fetch("/api/keys",{credentials:"include"});if(e.ok){let t=(await e.json()).find(e=>e.isActive);t&&b(t.key)}}catch(e){console.error("Failed to fetch API keys:",e)}};p&&e()},[p]);let _=(e,t)=>{navigator.clipboard.writeText(e),h(t),setTimeout(()=>h(null),2e3)},R=(e,t)=>{let s="typescript"===t?e.tsExample:e.jsExample,a=E||"YOUR_API_KEY";return s.replace(/YOUR_API_KEY/g,a)},Y=e=>{let t=E||"YOUR_API_KEY";return e.curlExample.replace(/YOUR_API_KEY/g,t)},A=async(t,s)=>{if(!p?.user)return void e.push("/login");if(!E)return void y({index:s,data:null,error:"No active API key found. Please create an API key from the APIs page first."});x(s),y(null);try{let e=t.endpoint;if(t.parameters&&t.parameters.length>0){let a=new URLSearchParams;t.parameters.forEach(e=>{let t=f[s]?.[e.name];t?a.append(e.name,t):("q"===e.name&&a.append("q","test"),"url"===e.name&&a.append("url","/test"),"page"===e.name&&a.append("page","1"))}),e+=`?${a.toString()}`}let a=await fetch(e,{method:t.method,headers:{"Content-Type":"application/json"},credentials:"include"}),r=await a.json();a.ok?y({index:s,data:r}):y({index:s,data:null,error:r.error||r.message||`Request failed with status ${a.status}`})}catch(e){y({index:s,data:null,error:e instanceof Error?e.message:"Failed to fetch"})}finally{x(null)}};return d?(0,t.jsx)("div",{className:"container mx-auto py-8 px-4 max-w-7xl flex items-center justify-center min-h-screen",children:(0,t.jsx)(H.default,{className:"h-8 w-8 animate-spin"})}):(0,t.jsxs)("div",{className:"container mx-auto py-8 px-4 max-w-7xl",children:[(0,t.jsxs)("div",{className:"mb-8",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-4xl font-bold mb-2",children:"API Documentation"}),(0,t.jsx)("p",{className:"text-muted-foreground text-lg",children:"Complete reference for all available API endpoints with code examples"})]}),(0,t.jsxs)(r.default,{href:"https://github.com/Anshu78780/ScarperApi",target:"_blank",rel:"noopener noreferrer",className:"flex items-center gap-2 bg-black dark:bg-zinc-900 border-2 border-zinc-800 dark:border-zinc-700 rounded-lg px-4 py-2 hover:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors shadow-lg",children:[(0,t.jsx)("svg",{className:"w-5 h-5 text-white",fill:"currentColor",viewBox:"0 0 24 24","aria-hidden":"true",children:(0,t.jsx)("path",{fillRule:"evenodd",d:"M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",clipRule:"evenodd"})}),(0,t.jsx)("span",{className:"text-sm font-medium text-white",children:"Give Star ⭐"})]})]}),(0,t.jsx)(n.Card,{className:"mt-4 p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"font-semibold mb-1",children:"ScreenScape App"}),(0,t.jsx)("p",{className:"text-sm text-muted-foreground",children:"Download the official ScreenScape app for the best experience"})]}),(0,t.jsx)(r.default,{href:"https://screenscape.fun/",target:"_blank",rel:"noopener noreferrer",children:(0,t.jsxs)(i.Button,{className:"gap-2 bg-green-600 hover:bg-green-700",children:[(0,t.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",strokeWidth:"2",viewBox:"0 0 24 24",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Download App"]})})]})}),p?.user&&E&&(0,t.jsx)("div",{className:"mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg",children:(0,t.jsxs)("p",{className:"text-sm text-green-600 dark:text-green-400",children:["✓ Your API key (",E,") is active. You can test endpoints using your session."]})}),p?.user&&!E&&(0,t.jsx)("div",{className:"mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg",children:(0,t.jsxs)("p",{className:"text-sm text-yellow-600 dark:text-yellow-400",children:["⚠ To test endpoints, please create an API key from the ",(0,t.jsx)("a",{href:"/dashboard/apis",className:"underline font-medium",children:"APIs page"}),"."]})})]}),(0,t.jsxs)("div",{className:"mb-6 flex items-center gap-3",children:[(0,t.jsx)("span",{className:"text-sm font-medium",children:"Language:"}),(0,t.jsxs)(o.DropdownMenu,{children:[(0,t.jsx)(o.DropdownMenuTrigger,{asChild:!0,children:(0,t.jsxs)(i.Button,{variant:"outline",className:"w-[180px] justify-between",children:["typescript"===c?"TypeScript":"JavaScript",(0,t.jsx)(O,{className:"ml-2 h-4 w-4"})]})}),(0,t.jsxs)(o.DropdownMenuContent,{children:[(0,t.jsx)(o.DropdownMenuItem,{onClick:()=>m("typescript"),children:"TypeScript"}),(0,t.jsx)(o.DropdownMenuItem,{onClick:()=>m("javascript"),children:"JavaScript"})]})]}),(0,t.jsx)("span",{className:"text-sm font-medium ml-6",children:"Provider:"}),(0,t.jsxs)(o.DropdownMenu,{children:[(0,t.jsx)(o.DropdownMenuTrigger,{asChild:!0,children:(0,t.jsxs)(i.Button,{variant:"outline",className:"w-[180px] justify-between",children:[k||"All Providers",(0,t.jsx)(O,{className:"ml-2 h-4 w-4"})]})}),(0,t.jsxs)(o.DropdownMenuContent,{children:[(0,t.jsxs)(o.DropdownMenuItem,{onClick:()=>U(null),children:[null===k&&(0,t.jsx)($.Check,{className:"h-4 w-4 mr-2"}),"All Providers"]},"all-providers"),Array.from(new Set(L.map(e=>e.provider))).sort().map(e=>(0,t.jsxs)(o.DropdownMenuItem,{onClick:()=>U(e),children:[k===e&&(0,t.jsx)($.Check,{className:"h-4 w-4 mr-2"}),e]},e))]})]})]}),(0,t.jsx)("div",{className:"space-y-6",children:L.filter(e=>!k||e.provider===k).map((e,s)=>(0,t.jsxs)(n.Card,{className:"overflow-hidden",children:[(0,t.jsxs)(n.CardHeader,{children:[(0,t.jsx)("div",{className:"flex items-start justify-between",children:(0,t.jsxs)("div",{children:[(0,t.jsxs)(n.CardTitle,{className:"flex items-center gap-3",children:[e.name,(0,t.jsx)(l.Badge,{variant:"GET"===e.method?"default":"secondary",children:e.method}),e.requiresAuth&&(0,t.jsx)(l.Badge,{variant:"outline",className:"text-xs",children:"🔒 Auth Required"})]}),(0,t.jsx)(n.CardDescription,{className:"mt-2",children:e.description})]})}),(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)("code",{className:"text-sm bg-muted px-3 py-1.5 rounded-md font-mono",children:e.endpoint})}),("Adult (XS)"===e.provider||e.provider?.includes("XS")||"AnimeSalt"===e.provider)&&(0,t.jsx)("div",{className:"mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg",children:(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("span",{className:"text-yellow-600 dark:text-yellow-400 text-xl",children:"⚠️"}),(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("h4",{className:"font-semibold text-yellow-700 dark:text-yellow-300 mb-1",children:"IP-Based Streaming Notice"}),(0,t.jsx)("p",{className:"text-sm text-yellow-600 dark:text-yellow-400",children:"This provider uses IP-based streaming. If you fetch the stream URL from your VPS or server, you must play the video through that same server. The stream URL is tied to the IP address that requested it and cannot be played from a different location."})]})]})}),"AnimePahe"===e.provider&&e.endpoint.includes("/stream")&&(0,t.jsx)("div",{className:"mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg",children:(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("span",{className:"text-yellow-600 dark:text-yellow-400 text-xl",children:"⚠️"}),(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("h4",{className:"font-semibold text-yellow-700 dark:text-yellow-300 mb-1",children:"Required Headers for Playback"}),(0,t.jsx)("p",{className:"text-sm text-yellow-600 dark:text-yellow-400 mb-2",children:"The m3u8 stream URL returned by this endpoint requires specific headers to play properly:"}),(0,t.jsx)("div",{className:"bg-yellow-950/20 p-3 rounded border border-yellow-500/30",children:(0,t.jsxs)("code",{className:"text-xs font-mono text-yellow-600 dark:text-yellow-300",children:["Referer: https://kwik.cx/",(0,t.jsx)("br",{}),"Origin: https://kwik.cx"]})}),(0,t.jsx)("p",{className:"text-sm text-yellow-600 dark:text-yellow-400 mt-2",children:"Without these headers, the stream will not work. Make sure to include them in your video player or fetch request."})]})]})})]}),(0,t.jsxs)(n.CardContent,{className:"space-y-4",children:[e.parameters&&e.parameters.length>0&&(0,t.jsxs)("div",{children:[(0,t.jsx)("h4",{className:"text-sm font-semibold mb-3",children:"Parameters"}),(0,t.jsx)("div",{className:"space-y-3",children:e.parameters.map((e,a)=>(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3 text-sm",children:[(0,t.jsx)("code",{className:"bg-muted px-2 py-1 rounded text-xs font-mono",children:e.name}),(0,t.jsx)(l.Badge,{variant:"outline",className:"text-xs",children:e.type}),e.required&&(0,t.jsx)(l.Badge,{variant:"destructive",className:"text-xs",children:"required"}),(0,t.jsx)("span",{className:"text-muted-foreground",children:e.description})]}),(0,t.jsx)("input",{type:"text",placeholder:"q"===e.name?"Enter search query...":"url"===e.name?"Enter URL path...":`Enter ${e.name}...`,value:f[s]?.[e.name]||"",onChange:t=>{var a,r;return a=e.name,r=t.target.value,void T(e=>({...e,[s]:{...e[s],[a]:r}}))},className:"w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"})]},a))})]}),(0,t.jsxs)(q,{defaultValue:"code",className:"w-full",children:[(0,t.jsxs)(G,{children:[(0,t.jsx)(P,{value:"code",children:"Code Example"}),(0,t.jsx)(P,{value:"curl",children:"cURL"}),(0,t.jsx)(P,{value:"response",children:"Response"})]}),(0,t.jsxs)(S,{value:"code",className:"space-y-3",children:[(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsxs)("div",{className:"absolute top-3 right-3 z-10 flex gap-2",children:[(0,t.jsx)(i.Button,{size:"icon-sm",variant:"ghost",onClick:()=>_(R(e,c),10*s),children:u===10*s?(0,t.jsx)($.Check,{className:"h-4 w-4 text-green-500"}):(0,t.jsx)(D.Copy,{className:"h-4 w-4"})}),(0,t.jsx)(i.Button,{size:"sm",variant:"default",onClick:()=>A(e,s),disabled:g===s,children:g===s?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(H.default,{className:"h-4 w-4 animate-spin"}),"Testing..."]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(K.Play,{className:"h-4 w-4"}),"Try it"]})})]}),(0,t.jsx)("pre",{className:"bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm",children:(0,t.jsx)("code",{className:"language-typescript",children:"typescript"===c?(0,t.jsx)(V,{code:R(e,"typescript"),lang:"typescript"}):(0,t.jsx)(V,{code:R(e,"javascript"),lang:"javascript"})})})]}),v&&v.index===s&&(0,t.jsxs)("div",{className:"mt-4",children:[(0,t.jsxs)("h4",{className:"text-sm font-semibold mb-2 flex items-center gap-2",children:["Response",(0,t.jsx)(l.Badge,{variant:v.error?"destructive":"default",children:v.error?"Error":"Success"})]}),(0,t.jsx)("pre",{className:"bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm",children:(0,t.jsx)("code",{children:v.error?(0,t.jsx)("span",{className:"text-red-400",children:v.error}):(0,t.jsx)(V,{code:JSON.stringify(v.data,null,2),lang:"json"})})})]})]}),(0,t.jsx)(S,{value:"curl",children:(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)(i.Button,{size:"icon-sm",variant:"ghost",className:"absolute top-3 right-3 z-10",onClick:()=>_(Y(e),10*s+1),children:u===10*s+1?(0,t.jsx)($.Check,{className:"h-4 w-4 text-green-500"}):(0,t.jsx)(D.Copy,{className:"h-4 w-4"})}),(0,t.jsx)("pre",{className:"bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm",children:(0,t.jsx)("code",{children:(0,t.jsx)(V,{code:Y(e),lang:"bash"})})})]})}),(0,t.jsx)(S,{value:"response",children:(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)(i.Button,{size:"icon-sm",variant:"ghost",className:"absolute top-3 right-3 z-10",onClick:()=>_(e.responseExample,10*s+2),children:u===10*s+2?(0,t.jsx)($.Check,{className:"h-4 w-4 text-green-500"}):(0,t.jsx)(D.Copy,{className:"h-4 w-4"})}),(0,t.jsx)("pre",{className:"bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm",children:(0,t.jsx)("code",{children:(0,t.jsx)(V,{code:e.responseExample,lang:"json"})})})]})})]})]})]},s))}),(0,t.jsx)(z.AlertDialog,{open:j,onOpenChange:w,children:(0,t.jsxs)(z.AlertDialogContent,{className:"max-w-2xl",children:[(0,t.jsxs)(z.AlertDialogHeader,{children:[(0,t.jsxs)(z.AlertDialogTitle,{className:"flex items-center gap-2 text-red-600 dark:text-red-400",children:[(0,t.jsx)("svg",{className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"})}),"Important: VPS & Proxy Notice"]}),(0,t.jsx)(z.AlertDialogDescription,{asChild:!0,children:(0,t.jsxs)("div",{className:"space-y-3 text-base",children:[(0,t.jsx)("div",{className:"text-foreground",children:"Some providers may not work properly when accessed from VPS servers or cloud hosting. This is due to regional restrictions and IP-based blocking implemented by the source websites."}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"font-semibold text-foreground mb-2",children:"Recommended Solutions:"}),(0,t.jsxs)("ul",{className:"list-disc list-inside space-y-1 text-muted-foreground ml-2",children:[(0,t.jsx)("li",{children:"Use a proxy service with residential IPs"}),(0,t.jsx)("li",{children:"Host your application on a local server or personal network"}),(0,t.jsx)("li",{children:"Use a VPN with IP rotation capabilities"}),(0,t.jsx)("li",{children:"Consider using rotating proxy services for production environments"})]}),(0,t.jsx)("p",{className:"text-sm text-muted-foreground italic",children:"Click “I Understand” to dismiss this message. It won't be shown again."})]})]})})]}),(0,t.jsx)(z.AlertDialogFooter,{children:(0,t.jsx)(z.AlertDialogAction,{onClick:()=>{localStorage.setItem("vps-warning-dismissed","true"),w(!1)},className:"bg-red-600 hover:bg-red-700 w-full sm:w-auto",children:"I Understand"})})]})}),(0,t.jsx)("div",{className:"mt-12 mb-8",children:(0,t.jsx)(n.Card,{className:"border-yellow-500/30 bg-yellow-500/5",children:(0,t.jsx)(n.CardContent,{className:"p-6",children:(0,t.jsxs)("div",{className:"flex items-start gap-4",children:[(0,t.jsx)("div",{className:"flex-shrink-0",children:(0,t.jsx)("svg",{className:"h-8 w-8 text-yellow-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"})})}),(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("h3",{className:"text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-3",children:"⚠️ Educational Purpose & Legal Disclaimer"}),(0,t.jsxs)("div",{className:"space-y-2 text-sm text-yellow-800 dark:text-yellow-300",children:[(0,t.jsxs)("p",{children:[(0,t.jsx)("strong",{children:"This project is intended for educational purposes only."})," It is designed to demonstrate web scraping techniques, API development, and full-stack application architecture."]}),(0,t.jsx)("p",{children:"We do not claim ownership of any content, media, or materials accessed through this API. All rights to the original content belong to their respective owners and providers."}),(0,t.jsx)("p",{children:"By using this API, you acknowledge that:"}),(0,t.jsxs)("ul",{className:"list-disc list-inside ml-4 space-y-1",children:[(0,t.jsx)("li",{children:"You are responsible for complying with all applicable laws and regulations in your jurisdiction"}),(0,t.jsx)("li",{children:'This service is provided "as is" without warranties of any kind'}),(0,t.jsx)("li",{children:"The developers and contributors are not liable for any misuse of this API"}),(0,t.jsx)("li",{children:"You will respect copyright laws and terms of service of the source websites"}),(0,t.jsx)("li",{children:"This API should not be used for commercial purposes without proper authorization"})]}),(0,t.jsx)("p",{className:"mt-3 font-semibold",children:"Use this API responsibly and at your own risk. If you are a content owner and wish to have your content removed, please contact the project maintainers."})]})]})]})})})})]})}function V({code:e,lang:s}){let a=["const","let","var","function","async","await","return","if","else","for","while","import","export","interface","type","class","new","try","catch","throw"],r=["string","number","boolean","any","void","Array","Promise","Response"];return"json"===s?(0,t.jsx)("span",{children:e.split("\n").map((e,s)=>(0,t.jsx)("div",{children:e.split(/(".*?":?|true|false|null|\d+)/).map((e,s)=>e.match(/^".*":$/)?(0,t.jsx)("span",{className:"text-blue-400",children:e},s):e.match(/^".*"$/)?(0,t.jsx)("span",{className:"text-green-400",children:e},s):e.match(/^(true|false|null)$/)?(0,t.jsx)("span",{className:"text-purple-400",children:e},s):e.match(/^\d+$/)?(0,t.jsx)("span",{className:"text-orange-400",children:e},s):(0,t.jsx)("span",{children:e},s))},s))}):"bash"===s?(0,t.jsx)("span",{children:e.split("\n").map((e,s)=>(0,t.jsx)("div",{children:e.split(/(-[HXd]|curl|"[^"]*")/).map((e,s)=>"curl"===e?(0,t.jsx)("span",{className:"text-purple-400",children:e},s):e.match(/^-[HXd]$/)?(0,t.jsx)("span",{className:"text-blue-400",children:e},s):e.match(/^".*"$/)?(0,t.jsx)("span",{className:"text-green-400",children:e},s):(0,t.jsx)("span",{children:e},s))},s))}):(0,t.jsx)("span",{children:e.split("\n").map((e,s)=>(0,t.jsx)("div",{children:e.split(/(\s+|[{}()\[\];,.]|'[^']*'|"[^"]*"|`[^`]*`|\/\/.*$)/).map((e,s)=>a.includes(e)?(0,t.jsx)("span",{className:"text-purple-400",children:e},s):r.includes(e)?(0,t.jsx)("span",{className:"text-cyan-400",children:e},s):e.match(/^['"`].*['"`]$/)?(0,t.jsx)("span",{className:"text-green-400",children:e},s):e.match(/^\/\/.*/)?(0,t.jsx)("span",{className:"text-gray-500",children:e},s):e.match(/^[A-Z][a-zA-Z]*$/)?(0,t.jsx)("span",{className:"text-yellow-400",children:e},s):(0,t.jsx)("span",{children:e},s))},s))})}e.s(["default",()=>N],77741)}]);