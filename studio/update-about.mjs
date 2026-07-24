/**
 * Updates the `about` document with the Walden View identity (keeps the
 * existing portrait asset). Bio is a placeholder until the artist writes
 * the real one in the Studio.
 *
 * Run from studio/: pnpm exec sanity exec update-about.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2024-07-23' });

async function run() {
  const existing = await client.fetch('*[_type == "about"][0]{ portrait }');

  await client.createOrReplace({
    _id: 'about',
    _type: 'about',
    bio: '거리에서 마주치는 일상의 장면을 기록합니다. 스쳐 지나가는 순간 속에서 조용한 이야기를 찾습니다.\n\nI photograph everyday scenes met on the street — looking for quiet stories inside passing moments. Based in South Korea.',
    ...(existing?.portrait ? { portrait: existing.portrait } : {}),
    skills: ['Street', 'Documentary', 'Fine art printing'],
    contactEmail: 'hermitsdiner@gmail.com',
    instagramHandle: 'hermitsdiner',
  });
  console.log('about document updated for Walden View');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
