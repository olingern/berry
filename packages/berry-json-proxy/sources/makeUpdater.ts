import {existsSync, readFile, writeFile} from 'fs';
import {promisify}                       from 'util';

import {makeTracker}                     from './makeTracker';

const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);

export async function makeUpdater(filename: string) {
  let indent = `  `;
  let obj;

  if (existsSync(filename)) {
    const content = await readFileP(filename, `utf8`);
    const indentMatch = content.match(/^[ \t]+/m);
    
    if (indentMatch)
      indent = indentMatch[0];

    obj = JSON.parse(content || `{}`);
  }
  
  if (!obj)
    obj = {};
  
  const tracker = makeTracker(obj);
  const initial = tracker.immutable;

  return {
    open(cb: (value: Object) => void) {
      tracker.open(cb);
    },
    async save() {
      if (tracker.immutable === initial)
        return;

      const data = JSON.stringify(tracker.immutable, null, indent) + `\n`;
      await writeFileP(filename, data);
    }
  };
}

export async function updateAndSave(filename: string, cb: (value: Object) => void) {
  const updater = await makeUpdater(filename);
  updater.open(cb);
  await updater.save();
}
