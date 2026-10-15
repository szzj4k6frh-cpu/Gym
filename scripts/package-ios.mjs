import {execFileSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
execFileSync(process.execPath,['scripts/build-ios-web.mjs'],{cwd:root,stdio:'inherit'});
await mkdir(new URL('../downloads/',import.meta.url),{recursive:true});
const script=`
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path.cwd()
source=root/'ios'
output=root/'downloads/Gym-iPhone.zip'
items=['Gym.xcodeproj','Gym','GymActivity','Core','Shared','CoreTests','Package.swift','README.md']
with ZipFile(output,'w',ZIP_DEFLATED,compresslevel=9) as archive:
 for item in items:
  entry=source/item
  if not entry.exists():raise FileNotFoundError(entry)
  for path in sorted(entry.rglob('*')) if entry.is_dir() else [entry]:
   if path.is_file() and not any(part in ['xcuserdata','.DS_Store','DerivedData','.build'] for part in path.parts):
    archive.write(path,'Gym/'+str(path.relative_to(source)))
print('Download: downloads/Gym-iPhone.zip')
`;
execFileSync('python3',['-c',script],{cwd:root,stdio:'inherit'});
