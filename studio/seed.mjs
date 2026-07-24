/**
 * One-time content seed: mirrors the web app's mock data (5 projects +
 * about) into the Sanity dataset, uploading the bundled images as assets.
 *
 * Run from studio/: pnpm run seed
 * (sanity exec seed.mjs --with-user-token)
 *
 * Idempotent — documents use fixed _ids and are createOrReplace'd.
 */
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2024-07-23' });

const IMAGES_DIR = resolve(process.cwd(), '..', 'artifacts', 'cameraeye', 'public', 'images');

async function uploadImage(filename) {
  const asset = await client.assets.upload(
    'image',
    createReadStream(resolve(IMAGES_DIR, filename)),
    { filename },
  );
  console.log(`uploaded ${filename} -> ${asset._id}`);
  return asset._id;
}

function imageRef(assetId, extra = {}) {
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
    ...extra,
  };
}

const geo = (lat, lng) => ({ _type: 'geopoint', lat, lng });

async function run() {
  // ---- assets --------------------------------------------------------
  const [editorial, urban, campaign, portrait, still, aboutPortrait] =
    await Promise.all([
      uploadImage('editorial-1.jpg'),
      uploadImage('urban-1.jpg'),
      uploadImage('campaign-1.jpg'),
      uploadImage('portrait-1.jpg'),
      uploadImage('still-1.jpg'),
      uploadImage('about-portrait.jpg'),
    ]);

  // ---- documents (mirrors artifacts/cameraeye/src/data/mockData.ts) --
  const docs = [
    {
      _id: 'project-shadows-and-light',
      _type: 'project',
      title: 'Shadows & Light',
      slug: { _type: 'slug', current: 'shadows-and-light' },
      category: 'editorial',
      year: 2023,
      client: 'Vogue',
      description:
        'An exploration of harsh chiaroscuro lighting in modern fashion photography, highlighting the interplay between garment textures and absolute darkness.',
      story:
        'We built the entire set around a single 5K fresnel and a wall of black velvet. Every frame was metered for the highlights and let the shadows fall to true black — nothing was recovered in post. The garments were chosen for how their textures broke the single hard light source.\n\nShot over two days in a Brooklyn studio, the series became a study in restraint: one light, one lens, and the discipline to leave darkness alone.',
      format: 'digital',
      camera: 'Hasselblad X2D 100C',
      lenses: ['XCD 55V', 'XCD 90V'],
      featured: true,
      order: 1,
      coverImage: imageRef(editorial, { alt: 'Model in chiaroscuro light, black velvet backdrop' }),
      images: [
        { _key: 'img1', ...imageRef(editorial, { alt: 'Model in chiaroscuro light, black velvet backdrop' }) },
        { _key: 'img2', ...imageRef(campaign, { alt: 'Textured garment breaking a single hard light source' }) },
      ],
    },
    {
      _id: 'project-urban-desolation',
      _type: 'project',
      title: 'Urban Desolation',
      slug: { _type: 'slug', current: 'urban-desolation' },
      category: 'personal',
      year: 2022,
      description:
        'Cinematic wide shots capturing the quiet, moody atmosphere of the city just after dusk. Desaturated tones evoke a sense of isolation.',
      story:
        'Walked the same twelve blocks every night for a winter. The city empties out in the hour after dusk — commuters gone, nightlife not yet awake — and what remains is sodium vapor, wet asphalt and the occasional stranger.\n\nEverything was shot handheld at walking pace on CineStill 800T, pushed one stop. The halation around the streetlights is the film, not a filter.',
      format: '35mm',
      filmStock: 'CineStill 800T (+1)',
      camera: 'Leica M6',
      lenses: ['Summicron 35mm f/2'],
      featured: true,
      order: 2,
      coverImage: imageRef(urban, { alt: 'Empty city street after dusk under sodium vapor light' }),
      images: [
        {
          _key: 'img1',
          ...imageRef(urban, { alt: 'Empty city street after dusk under sodium vapor light' }),
          location: geo(40.7181, -73.9973),
          locationLabel: 'Bowery, New York',
        },
        {
          _key: 'img2',
          ...imageRef(still, { alt: 'Quiet storefront still life at night' }),
          location: geo(40.7146, -73.9935),
          locationLabel: 'Lower East Side, New York',
        },
      ],
    },
    {
      _id: 'project-brutalism-campaign',
      _type: 'project',
      title: 'Brutalism',
      slug: { _type: 'slug', current: 'brutalism-campaign' },
      category: 'campaign',
      year: 2024,
      client: 'Y-3',
      description:
        'A fashion campaign set against stark architectural concrete, emphasizing strong shadows and sharp silhouettes in a desolate environment.',
      story:
        'The location — a decommissioned grain silo complex — did most of the work. We scheduled every look around the sun: raking side light in the morning for texture, hard top light at noon for the silhouettes.\n\nThe palette was reduced to concrete, black technical fabric and skin. Medium format kept the tonal transitions in the concrete smooth enough to print mural-size.',
      format: '120',
      filmStock: 'Ilford HP5+ 400',
      camera: 'Pentax 67II',
      lenses: ['105mm f/2.4'],
      featured: true,
      order: 3,
      coverImage: imageRef(campaign, { alt: 'Model silhouetted against raw concrete wall' }),
      images: [
        {
          _key: 'img1',
          ...imageRef(campaign, { alt: 'Model silhouetted against raw concrete wall' }),
          location: geo(37.5665, 126.978),
          locationLabel: 'Seoul',
        },
        { _key: 'img2', ...imageRef(urban, { alt: 'Concrete stairwell with hard top light' }) },
        { _key: 'img3', ...imageRef(editorial, { alt: 'Black technical fabric detail against concrete' }) },
      ],
    },
    {
      _id: 'project-quiet-hours',
      _type: 'project',
      title: 'Quiet Hours',
      slug: { _type: 'slug', current: 'quiet-hours' },
      category: 'portrait',
      year: 2023,
      description:
        'Intimate portraits captured with soft window light. Shot on 35mm film to preserve the natural grain and emotional texture of the subjects.',
      story:
        'Every sitting happened between 7 and 9 in the morning, in the subject’s own home, before the day started. No lights, no assistants — just north-facing window light and however much coffee it took for people to forget the camera.\n\nPortra keeps skin honest at box speed; the grain does the rest.',
      format: '35mm',
      filmStock: 'Kodak Portra 400',
      camera: 'Nikon F3',
      lenses: ['50mm f/1.4 AI-S'],
      featured: false,
      order: 4,
      coverImage: imageRef(portrait, { alt: 'Window-lit portrait in soft morning light' }),
      images: [
        { _key: 'img1', ...imageRef(portrait, { alt: 'Window-lit portrait in soft morning light' }) },
        { _key: 'img2', ...imageRef(editorial, { alt: 'Portrait study with natural grain' }) },
      ],
    },
    {
      _id: 'project-form-and-void',
      _type: 'project',
      title: 'Form & Void',
      slug: { _type: 'slug', current: 'form-and-void' },
      category: 'editorial',
      year: 2024,
      client: 'Kinfolk',
      description:
        'Abstract editorial still life focusing on high contrast shadows and minimal forms, reducing objects to their pure geometric essence.',
      story:
        'A tabletop, a north window, and a set of found objects sprayed matte grey. The series reduces photography to its first principles: a form, the void around it, and the line where they meet.\n\nEach arrangement was left standing for a full day so we could shoot it at three different light angles and keep only one.',
      format: 'digital',
      camera: 'Fujifilm GFX 100 II',
      lenses: ['GF 110mm f/2'],
      featured: true,
      order: 5,
      coverImage: imageRef(still, { alt: 'Minimal still life with high contrast shadow' }),
      images: [
        { _key: 'img1', ...imageRef(still, { alt: 'Minimal still life with high contrast shadow' }) },
        { _key: 'img2', ...imageRef(portrait, { alt: 'Geometric form study in grey' }) },
      ],
    },
    {
      _id: 'about',
      _type: 'about',
      bio: 'I am a photographer obsessed with the space between light and dark. My work explores narrative through absence, finding cinematic moments in quiet observations. Based in New York, working globally.',
      portrait: imageRef(aboutPortrait, { alt: 'Portrait of the photographer' }),
      skills: ['Editorial', 'Campaign', 'Portrait', 'Fine art printing'],
      contactEmail: 'studio@cameraeye.com',
      instagramHandle: 'cameraeye.studio',
    },
  ];

  let tx = client.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();
  console.log(`seeded ${docs.length} documents into ${client.config().projectId}/${client.config().dataset}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
