import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idocument, Document } from '../schema/document.schema'
import {DocumentType} from '../entity/document.entity';
import * as fs from 'fs'
import { TagService } from 'src/tag/tag.service';

@Injectable()
export class DocumentService {
    constructor(@InjectModel('Document') private DocumentModel: Model<Idocument>, private readonly TagService: TagService) {}
    create(documentData: DocumentType) {
        const newDocument = new this.DocumentModel({
            name: documentData.name,
            tags: documentData.tags,
        })
        newDocument.save()
        console.log(1)
    }

    findAll(id: string): Promise<Idocument[]>{
        return this.DocumentModel.find({tags: {$elemMatch: {$eq: id}}}).exec()
    }

    dfs() {
        const regex = /(\d{4})(\d{2})(\d{2})-(\d)/

        const tagHelper = (filename: string, regex: RegExp): string[] => {
            const match = filename.match(regex)
            const ret: string[] = []

            if(match !== null) {
                ret.push(Number(match[1]) + '년')
                ret.push(Number(match[2]) + '월')
                ret.push('문항: ' + Number(match[3]) + '번')
                ret.push('정답: ' + Number(match[4]) + '번')
            }

            return ret
        }

        fs.readdir('../../data', (err, files) => {
            files.forEach(file => {
                const newDocument = new this.DocumentModel({
                    name: file,
                    tags: tagHelper(file, regex),
                })
                newDocument.save()
            });
        });
    }

    async updateTag() {
        const files = await this.DocumentModel.find({}).exec()
        files.forEach((file) => {
            const tags = file.tags
            tags.forEach(async (tag, index, tags) => {
                await this.TagService.update(tag, tags, index)
            })
        })
    }
}
