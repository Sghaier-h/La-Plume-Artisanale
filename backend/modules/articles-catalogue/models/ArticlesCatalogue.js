/**
 * Modèle ArticlesCatalogue
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class ArticlesCatalogue extends BaseModel {
  constructor() {
    super('articles_catalogue');
    this._tableName = 'articles_catalogue';
    this._idField = 'id_article';
  }
}
