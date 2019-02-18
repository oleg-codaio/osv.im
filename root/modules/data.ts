import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

function ensure<T>(value: T | undefined | null, id?: string): T {
  if (!value) {
    throw new Error(`Value is not truthy: ${id}`);
  }

  return value;
}

const StaticDataDir = path.join(__dirname, '..', '..', 'assets', 'data');
export const MediumDataFile = path.join(StaticDataDir, 'medium.json');

interface MediumPost {
  title: string;
  previewContent: {
    subtitle: string;
  };
  uniqueSlug: string;
  firstPublishedAt: string;
  virtuals: {
    previewImage: {
      imageId: string;
    };
    totalClapCount: number;
    readingTime: number;
  };
}

interface MediumData {
  payload: {
    references: {
      Post: MediumPost[];
    };
    user: {
      imageId: string;
      username: string;
      name: string;
    };
  };
}

/** Fetch all external data to generate the site. */
export default function fetchData(this: any) {
  function writeData(path: string, data: any): void {
    fs.ensureFileSync(path);
    fs.writeJsonSync(path, data);
  }

  async function getMediumPosts() {
    const res = await axios.get('https://medium.com/@osv/latest?format=json', {responseType: 'text'});
    const body: MediumData = JSON.parse(res.data.replace('])}while(1);</x>', ''));
    const posts = Object.values(body.payload.references.Post).map(post => {
      const title = ensure(post.title, 'title');
      const image = `https://miro.medium.com/fit/c/240/240/${ensure(post.virtuals.previewImage.imageId)}`;
      const subtitle = ensure(post.previewContent.subtitle, 'subtitle');
      const url =
        `https://medium.com/@${ensure(body.payload.user.username, 'username')}` +
        `/${ensure(post.uniqueSlug, 'uniqueSlug')}`;
      const date = post.firstPublishedAt;
      const claps = post.virtuals.totalClapCount;
      const readingTime = Math.round(post.virtuals.readingTime);
      return {title, image, subtitle, url, date, claps, readingTime};
    });

    const user = {
      image: `https://miro.medium.com/fit/c/80/80/${body.payload.user.imageId}`,
      name: body.payload.user.name,
      username: body.payload.user.username,
    };

    return {user, posts};
  }

  this.nuxt.hook('build:before', async () => {
    fs.emptyDir(StaticDataDir);
    await Promise.all([writeData(MediumDataFile, await getMediumPosts())]);
  });
}
