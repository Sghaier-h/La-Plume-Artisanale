/**
 * QueryBuilder - Construction de requêtes SQL paramétrées
 * Remplace le pattern paramCount dupliqué dans les controllers
 *
 * Usage:
 *   const qb = new QueryBuilder('clients', 'c')
 *     .select(['c.id_client', 'c.raison_sociale'])
 *     .join('LEFT JOIN categories_clients cat ON c.id_categorie = cat.id_categorie')
 *     .where('c.actif = $?', true)
 *     .search(['c.raison_sociale', 'c.code_client'], searchTerm)
 *     .orderBy('c.date_creation DESC')
 *     .paginate(page, limit);
 *
 *   const { query, params } = qb.build();
 *   const { query: countQuery, params: countParams } = qb.buildCount();
 */

export class QueryBuilder {
  constructor(tableName, alias = null) {
    this._tableName = alias ? `${tableName} ${alias}` : tableName;
    this._alias = alias || tableName;
    this._selectFields = ['*'];
    this._joins = [];
    this._conditions = [];
    this._params = [];
    this._orderBy = null;
    this._limit = null;
    this._offset = 0;
    this._groupBy = null;
    this._having = null;
  }

  /**
   * Définit les champs SELECT
   */
  select(fields) {
    if (typeof fields === 'string') {
      this._selectFields = [fields];
    } else if (Array.isArray(fields)) {
      this._selectFields = fields;
    }
    return this;
  }

  /**
   * Ajoute un champ SELECT
   */
  addSelect(field) {
    if (this._selectFields.length === 1 && this._selectFields[0] === '*') {
      this._selectFields = [];
    }
    this._selectFields.push(field);
    return this;
  }

  /**
   * Ajoute un SELECT brut (sous-requête, etc.)
   */
  selectRaw(rawSql) {
    if (this._selectFields.length === 1 && this._selectFields[0] === '*') {
      this._selectFields = [];
    }
    this._selectFields.push(rawSql);
    return this;
  }

  /**
   * Ajoute un JOIN
   */
  join(joinClause) {
    this._joins.push(joinClause);
    return this;
  }

  /**
   * Ajoute une condition WHERE avec paramètre
   * Utilise $? comme placeholder auto-incrémenté
   */
  where(condition, ...values) {
    if (values.length === 0) {
      // Condition sans paramètre (ex: "c.actif = true")
      this._conditions.push(condition);
    } else {
      // Remplacer chaque $? par $N
      let resolvedCondition = condition;
      for (const value of values) {
        this._params.push(value);
        resolvedCondition = resolvedCondition.replace('$?', `$${this._params.length}`);
      }
      this._conditions.push(resolvedCondition);
    }
    return this;
  }

  /**
   * Ajoute une condition WHERE seulement si la valeur est définie
   */
  whereIf(condition, value) {
    if (value !== undefined && value !== null && value !== '') {
      return this.where(condition, value);
    }
    return this;
  }

  /**
   * Ajoute une condition WHERE pour un booléen (gère la conversion string → boolean)
   */
  whereBool(condition, value) {
    if (value !== undefined && value !== null && value !== '') {
      const boolValue = value === 'true' || value === true;
      return this.where(condition, boolValue);
    }
    return this;
  }

  /**
   * Ajoute une recherche ILIKE sur plusieurs champs
   */
  search(fields, searchTerm) {
    if (!searchTerm) return this;

    this._params.push(`%${searchTerm}%`);
    const paramIndex = this._params.length;
    const searchConditions = fields.map(field => `${field} ILIKE $${paramIndex}`);
    this._conditions.push(`(${searchConditions.join(' OR ')})`);
    return this;
  }

  /**
   * Recherche ILIKE avec sous-requêtes EXISTS
   */
  searchWithExists(fields, existsClauses, searchTerm) {
    if (!searchTerm) return this;

    this._params.push(`%${searchTerm}%`);
    const paramIndex = this._params.length;
    const conditions = [
      ...fields.map(field => `${field} ILIKE $${paramIndex}`),
      ...existsClauses.map(clause => clause.replace(/\$\?/g, `$${paramIndex}`))
    ];
    this._conditions.push(`(${conditions.join(' OR ')})`);
    return this;
  }

  /**
   * Ajoute un filtre de plage de dates
   */
  dateRange(field, startDate, endDate) {
    if (startDate) {
      this._params.push(startDate);
      this._conditions.push(`${field} >= $${this._params.length}`);
    }
    if (endDate) {
      this._params.push(endDate);
      this._conditions.push(`${field} <= $${this._params.length}`);
    }
    return this;
  }

  /**
   * Ajoute un ORDER BY
   */
  orderBy(orderClause) {
    this._orderBy = orderClause;
    return this;
  }

  /**
   * Ajoute GROUP BY
   */
  groupBy(groupClause) {
    this._groupBy = groupClause;
    return this;
  }

  /**
   * Ajoute HAVING
   */
  having(havingClause, ...values) {
    let resolved = havingClause;
    for (const value of values) {
      this._params.push(value);
      resolved = resolved.replace('$?', `$${this._params.length}`);
    }
    this._having = resolved;
    return this;
  }

  /**
   * Ajoute pagination (page commence à 1)
   */
  paginate(page = 1, limit = 20) {
    this._limit = Math.min(Math.max(1, limit), 100);
    this._offset = (Math.max(1, page) - 1) * this._limit;
    return this;
  }

  /**
   * Construit la requête SELECT complète
   * @returns {{ query: string, params: any[] }}
   */
  build() {
    let query = `SELECT ${this._selectFields.join(', ')} FROM ${this._tableName}`;

    if (this._joins.length > 0) {
      query += ' ' + this._joins.join(' ');
    }

    if (this._conditions.length > 0) {
      query += ' WHERE ' + this._conditions.join(' AND ');
    }

    if (this._groupBy) {
      query += ` GROUP BY ${this._groupBy}`;
    }

    if (this._having) {
      query += ` HAVING ${this._having}`;
    }

    if (this._orderBy) {
      query += ` ORDER BY ${this._orderBy}`;
    }

    if (this._limit !== null) {
      query += ` LIMIT ${this._limit} OFFSET ${this._offset}`;
    }

    return { query, params: [...this._params] };
  }

  /**
   * Construit la requête COUNT correspondante
   * @returns {{ query: string, params: any[] }}
   */
  buildCount() {
    let query = `SELECT COUNT(*) as total FROM ${this._tableName}`;

    if (this._joins.length > 0) {
      query += ' ' + this._joins.join(' ');
    }

    if (this._conditions.length > 0) {
      query += ' WHERE ' + this._conditions.join(' AND ');
    }

    if (this._groupBy) {
      query += ` GROUP BY ${this._groupBy}`;
      // Si GROUP BY, on wrape dans un COUNT
      query = `SELECT COUNT(*) as total FROM (${query}) as grouped`;
    }

    return { query, params: [...this._params] };
  }

  /**
   * Exécute la requête et retourne les résultats avec pagination
   * @param {import('pg').Pool} pool
   * @returns {{ data: any[], pagination: { page: number, limit: number, total: number, totalPages: number } }}
   */
  async execute(pool) {
    const { query: countQuery, params: countParams } = this.buildCount();
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    const { query, params } = this.build();
    const result = await pool.query(query, params);

    const page = this._limit ? Math.floor(this._offset / this._limit) + 1 : 1;
    const limit = this._limit || result.rows.length;

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }
}

export default QueryBuilder;
