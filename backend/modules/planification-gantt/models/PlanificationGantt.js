/**
 * Modèle PlanificationGantt
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class PlanificationGantt extends BaseModel {
  constructor() {
    super('planification_gantt', 'id_planification');
  }
}
