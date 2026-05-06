import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const animeData = [
  {
    id: '1',
    title: 'Bleach: Thousand-Year Blood War',
    synopsis: 'The peace is suddenly broken when warning sirens clamor through the Soul Society.',
    coverImage: 'https://images.alphacoders.com/127/1273347.jpg',
    bannerImage: 'https://images7.alphacoders.com/127/1273347.jpg',
    rating: '9.1',
    year: '2022',
    genre: ['Action', 'Adventure', 'Fantasy'],
  },
  {
    id: '2',
    title: 'Jujutsu Kaisen',
    synopsis: 'A boy swallows a cursed talisman—the finger of a demon—and becomes cursed himself.',
    coverImage: 'https://images2.alphacoders.com/109/1090332.png',
    bannerImage: 'https://images2.alphacoders.com/109/1090332.png',
    rating: '8.7',
    year: '2020',
    genre: ['Action', 'Fantasy'],
  },
  {
    id: '3',
    title: 'Chainsaw Man',
    synopsis: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita.',
    coverImage: 'https://images2.alphacoders.com/126/1263435.jpg',
    bannerImage: 'https://images2.alphacoders.com/126/1263435.jpg',
    rating: '8.5',
    year: '2022',
    genre: ['Action', 'Adventure'],
  }
];

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Reiatsu Backend is running flawlessly' });
});

app.get('/api/anime', (req: Request, res: Response) => {
  res.json(animeData);
});

app.get('/api/anime/:id', (req: Request, res: Response) => {
  const anime = animeData.find((a) => a.id === req.params.id);
  if (anime) {
    res.json(anime);
  } else {
    res.status(404).json({ message: 'Anime not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running cleanly on http://localhost:${PORT}`);
});
