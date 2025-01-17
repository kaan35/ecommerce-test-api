export class ProductsQueryBuilder {
  #query;

  constructor() {
    this.reset();
  }

  reset() {
    this.#query = [];
    return this;
  }

  match(filter = {}) {
    this.#query.push({ $match: filter });
    return this;
  }

  sort(sortOptions = {}) {
    this.#query.push({ $sort: sortOptions });
    return this;
  }

  paginate(page, limit) {
    const skip = (page - 1) * limit;
    this.#query.push({ $skip: skip }, { $limit: limit });
    return this;
  }

  withTotalCount() {
    this.#query.push({
      $facet: {
        data: [],
        totalCount: [{ $count: 'count' }],
      },
    });
    return this;
  }

  build() {
    return [...this.#query];
  }
}
