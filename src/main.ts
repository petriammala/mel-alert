import {readFileSync} from 'fs'
import {getData} from "./data";

readFileSync(process.argv[2] ?? '.env')
    .toString()
    .split('\n')
    .filter(line => line.trim() != '' && !line.startsWith('#'))
    .map(line => line.split('='))
    .forEach(([name, value]) => process.env[name] = value)

getData().catch(err => console.error(err))
