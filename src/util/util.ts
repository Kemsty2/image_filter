import fs from 'fs';
import Jimp = require('jimp');
import jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';
import {Request, Response} from 'express';
import {config} from './config';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        const photo = await Jimp.read(inputURL);
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname+outpath, (img)=>{
            resolve(__dirname+outpath);
        });
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

//  generateJWT
//  helper function to generate new JWT Payload containing random information
//  INPUTS
//      info: string, jwt_secret: string
export function generateJWT(info:string){
    return jwt.sign(info, config.jwt_secret);
}

//  requireAuth
//  helper funciton to authenticate server endpoint
//  INPUTS
//      req: Request, res: Response, next: NextFunction
export function requireAuth(req: Request, res: Response, next: NextFunction){
    if(!req.headers || !req.headers.authorization){
        return res.status(401).send('No authorization token');
    }

    const token_bearer = req.headers.authorization.split(' ');
    if(token_bearer.length != 2){
        return res.status(401).send('Malformed token');
    }

    const token = token_bearer[1];
    return jwt.verify(token, config.jwt_secret, (err:Error) => {
        if(err){
            return res.status(401).send('Failed to authenticate');
        }
        return next();
    })
}