/**
 * Modèle ExcelImport
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class ExcelImport extends BaseModel {
  constructor() {
    super('excel_import', 'id_excel');
  }
}
