import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const python=existsSync(path.join(root,'.venv','Scripts','python.exe'))?path.join(root,'.venv','Scripts','python.exe'):'python';
const env={...process.env,PYTHONPATH:[root,path.join(root,'.python-packages'),process.env.PYTHONPATH].filter(Boolean).join(path.delimiter),PYTHONIOENCODING:'utf-8'};
const production=process.argv.includes('--production');
const children=[spawn(python,['-m','uvicorn','backend.app.main:app','--host','127.0.0.1','--port',process.env.BACKEND_PORT||'8000'],{stdio:'inherit',env,windowsHide:true}),spawn(process.execPath,['node_modules/next/dist/bin/next',production?'start':'dev','--hostname','127.0.0.1'],{stdio:'inherit',env,windowsHide:true})];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exitCode=code;}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
for(const child of children){child.on('error',error=>{console.error(error.message);stop(1);});child.on('exit',code=>{if(!stopping)stop(code??1);});}
