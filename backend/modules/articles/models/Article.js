/**
 * Modèle Article
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Article extends BaseModel {
  constructor() {
    super('articles', 'id_article');
  }
}
